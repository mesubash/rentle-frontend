"use client";

import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { UserProfile } from "@/lib/api/users";
import { P } from "@/lib/iam/permission-keys";
import { Can } from "./can";
import { UserAssignmentsDialog } from "./admin-staff-view";
import { Button } from "./ui/button";
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
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filter, setFilter] = useState<"" | UserProfile["status"]>("");
  const [error, setError] = useState("");
  const [acting, setActing] = useState("");
  const [loading, setLoading] = useState(true);
  const [accessUser, setAccessUser] = useState<UserProfile | null>(null);

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
    <div className="space-y-4">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Marketplace people</p>
          <h1>Users</h1>
          <p>Review account status and staff access without exposing private documents.</p>
        </div>
        <span className="queue-count">{users.length} shown</span>
      </header>

      <div className="tabs">
        <button className={!filter ? "is-active" : ""} onClick={() => setFilter("")}>All</button>
        <button className={filter === "PENDING_VERIFICATION" ? "is-active" : ""} onClick={() => setFilter("PENDING_VERIFICATION")}>Pending</button>
        <button className={filter === "VERIFIED" ? "is-active" : ""} onClick={() => setFilter("VERIFIED")}>Verified</button>
        <button className={filter === "SUSPENDED" ? "is-active" : ""} onClick={() => setFilter("SUSPENDED")}>Suspended</button>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : users.length ? (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trust</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <strong className="block">{user.fullName}</strong>
                    <span className="block text-xs text-muted-foreground">{user.email} · {maskPhone(user.phoneNumber)}</span>
                  </TableCell>
                  <TableCell>
                    <b className={user.status === "VERIFIED" ? "status-chip status-chip--verified" : "status-chip status-chip--requested"}>{humanize(user.status)}</b>
                    <span className="mt-1 block text-xs text-muted-foreground">{user.kycStatus ? `KYC ${user.kycStatus.toLowerCase()}` : "No KYC"}</span>
                  </TableCell>
                  <TableCell>{Math.round(user.trustScore)} / 100</TableCell>
                  <TableCell>
                    <span className="flex flex-wrap justify-end gap-2">
                      <Can perm={P.PLATFORM_ASSIGNMENT_READ}>
                        <Button variant="outline" size="sm" onClick={() => setAccessUser(user)}><KeyRound /> Roles</Button>
                      </Can>
                      <Can perm={P.IDENTITY_USER_SUSPEND}>
                        <Button
                          variant={user.status === "SUSPENDED" ? "secondary" : "destructive"}
                          size="sm"
                          disabled={acting === user.id}
                          onClick={() => change(user)}
                        >
                          {acting === user.id ? "Updating…" : user.status === "SUSPENDED" ? "Restore" : "Suspend"}
                        </Button>
                      </Can>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <section className="rounded-lg border bg-card px-5 py-10 text-center">
          <h2 className="text-lg font-semibold">No users match this filter</h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose another account status to continue.</p>
        </section>
      )}

      <UserAssignmentsDialog
        user={accessUser}
        open={Boolean(accessUser)}
        onOpenChange={(open) => !open && setAccessUser(null)}
      />
    </div>
  );
}

function maskPhone(value: string | null) {
  if (!value) return "No phone";
  return value.length > 6 ? `${value.slice(0, 4)}••••${value.slice(-3)}` : value;
}

function humanize(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function messageOf(caught: unknown, fallback: string) {
  return caught instanceof ApiError ? caught.message : fallback;
}
