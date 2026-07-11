import { Check, Circle } from "lucide-react";
import { bookingSteps } from "@/lib/data";

export function StatusTimeline({ current = 2 }: { current?: number }) {
  return (
    <ol className="status-timeline" aria-label="Booking status">
      {bookingSteps.map((step, index) => (
        <li key={step} className={index < current ? "is-done" : index === current ? "is-current" : ""}>
          <span className="status-timeline__icon">{index < current ? <Check size={14} /> : <Circle size={10} fill="currentColor" />}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}
