"use client";

import { useEffect, useState } from "react";
import { Ban, KeyRound, LockKeyhole, RotateCcw, Users } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { UserProfile } from "@/lib/api/users";
import { P } from "@/lib/iam/permission-keys";
import { AdminRowActions, type AdminRowAction } from "./admin-row-actions";
import { AdminTableRowLink } from "./admin-table-row-link";
import { useAuth } from "./auth-provider";
import { useCan } from "./can";
import { UserAssignmentsDialog } from "./admin-staff-view";
import { AdminCount, AdminEmptyState, AdminPageHeader, AdminStatus, AdminTableShell } from "./admin-ui";
import { useToast } from "./toast-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { FilterBar } from "./ui/filter-bar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export function AdminUsersView() {
  const { user: currentUser } = useAuth();
  const canManageAssignments = useCan(P.PLATFORM_ASSIGNMENT_READ);
  const canSuspendUsers = useCan(P.IDENTITY_USER_SUSPEND);
  const canResetPassword = useCan(P.IDENTITY_USER_RESET_PASSWORD);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filter, setFilter] = useState<"" | UserProfile["status"]>("");
  const [kyc, setKyc] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [acting, setActing] = useState("");
  const [loading, setLoading] = useState(true);
  const [accessUser, setAccessUser] = useState<UserProfile | null>(null);
  const [resetUser, setResetUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    let active = true;
    adminApi.users(filter || undefined)
      .then((page) => {
        if (active) setUsers(page.content);
      })
      .catch((caught) => {
        if (active) setError(messageOf(caught, "Users could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filter]);

  const visibleUsers = users.filter((user) => {
    const matchesQuery = `${user.fullName} ${user.email} ${user.phoneNumber ?? ""}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesKyc = !kyc || (user.kycStatus ?? "NONE") === kyc;
    return matchesQuery && matchesKyc;
  });

  async function change(user: UserProfile) {
    setActing(user.id);
    setError("");
    try {
      const updated = user.status === "SUSPENDED"
        ? await adminApi.unsuspend(user.id)
        : await adminApi.suspend(user.id);
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (caught) {
      setError(messageOf(caught, "Account status could not be changed."));
    } finally {
      setActing("");
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        description="Manage marketplace accounts, verification status, and staff access."
        actions={<AdminCount>{users.length} records</AdminCount>}
      />

      <FilterBar
        search={query}
        onSearch={setQuery}
        searchPlaceholder="Search name, email, or phone..."
        filters={[
          {
            id: "status",
            label: "Status",
            value: filter,
            onChange: (value) => { setLoading(true); setFilter(value as UserProfile["status"]); },
            allLabel: "All statuses",
            options: [
              { label: "Pending", value: "PENDING_VERIFICATION" },
              { label: "Verified", value: "VERIFIED" },
              { label: "Suspended", value: "SUSPENDED" },
            ],
          },
          {
            id: "kyc",
            label: "KYC",
            value: kyc,
            onChange: setKyc,
            allLabel: "Any KYC",
            options: [
              { label: "Approved", value: "APPROVED" },
              { label: "Pending", value: "PENDING" },
              { label: "Rejected", value: "REJECTED" },
              { label: "No KYC", value: "NONE" },
            ],
          },
        ]}
      />

      {error && <p className="form-error" role="alert">{error}</p>}

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : visibleUsers.length ? (
        <AdminTableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Trust</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleUsers.map((user) => (
                <AdminTableRowLink key={user.id} href={`/profile/${user.id}`} label={`Open profile for ${user.fullName}`}>
                  <TableCell>
                    <strong className="block">{user.fullName}</strong>
                    <span className="block text-xs text-muted-foreground">{user.email} · {maskPhone(user.phoneNumber)}</span>
                  </TableCell>
                  <TableCell>
                    <AdminStatus value={user.status} />
                    <span className="mt-1 block text-xs text-muted-foreground">{user.kycStatus ? `KYC ${user.kycStatus.toLowerCase()}` : "No KYC"}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatTrustScore(user.trustScore)}</TableCell>
                  <TableCell className="text-right" data-row-action-ignore>
                    <AdminRowActions
                      label={`Open actions for ${user.fullName}`}
                      actions={userActions({
                        user,
                        acting,
                        currentUserId: currentUser?.id,
                        canManageAssignments,
                        canSuspendUsers,
                        canResetPassword,
                        onManageRoles: () => setAccessUser(user),
                        onChangeStatus: () => change(user),
                        onResetPassword: () => setResetUser(user),
                      })}
                    />
                  </TableCell>
                </AdminTableRowLink>
              ))}
            </TableBody>
          </Table>
        </AdminTableShell>
      ) : (
        <AdminEmptyState icon={Users} title="No users match this view" description="Change the account status or search term to see other users." />
      )}

      <UserAssignmentsDialog
        user={accessUser}
        open={Boolean(accessUser)}
        onOpenChange={(open) => !open && setAccessUser(null)}
      />

      <ResetPasswordDialog user={resetUser} onOpenChange={(open) => !open && setResetUser(null)} />
    </div>
  );
}

function ResetPasswordDialog({
  user,
  onOpenChange,
}: {
  user: UserProfile | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const valid = password.length >= 8 && password.length <= 72;

  const close = (open: boolean) => {
    if (!open && !saving) { setPassword(""); setError(""); }
    onOpenChange(open);
  };

  const submit = async () => {
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      await adminApi.resetPassword(user.id, password);
      showToast(`Password updated for ${user.fullName}. Their existing sessions were signed out.`, { tone: "success", duration: 6000 });
      setPassword("");
      onOpenChange(false);
    } catch (caught) {
      setError(messageOf(caught, "The password could not be updated."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(user)} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Set a new password for {user?.fullName}. They will be signed out of all
            devices and must sign in with the new password.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="reset-password">New password</Label>
          <Input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            value={password}
            maxLength={72}
            placeholder="At least 8 characters"
            onChange={(event) => setPassword(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">8–72 characters. Share it with the user over a secure channel.</p>
        </div>

        {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p>}

        <DialogFooter>
          <Button variant="outline" disabled={saving} onClick={() => close(false)}>Cancel</Button>
          <Button disabled={saving || !valid} onClick={submit}>{saving ? "Updating…" : "Update password"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function userActions({
  user,
  acting,
  currentUserId,
  canManageAssignments,
  canSuspendUsers,
  canResetPassword,
  onManageRoles,
  onChangeStatus,
  onResetPassword,
}: {
  user: UserProfile;
  acting: string;
  currentUserId?: string;
  canManageAssignments: boolean;
  canSuspendUsers: boolean;
  canResetPassword: boolean;
  onManageRoles: () => void;
  onChangeStatus: () => void;
  onResetPassword: () => void;
}): AdminRowAction[] {
  const actions: AdminRowAction[] = [];

  if (canManageAssignments) {
    actions.push({ label: "Manage roles", icon: KeyRound, onSelect: onManageRoles });
  }

  if (canResetPassword) {
    actions.push({ label: "Reset password", icon: LockKeyhole, onSelect: onResetPassword });
  }

  if (canSuspendUsers && user.id !== currentUserId) {
    const suspended = user.status === "SUSPENDED";
    actions.push({
      label: acting === user.id ? "Updating..." : suspended ? "Restore account" : "Suspend account",
      icon: suspended ? RotateCcw : Ban,
      destructive: !suspended,
      disabled: acting === user.id,
      onSelect: onChangeStatus,
    });
  }

  return actions;
}

function maskPhone(value: string | null) {
  if (!value) return "No phone";
  return value.length > 6 ? `${value.slice(0, 4)}••••${value.slice(-3)}` : value;
}

function formatTrustScore(value: number | null | undefined) {
  return value && value > 0 ? `${value.toFixed(1)} / 5` : "No reviews yet";
}

function messageOf(caught: unknown, fallback: string) {
  return caught instanceof ApiError ? caught.message : fallback;
}
