"use client";

import { useState } from "react";

const months = [
  { label: "August 2026", offset: 3, days: 31, blocked: [7, 8, 16, 17], selected: [12, 13] },
  { label: "September 2026", offset: 2, days: 30, blocked: [4, 5, 21, 22], selected: [] },
  { label: "October 2026", offset: 4, days: 31, blocked: [10, 11, 12], selected: [] },
];

export function AvailabilityCalendar() {
  const [month, setMonth] = useState(0);
  const data = months[month];
  const cells = Array.from({ length: 35 }, (_, index) => index - data.offset + 1);
  return <div className="availability card"><div className="availability__head"><button aria-label="Previous month" disabled={month === 0} onClick={() => setMonth((value) => Math.max(0, value - 1))}>‹</button><strong aria-live="polite">{data.label}</strong><button aria-label="Next month" disabled={month === months.length - 1} onClick={() => setMonth((value) => Math.min(months.length - 1, value + 1))}>›</button></div><div className="calendar-grid">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <small key={day}>{day}</small>)}{cells.map((day, index) => <span key={index} className={data.blocked.includes(day) ? "is-blocked" : data.selected.includes(day) ? "is-selected" : ""}>{day > 0 && day <= data.days ? day : ""}</span>)}</div><p><span className="calendar-key calendar-key--blocked" /> Booked <span className="calendar-key calendar-key--free" /> Available</p></div>;
}
