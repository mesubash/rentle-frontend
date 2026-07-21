"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { Booking } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";
import { formatNpr, humanize } from "@/lib/format";
import { AdminEmptyState, AdminPageHeader, AdminStatus } from "./admin-ui";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function AdminBookingDetail({ bookingId }: { bookingId: string }) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    adminApi
      .booking(bookingId)
      .then((record) => {
        if (active) setBooking(record);
      })
      .catch((caught) => {
        if (!active) return;
        setError(caught instanceof ApiError ? caught.message : "This booking could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, [bookingId]);

  if (error) {
    return (
      <AdminEmptyState
        icon={AlertCircle}
        title="Booking unavailable"
        description={error}
        action={<Button asChild variant="outline"><Link href="/admin/bookings"><ArrowLeft /> Back to bookings</Link></Button>}
      />
    );
  }

  if (!booking) {
    return <div className="space-y-5"><Skeleton className="h-20" /><Skeleton className="h-72" /></div>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={booking.listingTitle}
        description={`${humanize(booking.listingType)} booking #${booking.id.slice(0, 8)}`}
        actions={
          <>
            <AdminStatus value={booking.status} />
            <Button asChild variant="outline"><Link href="/admin/bookings"><ArrowLeft /> Back to bookings</Link></Button>
          </>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><UserRound className="size-4" /> Parties</CardTitle>
            <CardDescription>The marketplace users participating in this agreement.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <DetailField icon={UserRound} label="Owner" value={booking.ownerName} detail={booking.ownerId} />
            <DetailField icon={UserRound} label="Renter" value={booking.renterName} detail={booking.renterId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4" /> Dates</CardTitle>
            <CardDescription>The agreed booking period and service times.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <DetailField icon={CalendarDays} label="Start" value={formatDate(booking.startDate)} detail={booking.startTime ? `At ${booking.startTime}` : undefined} />
            <DetailField icon={CalendarDays} label="End" value={formatDate(booking.endDate)} detail={booking.endTime ? `At ${booking.endTime}` : undefined} />
            <DetailField icon={Clock3} label="Created" value={formatDateTime(booking.createdAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><CircleDollarSign className="size-4" /> Price</CardTitle>
            <CardDescription>Booking value and direct deposit record.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <DetailField icon={CircleDollarSign} label="Total price" value={formatNpr(booking.totalPrice)} />
            <DetailField icon={ShieldCheck} label="Refundable deposit" value={formatNpr(booking.depositAmount)} detail={booking.depositPaid ? "Confirmed received" : "Not confirmed"} />
            <DetailField icon={WalletCards} label="Owner payment wallet" value={booking.ownerPaymentWallet ?? "Not provided"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Booking record</CardTitle>
            <CardDescription>Identifiers and notes useful during support review.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <DetailField label="Booking ID" value={booking.id} />
            <DetailField label="Listing ID" value={booking.listingId} />
            {booking.renterNote && <DetailField label="Renter note" value={booking.renterNote} />}
            {booking.cancellationReason && <DetailField label="Cancellation reason" value={booking.cancellationReason} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailField({ icon: Icon, label, value, detail }: { icon?: LucideIcon; label: string; value: string; detail?: string }) {
  return (
    <div className="flex min-w-0 gap-3">
      {Icon && <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted"><Icon className="size-4 text-muted-foreground" /></span>}
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-sm font-medium">{value}</p>
        {detail && <p className="mt-1 break-all text-xs text-muted-foreground">{detail}</p>}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

