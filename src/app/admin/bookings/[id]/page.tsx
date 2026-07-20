import type { Metadata } from "next";
import { AdminBookingDetail } from "@/components/admin-booking-detail";
import { PermissionGuardedPage } from "@/components/can";
import { P } from "@/lib/iam/permission-keys";

export const metadata: Metadata = { title: "Admin booking details" };

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PermissionGuardedPage perm={P.BOOKING_BOOKING_READ}><AdminBookingDetail bookingId={id} /></PermissionGuardedPage>;
}
