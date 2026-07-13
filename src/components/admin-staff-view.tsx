"use client";

import { useEffect, useState } from "react";
import { KeyRound, Plus, Search, Trash2, UserRound } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import {
  platformApi,
  type AssignmentResponse,
  type RoleResponse,
  type UserLookupResponse,
} from "@/lib/api/platform";
import type { UserProfile } from "@/lib/api/users";
import { P } from "@/lib/iam/permission-keys";
import { Can } from "./can";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

type KnownUser = Pick<UserLookupResponse, "id" | "email" | "fullName" | "status">;

export function AdminStaffView() {
  return <AssignmentsManager />;
}

export function UserAssignmentsDialog({
  user,
  open,
  onOpenChange,
}: {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? `${user.fullName}'s staff access` : "Staff access"}</DialogTitle>
          <DialogDescription>View, grant, or revoke this person&apos;s live role assignments.</DialogDescription>
        </DialogHeader>
        {user && (
          <AssignmentsManager
            user={{ id: user.id, email: user.email, fullName: user.fullName, status: user.status }}
            compact
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AssignmentsManager({ user, compact = false }: { user?: KnownUser; compact?: boolean }) {
  const { can } = usePermissions();
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [granting, setGranting] = useState(false);
  const [revoking, setRevoking] = useState<AssignmentResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const userId = user?.id;

  const loadAssignments = async () => {
    try {
      const result = await platformApi.assignments(userId ? { userId } : {});
      setAssignments(result);
      setError("");
    } catch (caught) {
      setError(messageOf(caught, "Assignments could not be loaded."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    platformApi.assignments(userId ? { userId } : {})
      .then((result) => {
        if (active) setAssignments(result);
      })
      .catch((caught) => {
        if (active) setError(messageOf(caught, "Assignments could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    if (can(P.PLATFORM_ROLE_READ)) {
      platformApi.roles()
        .then((result) => {
          if (active) setRoles(result);
        })
        .catch((caught) => {
          if (active) showToast(messageOf(caught, "Roles could not be loaded."), { tone: "error" });
        });
    }

    return () => {
      active = false;
    };
  }, [can, showToast, userId]);

  const revoke = async () => {
    if (!revoking) return;
    setBusy(true);
    try {
      await platformApi.revokeAssignment(revoking.id);
      setRevoking(null);
      await loadAssignments();
      showToast("Role assignment revoked. The change applies on the person’s next request.", { tone: "success" });
    } catch (caught) {
      showToast(messageOf(caught, "The assignment could not be revoked."), { tone: "error", duration: 6000 });
      setRevoking(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {!compact && (
        <header className="admin-page-header">
          <div>
            <p className="eyebrow">Access control</p>
            <h1>Staff</h1>
            <p>Grant role bundles to existing Rentle accounts and review every live assignment.</p>
          </div>
          <GrantButton onClick={() => setGranting(true)} />
        </header>
      )}

      {compact && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Changes apply on the account&apos;s next request.</p>
          </div>
          <GrantButton onClick={() => setGranting(true)} requiresLookup={false} />
        </div>
      )}

      {error && <p className="form-error" role="alert">{error}</p>}

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : assignments.length ? (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                {!user && <TableHead>Person</TableHead>}
                <TableHead>Role</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Granted</TableHead>
                <TableHead className="w-24 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  {!user && (
                    <TableCell>
                      <span className="flex items-center gap-3">
                        <span className="grid size-8 place-items-center rounded-full bg-secondary text-secondary-foreground"><UserRound className="size-4" /></span>
                        <span>
                          <strong className="block text-sm">{assignment.fullName}</strong>
                          <span className="block text-xs text-muted-foreground">{assignment.email}</span>
                        </span>
                      </span>
                    </TableCell>
                  )}
                  <TableCell><Badge variant="secondary">{assignment.roleName}</Badge></TableCell>
                  <TableCell>{assignment.scopeName}</TableCell>
                  <TableCell>{formatDate(assignment.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Can perm={P.PLATFORM_ASSIGNMENT_MANAGE}>
                      <Button variant="ghost" size="icon" aria-label={`Revoke ${assignment.roleName} from ${assignment.fullName}`} onClick={() => setRevoking(assignment)}>
                        <Trash2 className="text-destructive" />
                      </Button>
                    </Can>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <section className="rounded-lg border bg-card px-5 py-10 text-center">
          <KeyRound className="mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No live assignments</h2>
          <p className="mt-1 text-sm text-muted-foreground">Grant a role when this person needs staff access.</p>
        </section>
      )}

      <GrantRoleDialog
        open={granting}
        onOpenChange={setGranting}
        roles={roles}
        user={user}
        onGranted={async () => {
          await loadAssignments();
          showToast("Role granted. The change applies on the person’s next request.", { tone: "success" });
        }}
      />

      <AlertDialog open={Boolean(revoking)} onOpenChange={(open) => !open && setRevoking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke {revoking?.roleName}?</AlertDialogTitle>
            <AlertDialogDescription>
              {revoking ? `${revoking.fullName} will lose permissions from this role on their next request.` : "This live assignment will be revoked."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" disabled={busy} onClick={(event) => { event.preventDefault(); revoke(); }}>
              {busy ? "Revoking…" : "Revoke role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function GrantButton({ onClick, requiresLookup = true }: { onClick: () => void; requiresLookup?: boolean }) {
  const button = <Button onClick={onClick}><Plus /> Grant role</Button>;
  return (
    <Can perm={P.PLATFORM_ASSIGNMENT_MANAGE}>
      <Can perm={P.PLATFORM_ROLE_READ}>
        {requiresLookup ? <Can perm={P.IDENTITY_USER_READ}>{button}</Can> : button}
      </Can>
    </Can>
  );
}

function GrantRoleDialog({
  open,
  onOpenChange,
  roles,
  user: fixedUser,
  onGranted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: RoleResponse[];
  user?: KnownUser;
  onGranted: () => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<KnownUser | null>(fixedUser ?? null);
  const [roleId, setRoleId] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setEmail("");
    setUser(fixedUser ?? null);
    setRoleId("");
    setError("");
  };

  const close = (next: boolean) => {
    if (!next && !saving && !lookingUp) reset();
    onOpenChange(next);
  };

  const lookup = async () => {
    if (!email.trim()) return;
    setLookingUp(true);
    setError("");
    try {
      setUser(await platformApi.lookupUser(email.trim()));
    } catch (caught) {
      setUser(null);
      setError(messageOf(caught, "The account could not be found."));
    } finally {
      setLookingUp(false);
    }
  };

  const grant = async () => {
    if (!user || !roleId) return;
    setSaving(true);
    setError("");
    try {
      await platformApi.createAssignment({ userId: user.id, roleId });
      reset();
      onOpenChange(false);
      await onGranted();
    } catch (caught) {
      setError(messageOf(caught, "The role could not be granted."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant role</DialogTitle>
          <DialogDescription>Assign one role at the ROOT scope to an existing Rentle account.</DialogDescription>
        </DialogHeader>

        {!fixedUser && (
          <div className="space-y-2">
            <Label htmlFor="staff-email">Account email</Label>
            <div className="flex gap-2">
              <Input id="staff-email" type="email" value={email} placeholder="person@example.com" onChange={(event) => { setEmail(event.target.value); setUser(null); }} />
              <Button variant="outline" disabled={lookingUp || !email.trim()} onClick={lookup}>
                <Search /> {lookingUp ? "Looking…" : "Look up"}
              </Button>
            </div>
          </div>
        )}

        {user && (
          <div className="rounded-md border bg-muted p-3">
            <strong className="block text-sm">{user.fullName}</strong>
            <span className="block text-sm text-muted-foreground">{user.email}</span>
            <Badge className="mt-2" variant="outline">{humanize(user.status)}</Badge>
          </div>
        )}

        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={roleId} onValueChange={setRoleId}>
            <SelectTrigger><SelectValue placeholder="Choose a role" /></SelectTrigger>
            <SelectContent>
              {roles.map((role) => <SelectItem key={role.id} value={role.id}>{role.displayName} ({role.name})</SelectItem>)}
            </SelectContent>
          </Select>
          {!roles.length && <p className="text-xs text-muted-foreground">No roles are available to select.</p>}
        </div>

        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

        <DialogFooter>
          <Button variant="outline" disabled={saving || lookingUp} onClick={() => close(false)}>Cancel</Button>
          <Button disabled={saving || !user || !roleId} onClick={grant}>{saving ? "Granting…" : "Grant role"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function humanize(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function messageOf(caught: unknown, fallback: string) {
  return caught instanceof ApiError ? caught.message : fallback;
}
