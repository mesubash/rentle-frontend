import { Check, Circle } from "lucide-react";
import type { BookingStatus } from "@/lib/api/bookings";

const steps = ["Requested", "Approved", "Deposit pending", "Active", "Completed"];
const positions: Record<BookingStatus, number> = { REQUESTED: 0, APPROVED: 1, DEPOSIT_PENDING: 2, ACTIVE: 3, COMPLETED: 4, CANCELLED: 0, REJECTED: 0 };

export function StatusTimeline({ status }: { status: BookingStatus }) {
  const current = positions[status];
  return (
    <ol className="status-timeline" aria-label="Booking status">
      {steps.map((step, index) => (
        <li key={step} className={index < current ? "is-done" : index === current ? "is-current" : ""}>
          <span className="status-timeline__icon">{index < current ? <Check size={14} /> : <Circle size={10} fill="currentColor" />}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}
