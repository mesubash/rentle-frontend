"use client";

import { useEffect, useState } from "react";
import { Ban, CalendarDays, PackageSearch, Trash2 } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { Booking } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";
import { priceUnitLabel, type ListingSummary } from "@/lib/api/listings";
import { formatNpr } from "@/lib/format";
import { P } from "@/lib/iam/permission-keys";
import { Can } from "./can";
import { AdminRowActions } from "./admin-row-actions";
import { AdminTableRowLink } from "./admin-table-row-link";
import { AdminCount, AdminEmptyState, AdminPageHeader, AdminStatus, AdminTableShell } from "./admin-ui";
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
import { FilterBar } from "./ui/filter-bar";
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
import { Textarea } from "./ui/textarea";

type ModerationAction = { listing: ListingSummary; action: "deactivate" | "remove" };

export function AdminRecordsView({ kind }: { kind: "bookings" | "listings" }) {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [moderating, setModerating] = useState<ModerationAction | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    let active = true;
    const request = kind === "bookings" ? adminApi.bookings() : adminApi.listings();
    request
      .then((page) => {
        if (!active) return;
        if (kind === "bookings") setBookings(page.content as Booking[]);
        else setListings(page.content as ListingSummary[]);
      })
      .catch((caught) => {
        if (active) setError(messageOf(caught, `${kind === "bookings" ? "Bookings" : "Listings"} could not be loaded.`));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [kind]);

  const moderate = async () => {
    if (!moderating) return;
    setBusy(true);
    try {
      const updated = moderating.action === "deactivate"
        ? await adminApi.deactivateListing(moderating.listing.id, reason.trim())
        : await adminApi.removeListing(moderating.listing.id, reason.trim());
      setListings((current) => current.map((listing) => listing.id === updated.id ? updated : listing));
      showToast(`Listing ${moderating.action === "deactivate" ? "deactivated" : "removed"}.`, { tone: "success" });
      setModerating(null);
      setReason("");
    } catch (caught) {
      showToast(messageOf(caught, "The listing could not be moderated."), { tone: "error", duration: 6000 });
    } finally {
      setBusy(false);
    }
  };

  const records = kind === "bookings" ? bookings : listings;
  const visibleRecords = records.filter((record) => {
    const matchesQuery = JSON.stringify(record).toLowerCase().includes(query.trim().toLowerCase());
    const recordStatus = (record as { status: string }).status;
    const recordType = kind === "bookings" ? (record as Booking).listingType : (record as ListingSummary).type;
    const matchesStatus = !status || recordStatus === status;
    const matchesType = !type || recordType === type;
    return matchesQuery && matchesStatus && matchesType;
  });

  const statusOptions = kind === "bookings"
    ? ["REQUESTED", "APPROVED", "DEPOSIT_PENDING", "ACTIVE", "COMPLETED", "CANCELLED", "REJECTED"]
    : ["DRAFT", "ACTIVE", "INACTIVE", "REMOVED"];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={kind === "bookings" ? "Bookings" : "Listings"}
        description={kind === "bookings" ? "Review marketplace agreements and payment totals for support operations." : "Review marketplace inventory and take moderation action when needed."}
        actions={<AdminCount>{records.length} records</AdminCount>}
      />

      <FilterBar
        search={query}
        onSearch={setQuery}
        searchPlaceholder={`Search ${kind}...`}
        filters={[
          {
            id: "status",
            label: "Status",
            value: status,
            onChange: setStatus,
            allLabel: "All statuses",
            options: statusOptions.map((value) => ({ label: humanize(value), value })),
          },
          {
            id: "type",
            label: "Type",
            value: type,
            onChange: setType,
            allLabel: "All types",
            options: [
              { label: "Product", value: "PRODUCT" },
              { label: "Service", value: "SERVICE" },
            ],
          },
        ]}
      />

      {error && <p className="form-error" role="alert">{error}</p>}

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : visibleRecords.length ? (
        <AdminTableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{kind === "bookings" ? "Booking" : "Listing"}</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                {kind === "listings" && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {kind === "bookings"
                ? (visibleRecords as Booking[]).map((booking) => (
                    <AdminTableRowLink key={booking.id} href={`/admin/bookings/${booking.id}`} label={`Open booking ${booking.listingTitle}`}>
                      <TableCell><strong className="block">{booking.listingTitle}</strong><span className="block text-xs text-muted-foreground">{booking.renterName} → {booking.ownerName} · #{booking.id.slice(0, 8)}</span></TableCell>
                      <TableCell>{humanize(booking.listingType)}</TableCell>
                      <TableCell><AdminStatus value={booking.status} /></TableCell>
                      <TableCell>{formatNpr(booking.totalPrice)}<span className="block text-xs text-muted-foreground">Deposit {formatNpr(booking.depositAmount)}</span></TableCell>
                    </AdminTableRowLink>
                  ))
                : (visibleRecords as ListingSummary[]).map((listing) => (
                    <AdminTableRowLink key={listing.id} href={`/listing/${listing.id}`} label={`Open listing ${listing.title}`}>
                      <TableCell><strong className="block">{listing.title}</strong><span className="block text-xs text-muted-foreground">{listing.district} · #{listing.id.slice(0, 8)}</span></TableCell>
                      <TableCell>{humanize(listing.type)}</TableCell>
                      <TableCell><AdminStatus value={listing.status} /></TableCell>
                      <TableCell>{formatNpr(listing.pricePerUnit)} / {priceUnitLabel(listing.priceUnit)}</TableCell>
                      <TableCell className="text-right" data-row-action-ignore>
                        <Can perm={P.LISTING_LISTING_MODERATE}>
                          <AdminRowActions
                            label={`Open moderation actions for ${listing.title}`}
                            actions={[
                              ...(listing.status !== "INACTIVE" && listing.status !== "REMOVED"
                                ? [{ label: "Deactivate listing", icon: Ban, onSelect: () => setModerating({ listing, action: "deactivate" }) }]
                                : []),
                              ...(listing.status !== "REMOVED"
                                ? [{ label: "Remove listing", icon: Trash2, destructive: true, onSelect: () => setModerating({ listing, action: "remove" }) }]
                                : []),
                            ]}
                          />
                        </Can>
                      </TableCell>
                    </AdminTableRowLink>
                  ))}
            </TableBody>
          </Table>
        </AdminTableShell>
      ) : (
        <AdminEmptyState
          icon={kind === "bookings" ? CalendarDays : PackageSearch}
          title={`No ${kind} to show`}
          description={query ? "Try a different search term." : "New marketplace activity will appear here."}
        />
      )}

      <AlertDialog open={Boolean(moderating)} onOpenChange={(open) => { if (!open && !busy) { setModerating(null); setReason(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{moderating?.action === "remove" ? "Remove" : "Deactivate"} this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              {moderating?.action === "remove"
                ? "The listing will be removed from the public marketplace."
                : "The listing will become inactive and stop appearing in public search."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="moderation-reason">Reason</Label>
            <Textarea id="moderation-reason" value={reason} maxLength={400} placeholder="Add a clear note for the moderation record." onChange={(event) => setReason(event.target.value)} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction className={moderating?.action === "remove" ? "bg-destructive text-white hover:bg-destructive/90" : ""} disabled={busy} onClick={(event) => { event.preventDefault(); moderate(); }}>
              {busy ? "Applying…" : moderating?.action === "remove" ? "Remove listing" : "Deactivate listing"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function humanize(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function messageOf(caught: unknown, fallback: string) {
  return caught instanceof ApiError ? caught.message : fallback;
}
