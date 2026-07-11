"use client";

import { useEffect, useMemo, useState } from "react";
import { listingsApi, type BlockedRange } from "@/lib/api/listings";

export function AvailabilityCalendar({ listingId }: { listingId: string }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [blocked, setBlocked] = useState<BlockedRange[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    listingsApi.availability(listingId).then((value) => active && setBlocked(value.blocked)).catch(() => active && setError("Availability is temporarily unavailable."));
    return () => { active = false; };
  }, [listingId]);

  const year = month.getFullYear(); const monthIndex = month.getMonth();
  const days = new Date(year, monthIndex + 1, 0).getDate(); const offset = new Date(year, monthIndex, 1).getDay();
  const cells = Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, index) => index - offset + 1);
  const formatter = useMemo(() => new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }), []);
  function unavailable(day: number) { const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; return blocked.some((range) => date >= range.startDate && date <= range.endDate); }

  return <div className="availability card"><div className="availability__head"><button aria-label="Previous month" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}>‹</button><strong aria-live="polite">{formatter.format(month)}</strong><button aria-label="Next month" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}>›</button></div><div className="calendar-grid">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <small key={day}>{day}</small>)}{cells.map((day, index) => <span key={index} className={day > 0 && day <= days && unavailable(day) ? "is-blocked" : ""}>{day > 0 && day <= days ? day : ""}</span>)}</div>{error ? <p>{error}</p> : <p><span className="calendar-key calendar-key--blocked" /> Unavailable <span className="calendar-key calendar-key--free" /> Available</p>}</div>;
}
