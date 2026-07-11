import Link from "next/link";
import { CalendarCheck, CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";

const notifications = [
  { icon: CalendarCheck, title: "Sarah approved your booking request", copy: "Upload the NPR 30,000 deposit proof to continue.", time: "12 minutes ago", href: "/bookings/RNT-8924", unread: true },
  { icon: MessageCircle, title: "New message from Sarah", copy: "I’ve added the eSewa number above.", time: "28 minutes ago", href: "/messages/RNT-8924", unread: true },
  { icon: ShieldCheck, title: "Citizenship review is ready", copy: "Complete the two document uploads when you have a clear photo.", time: "Yesterday", href: "/verification", unread: false },
];

export default function NotificationsPage() { return <main className="page"><div className="container notifications-page"><header className="page-header"><p className="eyebrow">Account activity</p><h1>Notifications</h1><p>Booking actions appear first so you always know what needs attention.</p></header><div className="notification-list">{notifications.map(({ icon: Icon, title, copy, time, href, unread }) => <Link className={unread ? "notification-card card is-unread" : "notification-card card"} href={href} key={title}><span><Icon size={19} /></span><div><strong>{title}</strong><p>{copy}</p><small>{time}</small></div>{unread && <i aria-label="Unread" />}</Link>)}</div><div className="inline-success"><CheckCircle2 size={18} /><span>You are all caught up beyond these three updates.</span></div></div></main>; }
