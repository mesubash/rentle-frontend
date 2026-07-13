"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Ban, Trash2 } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { Booking } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";
import { priceUnitLabel, type ListingSummary } from "@/lib/api/listings";
import { formatNpr } from "@/lib/format";
import { P } from "@/lib/iam/permission-keys";
import { Can } from "./can";
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
import { Button } from "./ui/button";
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

  return (
    <div className="space-y-4">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">{kind === "bookings" ? "Agreement records" : "Marketplace inventory"}</p>
          <h1>{kind === "bookings" ? "Bookings" : "Listings"}</h1>
          <p>{kind === "bookings" ? "Read-only operational records for support review." : "Review every listing state and take moderation action when needed."}</p>
        </div>
        <span className="queue-count">{records.length} shown</span>
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : records.length ? (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{kind === "bookings" ? "Booking" : "Listing"}</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                {kind === "listings" && <TableHead className="text-right">Moderation</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {kind === "bookings"
                ? bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell><strong className="block">{booking.listingTitle}</strong><span className="block text-xs text-muted-foreground">{booking.renterName} → {booking.ownerName} · #{booking.id.slice(0, 8)}</span></TableCell>
                      <TableCell>{humanize(booking.listingType)}</TableCell>
                      <TableCell><b className="status-chip status-chip--requested">{humanize(booking.status)}</b></TableCell>
                      <TableCell>{formatNpr(booking.totalPrice)}<span className="block text-xs text-muted-foreground">Deposit {formatNpr(booking.depositAmount)}</span></TableCell>
                    </TableRow>
                  ))
                : listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell><strong className="block"><Link className="hover:underline" href={`/listing/${listing.id}`}>{listing.title}</Link></strong><span className="block text-xs text-muted-foreground">{listing.district} · #{listing.id.slice(0, 8)}</span></TableCell>
                      <TableCell>{humanize(listing.type)}</TableCell>
                      <TableCell><b className={listing.status === "ACTIVE" ? "status-chip status-chip--verified" : "status-chip status-chip--requested"}>{humanize(listing.status)}</b></TableCell>
                      <TableCell>{formatNpr(listing.pricePerUnit)} / {priceUnitLabel(listing.priceUnit)}</TableCell>
                      <TableCell>
                        <Can perm={P.LISTING_LISTING_MODERATE}>
                          <span className="flex justify-end gap-2">
                            {listing.status !== "INACTIVE" && listing.status !== "REMOVED" && (
                              <Button variant="outline" size="sm" onClick={() => setModerating({ listing, action: "deactivate" })}><Ban /> Deactivate</Button>
                            )}
                            {listing.status !== "REMOVED" && (
                              <Button variant="destructive" size="sm" onClick={() => setModerating({ listing, action: "remove" })}><Trash2 /> Remove</Button>
                            )}
                          </span>
                        </Can>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <section className="rounded-lg border bg-card px-5 py-10 text-center">
          <h2 className="text-lg font-semibold">No {kind} to show</h2>
          <p className="mt-1 text-sm text-muted-foreground">New marketplace activity will appear here.</p>
        </section>
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
