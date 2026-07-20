import { AdminRecordsView } from "@/components/admin-records-view";
import { PermissionGuardedPage } from "@/components/can";
import { P } from "@/lib/iam/permission-keys";

export default function AdminBookingsPage() {
  return <PermissionGuardedPage perm={P.BOOKING_BOOKING_READ}><AdminRecordsView kind="bookings" /></PermissionGuardedPage>;
}
