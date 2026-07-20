"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { listingsApi, type BlockedRange } from "@/lib/api/listings";
import styles from "./availability-calendar.module.css";

export function AvailabilityCalendar({ listingId }: { listingId: string }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [blocked, setBlocked] = useState<BlockedRange[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    listingsApi.availability(listingId)
      .then((value) => { if (active) setBlocked(value?.blocked ?? []); })
      .catch(() => { if (active) setError("Availability could not be checked right now."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [listingId]);

  const year = month.getFullYear(); const monthIndex = month.getMonth();
  const days = new Date(year, monthIndex + 1, 0).getDate(); const offset = new Date(year, monthIndex, 1).getDay();
  const cells = Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, index) => index - offset + 1);
  const formatter = useMemo(() => new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }), []);
  const dayFormatter = useMemo(() => new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long", year: "numeric" }), []);
  const today = localDate(new Date());
  const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const canGoBack = month > currentMonth;

  function stateFor(day: number) {
    const date = localDate(new Date(year, monthIndex, day));
    if (date <= today) return "past" as const;
    const range = blocked.find((item) => date >= item.startDate && date <= item.endDate);
    return range ? range.source === "BOOKED" ? "booked" as const : "blocked" as const : "available" as const;
  }

  return <div className={styles.calendar} aria-busy={loading}>
    <div className={styles.head}><button type="button" aria-label="Previous month" disabled={!canGoBack} onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}><ChevronLeft /></button><strong aria-live="polite">{formatter.format(month)}</strong><button type="button" aria-label="Next month" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}><ChevronRight /></button></div>
    <div className={styles.grid} role="grid" aria-label={`Availability for ${formatter.format(month)}`}>
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <small key={day} aria-label={day}>{day.slice(0, 2)}</small>)}
      {cells.map((day, index) => {
        if (day < 1 || day > days) return <span className={styles.blank} aria-hidden="true" key={index} />;
        const state = stateFor(day);
        const date = new Date(year, monthIndex, day);
        const isToday = localDate(date) === today;
        const label = `${dayFormatter.format(date)}, ${state === "available" ? "available" : state === "booked" ? "booked" : "unavailable"}`;
        return <span role="gridcell" aria-label={label} className={`${styles.day} ${styles[state]} ${isToday ? styles.today : ""}`} key={index}><span>{day}</span></span>;
      })}
    </div>
    {loading ? <p className={styles.note}>Checking availability…</p> : error ? <p className={`${styles.note} ${styles.error}`}>{error}</p> : <div className={styles.legend} aria-label="Availability legend"><span><i className={styles.available} />Available</span><span><i className={styles.unavailableKey} />Unavailable</span><span><i className={styles.bookedKey} />Booked</span></div>}
  </div>;
}

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
