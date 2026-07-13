"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import {
  platformApi,
  type PermissionResponse,
  type RoleResponse,
} from "@/lib/api/platform";
import { P } from "@/lib/iam/permission-keys";
import { cn } from "@/lib/utils";
import { Can, useCan } from "./can";
import { AdminCount, AdminEmptyState, AdminPageHeader, humanize } from "./admin-ui";
import { usePermissions } from "./permissions-provider";
import { useToast } from "./toast-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";
import { Textarea } from "./ui/textarea";

const DOMAIN_ORDER = ["platform", "identity", "kyc", "listing", "booking"];
const ACTION_ORDER = ["read", "list", "view", "create", "manage", "update", "approve", "reject", "delete"];

export function AdminRolesView() {
  const { can } = usePermissions();
  const { showToast } = useToast();
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const loadRoles = async (preferredId?: string) => {
    try {
      const result = await platformApi.roles();
      setRoles(result);
      setSelectedId((current) =>
        preferredId && result.some((role) => role.id === preferredId)
          ? preferredId
          : result.some((role) => role.id === current)
            ? current
            : result[0]?.id ?? "",
      );
      setError("");
    } catch (caught) {
      setError(messageOf(caught, "Roles could not be loaded."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    platformApi.roles()
      .then((result) => {
        if (!active) return;
        setRoles(result);
        setSelectedId(result[0]?.id ?? "");
      })
      .catch((caught) => {
        if (active) setError(messageOf(caught, "Roles could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    if (can(P.PLATFORM_PERMISSION_READ)) {
      platformApi.permissions()
        .then((result) => {
          if (active) setPermissions(result.filter((permission) => !permission.deprecated));
        })
        .catch((caught) => {
          if (active) showToast(messageOf(caught, "The permission catalog could not be loaded."), { tone: "error" });
        });
    }

    return () => {
      active = false;
    };
  }, [can, showToast]);

  const selected = roles.find((role) => role.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Access control"
        description="Bundle permissions into staff roles. Changes apply on each person’s next request."
        actions={<><AdminCount>{roles.length} roles</AdminCount><Can perm={P.PLATFORM_ROLE_MANAGE}><Button onClick={() => setCreating(true)}><Plus /> New role</Button></Can></>}
      />

      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p>}

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <Skeleton className="h-64" />
          <Skeleton className="h-[30rem]" />
        </div>
      ) : roles.length ? (
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <RoleRail roles={roles} selectedId={selectedId} onSelect={setSelectedId} />

          {selected && (
            <RoleEditor
              key={`${selected.id}:${selected.permissionKeys.join(",")}`}
              role={selected}
              permissions={permissions}
              onSaved={(updated) => {
                setRoles((current) => current.map((role) => role.id === updated.id ? updated : role));
                showToast("Role updated.", { tone: "success" });
              }}
              onDeleted={async () => {
                await loadRoles();
                showToast("Role deleted.", { tone: "success" });
              }}
            />
          )}
        </div>
      ) : (
        <AdminEmptyState icon={ShieldCheck} title="No roles are available" description="The backend catalog has not returned any role bundles yet." />
      )}

      <CreateRoleDialog
        open={creating}
        onOpenChange={setCreating}
        permissions={permissions}
        onCreated={async (role) => {
          await loadRoles(role.id);
          showToast("Role created.", { tone: "success" });
        }}
      />
    </div>
  );
}

/**
 * Desktop: a vertical rail. Mobile: a horizontal scroll strip of role chips.
 * One borderless surface either way — the selected item carries an accent bar.
 */
function RoleRail({
  roles,
  selectedId,
  onSelect,
}: {
  roles: RoleResponse[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav
      aria-label="Role catalog"
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0"
    >
      {roles.map((role) => {
        const active = role.id === selectedId;
        return (
          <button
            key={role.id}
            type="button"
            aria-current={active}
            onClick={() => onSelect(role.id)}
            className={cn(
              "shrink-0 rounded-lg border-0 bg-transparent px-3 py-2.5 text-left shadow-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring lg:w-full lg:border-l-2",
              active
                ? "bg-accent lg:border-primary"
                : "hover:bg-muted lg:border-transparent",
            )}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm font-semibold whitespace-nowrap">{role.displayName}</span>
              {role.systemRole && <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">System</Badge>}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground whitespace-nowrap">
              {role.permissionKeys.length} {role.permissionKeys.length === 1 ? "permission" : "permissions"}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function RoleEditor({
  role,
  permissions,
  onSaved,
  onDeleted,
}: {
  role: RoleResponse;
  permissions: PermissionResponse[];
  onSaved: (role: RoleResponse) => void;
  onDeleted: () => Promise<void>;
}) {
  const canManage = useCan(P.PLATFORM_ROLE_MANAGE);
  const [displayName, setDisplayName] = useState(role.displayName);
  const [description, setDescription] = useState(role.description ?? "");
  const [selected, setSelected] = useState(() => new Set(role.permissionKeys));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const superAdmin = role.name === "SUPER_ADMIN";
  const matrixDisabled = !canManage || superAdmin;

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await platformApi.updateRole(role.id, {
        displayName: displayName.trim(),
        description: description.trim(),
        permissionKeys: Array.from(selected).sort(),
      });
      onSaved(updated);
    } catch (caught) {
      setError(messageOf(caught, "The role could not be updated."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    setError("");
    try {
      await platformApi.deleteRole(role.id);
      setConfirmDelete(false);
      await onDeleted();
    } catch (caught) {
      setError(messageOf(caught, "The role could not be deleted."));
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-semibold sm:text-xl">{role.displayName}</h2>
            {role.systemRole && <Badge variant="secondary">System</Badge>}
          </div>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{role.name}</p>
        </div>
        <Can perm={P.PLATFORM_ROLE_MANAGE}>
          {!role.systemRole && (
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 /> Delete
            </Button>
          )}
        </Can>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(14rem,0.55fr)_minmax(20rem,1fr)]">
        <div className="space-y-1.5">
          <Label htmlFor={`display-${role.id}`}>Display name</Label>
          <Input id={`display-${role.id}`} value={displayName} disabled={!canManage} maxLength={120} onChange={(event) => setDisplayName(event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`description-${role.id}`}>Description</Label>
          <Textarea
            id={`description-${role.id}`}
            rows={1}
            className="min-h-9 resize-none py-2"
            value={description}
            disabled={!canManage}
            maxLength={300}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <Label>Permissions</Label>
          <span className="text-xs text-muted-foreground">{selected.size} selected</span>
        </div>

        {superAdmin ? (
          <p className="rounded-lg bg-muted px-3 py-3 text-sm text-muted-foreground">
            The super admin always holds every permission. Its set can’t be edited.
          </p>
        ) : (
          <Can
            perm={P.PLATFORM_PERMISSION_READ}
            fallback={
              <div className="rounded-lg bg-muted px-3 py-3 text-sm text-muted-foreground">
                <p>Your access doesn’t include the permission catalog. Current keys:</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {role.permissionKeys.map((key) => <li key={key}><code className="rounded bg-background px-1.5 py-0.5 font-mono text-xs">{key}</code></li>)}
                </ul>
              </div>
            }
          >
            <PermissionTree
              permissions={permissions}
              selected={selected}
              disabled={matrixDisabled}
              onChange={setSelected}
            />
          </Can>
        )}
      </div>

      {error && <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p>}

      <Can perm={P.PLATFORM_ROLE_MANAGE}>
        {!superAdmin && (
          <div className="sticky bottom-0 z-10 mt-5 flex justify-end gap-2 border-t bg-background/95 py-3 backdrop-blur supports-backdrop-filter:bg-background/60">
            <Button disabled={saving || !displayName.trim()} onClick={save}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        )}
      </Can>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {role.displayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Roles with live assignments can’t be deleted. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={deleting} onClick={(event) => { event.preventDefault(); remove(); }}>
              {deleting ? "Deleting…" : "Delete role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function CreateRoleDialog({
  open,
  onOpenChange,
  permissions,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissions: PermissionResponse[];
  onCreated: (role: RoleResponse) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const nameValid = /^[A-Z][A-Z0-9_]*$/.test(name);

  const reset = () => {
    setName("");
    setDisplayName("");
    setDescription("");
    setSelected(new Set());
    setError("");
  };

  const close = (next: boolean) => {
    if (!next && !saving) reset();
    onOpenChange(next);
  };

  const create = async () => {
    setSaving(true);
    setError("");
    try {
      const role = await platformApi.createRole({
        name: name.trim(),
        displayName: displayName.trim(),
        description: description.trim(),
        permissionKeys: Array.from(selected).sort(),
      });
      reset();
      onOpenChange(false);
      await onCreated(role);
    } catch (caught) {
      setError(messageOf(caught, "The role could not be created."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="flex max-h-[92vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Create role</DialogTitle>
          <DialogDescription>A named permission bundle you can assign to staff.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-role-name">Role name</Label>
              <Input
                id="new-role-name"
                value={name}
                maxLength={60}
                placeholder="KYC_HELPER"
                className="font-mono"
                onChange={(event) => setName(event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))}
              />
              <p className="text-xs text-muted-foreground">Uppercase, numbers, underscores. Fixed after creation.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-role-display">Display name</Label>
              <Input id="new-role-display" value={displayName} maxLength={120} placeholder="KYC Helper" onChange={(event) => setDisplayName(event.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="new-role-description">Description</Label>
              <Textarea id="new-role-description" rows={2} value={description} maxLength={300} onChange={(event) => setDescription(event.target.value)} />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <Label>Permissions</Label>
              <span className="text-xs text-muted-foreground">{selected.size} selected</span>
            </div>
            <PermissionTree permissions={permissions} selected={selected} onChange={setSelected} />
          </div>

          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p>}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" disabled={saving} onClick={() => close(false)}>Cancel</Button>
          <Button disabled={saving || !nameValid || !displayName.trim()} onClick={create}>
            {saving ? "Creating…" : "Create role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PermissionTree({
  permissions,
  selected,
  disabled = false,
  onChange,
}: {
  permissions: PermissionResponse[];
  selected: Set<string>;
  disabled?: boolean;
  onChange: (selected: Set<string>) => void;
}) {
  const grouped = useMemo(() => {
    const groups = new Map<string, Map<string, PermissionResponse[]>>();
    for (const permission of permissions) {
      const resources = groups.get(permission.domain) ?? new Map<string, PermissionResponse[]>();
      const entries = resources.get(permission.resource) ?? [];
      entries.push(permission);
      resources.set(permission.resource, entries);
      groups.set(permission.domain, resources);
    }

    return Array.from(groups.entries())
      .map(([domain, resources]) => ({
        domain,
        id: `domain:${domain}`,
        label: humanize(domain),
        resources: Array.from(resources.entries())
          .map(([resource, entries]) => ({
            resource,
            id: `resource:${domain}:${resource}`,
            label: humanize(resource),
            permissions: entries.sort(comparePermissions),
          }))
          .sort((left, right) => left.label.localeCompare(right.label)),
      }))
      .sort((left, right) => {
        const leftIndex = DOMAIN_ORDER.indexOf(left.domain);
        const rightIndex = DOMAIN_ORDER.indexOf(right.domain);
        return (leftIndex < 0 ? 99 : leftIndex) - (rightIndex < 0 ? 99 : rightIndex) || left.label.localeCompare(right.label);
      });
  }, [permissions]);

  const defaultExpanded = useMemo(() => {
    const next = new Set<string>();
    grouped.forEach((domain, index) => {
      const selectedInDomain = domain.resources.some((resource) => resource.permissions.some((permission) => selected.has(permission.key)));
      if (index < 2 || selectedInDomain) next.add(domain.id);
      domain.resources.forEach((resource) => {
        const selectedInResource = resource.permissions.some((permission) => selected.has(permission.key));
        if (selectedInResource) next.add(resource.id);
      });
    });
    return next;
  }, [grouped, selected]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const effectiveExpanded = expanded.size ? expanded : defaultExpanded;

  if (!permissions.length) {
    return <p className="rounded-md border bg-muted px-3 py-4 text-sm text-muted-foreground">No active permissions are available.</p>;
  }

  const setKeys = (mutate: (next: Set<string>) => void) => {
    const next = new Set(selected);
    mutate(next);
    onChange(next);
  };

  const toggle = (key: string) => {
    if (disabled) return;
    setKeys((next) => (next.has(key) ? next.delete(key) : next.add(key)));
  };

  const toggleExpanded = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current.size ? current : defaultExpanded);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="max-h-[34rem] overflow-y-auto rounded-md border bg-background p-2" role="tree" aria-label="Permission tree">
      {grouped.map((domain) => {
        const domainPermissions = domain.resources.flatMap((resource) => resource.permissions);
        const domainSelected = countSelected(domainPermissions, selected);
        const domainOpen = effectiveExpanded.has(domain.id);
        return (
          <div key={domain.id} role="treeitem" aria-expanded={domainOpen} aria-selected={false}>
            <button
              type="button"
              className="flex min-h-9 w-full items-center gap-2 rounded-md border-0 bg-transparent px-2 text-left text-sm shadow-none hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onClick={() => toggleExpanded(domain.id)}
            >
              <TreeToggleIcon open={domainOpen} />
              <span className="min-w-0 flex-1 font-medium">{domain.label}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                {domainSelected}/{domainPermissions.length}
              </span>
            </button>

            {domainOpen && (
              <div className="ml-4 border-l pl-3" role="group">
                {domain.resources.map((resource) => {
                  const resourceOpen = effectiveExpanded.has(resource.id);
                  const resourceSelected = countSelected(resource.permissions, selected);
                  return (
                    <div key={resource.id} role="treeitem" aria-expanded={resourceOpen} aria-selected={false}>
                      <button
                        type="button"
                        className="flex min-h-9 w-full items-center gap-2 rounded-md border-0 bg-transparent px-2 text-left text-sm shadow-none hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        onClick={() => toggleExpanded(resource.id)}
                      >
                        <TreeToggleIcon open={resourceOpen} />
                        <span className="min-w-0 flex-1">{resource.label}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                          {resourceSelected}/{resource.permissions.length}
                        </span>
                      </button>

                      {resourceOpen && (
                        <div className="ml-4 border-l py-1 pl-3" role="group">
                          {resource.permissions.map((permission) => {
                            const checked = selected.has(permission.key);
                            return (
                              <div
                                key={permission.id}
                                className={cn(
                                  "flex min-h-9 items-start gap-2 rounded-md px-2 py-1.5 text-sm",
                                  checked && "bg-accent/50",
                                  disabled ? "opacity-70" : "hover:bg-accent",
                                )}
                                role="treeitem"
                                aria-selected={checked}
                              >
                                <Checkbox
                                  id={`permission-${permission.id}`}
                                  className="mt-0.5 size-3.5"
                                  checked={checked}
                                  disabled={disabled}
                                  onCheckedChange={() => toggle(permission.key)}
                                />
                                <label htmlFor={`permission-${permission.id}`} className={cn("min-w-0 flex-1", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
                                  <span className="block leading-tight">
                                    {permission.description || humanize(`${permission.resource} ${permission.action}`)}
                                  </span>
                                  <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground">{permission.key}</span>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TreeToggleIcon({ open }: { open: boolean }) {
  return open ? (
    <Minus className="size-3.5 shrink-0 text-muted-foreground" />
  ) : (
    <Plus className="size-3.5 shrink-0 text-muted-foreground" />
  );
}

function countSelected(permissions: PermissionResponse[], selected: Set<string>) {
  return permissions.filter((permission) => selected.has(permission.key)).length;
}

function comparePermissions(left: PermissionResponse, right: PermissionResponse) {
  const leftIndex = ACTION_ORDER.indexOf(left.action);
  const rightIndex = ACTION_ORDER.indexOf(right.action);
  return (leftIndex < 0 ? 99 : leftIndex) - (rightIndex < 0 ? 99 : rightIndex) || left.action.localeCompare(right.action);
}

function messageOf(caught: unknown, fallback: string) {
  return caught instanceof ApiError ? caught.message : fallback;
}
