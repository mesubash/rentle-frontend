"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import {
  platformApi,
  type PermissionResponse,
  type RoleResponse,
} from "@/lib/api/platform";
import { P } from "@/lib/iam/permission-keys";
import { Can, useCan } from "./can";
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
    <div className="space-y-5">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Access control</p>
          <h1>Roles</h1>
          <p>Bundle permissions into clear staff responsibilities. Changes apply on each person&apos;s next request.</p>
        </div>
        <Can perm={P.PLATFORM_ROLE_MANAGE}>
          <Button onClick={() => setCreating(true)}><Plus /> New role</Button>
        </Can>
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(240px,0.7fr)_minmax(0,1.5fr)]">
          <Skeleton className="h-80" />
          <Skeleton className="h-[32rem]" />
        </div>
      ) : roles.length ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(240px,0.7fr)_minmax(0,1.5fr)]">
          <section className="overflow-hidden rounded-lg border bg-card">
            <div className="border-b px-4 py-3">
              <h2 className="text-base font-semibold">Role catalog</h2>
              <p className="mt-1 text-sm text-muted-foreground">{roles.length} available</p>
            </div>
            <div className="divide-y">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  className={`w-full px-4 py-3 text-left transition-colors hover:bg-accent ${selectedId === role.id ? "bg-accent" : ""}`}
                  onClick={() => setSelectedId(role.id)}
                >
                  <span className="flex items-center justify-between gap-3">
                    <strong className="text-sm">{role.displayName}</strong>
                    {role.systemRole && <Badge variant="secondary">System</Badge>}
                  </span>
                  <span className="mt-1 block font-mono text-xs text-muted-foreground">{role.name}</span>
                  <span className="mt-2 block text-xs text-muted-foreground">{role.permissionKeys.length} permissions</span>
                </button>
              ))}
            </div>
          </section>

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
        <section className="empty-state card">
          <ShieldCheck />
          <h2>No roles are available.</h2>
          <p>The backend catalog has not returned any role bundles yet.</p>
        </section>
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
    <section className="rounded-lg border bg-card p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{role.displayName}</h2>
            {role.systemRole && <Badge variant="secondary">System role</Badge>}
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{role.name}</p>
        </div>
        <Can perm={P.PLATFORM_ROLE_MANAGE}>
          {!role.systemRole && (
            <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 /> Delete
            </Button>
          )}
        </Can>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`display-${role.id}`}>Display name</Label>
          <Input id={`display-${role.id}`} value={displayName} disabled={!canManage} maxLength={120} onChange={(event) => setDisplayName(event.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`description-${role.id}`}>Description</Label>
          <Textarea id={`description-${role.id}`} value={description} disabled={!canManage} maxLength={300} onChange={(event) => setDescription(event.target.value)} />
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <Label>Permissions</Label>
            <p className="mt-1 text-sm text-muted-foreground">{selected.size} selected</p>
          </div>
        </div>

        {superAdmin && (
          <div className="mb-3 rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
            System role — always holds every permission. Its permission set cannot be edited.
          </div>
        )}

        <Can
          perm={P.PLATFORM_PERMISSION_READ}
          fallback={
            <div className="rounded-md border bg-muted px-3 py-4 text-sm text-muted-foreground">
              <p>Your access does not include permission catalog descriptions.</p>
              <ul className="mt-3 space-y-1">
                {role.permissionKeys.map((key) => <li className="break-all font-mono text-xs" key={key}>{key}</li>)}
              </ul>
            </div>
          }
        >
          <PermissionMatrix
            permissions={permissions}
            selected={selected}
            disabled={matrixDisabled}
            onChange={setSelected}
          />
        </Can>
      </div>

      {error && <p className="mt-4 text-sm text-destructive" role="alert">{error}</p>}

      <Can perm={P.PLATFORM_ROLE_MANAGE}>
        <div className="mt-5 flex justify-end">
          <Button disabled={saving || !displayName.trim()} onClick={save}>
            {saving ? "Saving…" : "Save role"}
          </Button>
        </div>
      </Can>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {role.displayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Roles with live assignments cannot be deleted. This action cannot be undone.
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

  const close = (next: boolean) => {
    if (!next && !saving) {
      setName("");
      setDisplayName("");
      setDescription("");
      setSelected(new Set());
      setError("");
    }
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
      setName("");
      setDisplayName("");
      setDescription("");
      setSelected(new Set());
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
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create role</DialogTitle>
          <DialogDescription>Create a named permission bundle for staff assignments.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="new-role-name">Role name</Label>
            <Input
              id="new-role-name"
              value={name}
              maxLength={60}
              placeholder="KYC_HELPER"
              onChange={(event) => setName(event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))}
            />
            <p className="text-xs text-muted-foreground">Uppercase letters, numbers, and underscores. The name is immutable after creation.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-role-display">Display name</Label>
            <Input id="new-role-display" value={displayName} maxLength={120} onChange={(event) => setDisplayName(event.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="new-role-description">Description</Label>
            <Textarea id="new-role-description" value={description} maxLength={300} onChange={(event) => setDescription(event.target.value)} />
          </div>
        </div>

        <div>
          <Label>Permissions ({selected.size} selected)</Label>
          <div className="mt-2">
            <PermissionMatrix permissions={permissions} selected={selected} onChange={setSelected} />
          </div>
        </div>

        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

        <DialogFooter>
          <Button variant="outline" disabled={saving} onClick={() => close(false)}>Cancel</Button>
          <Button disabled={saving || !nameValid || !displayName.trim()} onClick={create}>
            {saving ? "Creating…" : "Create role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PermissionMatrix({
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
    const groups = new Map<string, PermissionResponse[]>();
    for (const permission of permissions) {
      const group = groups.get(permission.domain) ?? [];
      group.push(permission);
      groups.set(permission.domain, group);
    }
    return Array.from(groups.entries()).sort(([left], [right]) => {
      const leftIndex = DOMAIN_ORDER.indexOf(left);
      const rightIndex = DOMAIN_ORDER.indexOf(right);
      return (leftIndex < 0 ? 99 : leftIndex) - (rightIndex < 0 ? 99 : rightIndex) || left.localeCompare(right);
    });
  }, [permissions]);

  if (!permissions.length) {
    return <p className="rounded-md border bg-muted px-3 py-4 text-sm text-muted-foreground">No active permissions are available.</p>;
  }

  const toggle = (key: string) => {
    if (disabled) return;
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  return (
    <div className="max-h-[28rem] space-y-4 overflow-y-auto rounded-md border p-3">
      {grouped.map(([domain, entries]) => (
        <fieldset key={domain} className="space-y-2">
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{domain}</legend>
          {entries.map((permission) => (
            <label key={permission.id} className="flex items-start gap-3 rounded-md border px-3 py-2 hover:bg-accent">
              <Checkbox
                className="mt-0.5"
                checked={selected.has(permission.key)}
                disabled={disabled}
                onCheckedChange={() => toggle(permission.key)}
              />
              <span className="min-w-0">
                <span className="block break-all font-mono text-xs font-medium">{permission.key}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{permission.description}</span>
              </span>
            </label>
          ))}
        </fieldset>
      ))}
    </div>
  );
}

function messageOf(caught: unknown, fallback: string) {
  return caught instanceof ApiError ? caught.message : fallback;
}
