"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, CheckCheck, Info, Send } from "lucide-react";
import { useAuth } from "./auth-provider";
import { useOrg } from "./org-provider";
import { useToast } from "./toast-provider";
import { bookingsApi, type Booking } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";
import { messagesApi, type Message } from "@/lib/api/messages";

const messageable = new Set(["REQUESTED", "APPROVED", "DEPOSIT_PENDING", "ACTIVE", "COMPLETED", "CANCELLED"]);
type BookingThread = Booking & { lastMessageAt: string | null; unreadCount: number };

export function MessagesWorkspace({ activeId }: { activeId?: string }) {
  const { user } = useAuth();
  const { activeOrgId } = useOrg();
  const { showToast } = useToast();
  const [threads, setThreads] = useState<BookingThread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([
      bookingsApi.asRenter(0, 50),
      bookingsApi.asOwner(0, 50, activeOrgId ?? undefined),
      messagesApi.threads(),
    ])
      .then(([renter, owner, summaries]) => {
        const unique = new Map(
          [...renter.content, ...owner.content]
            .filter((booking) => messageable.has(booking.status))
            .map((booking) => [booking.id, booking]),
        );
        const summaryByBooking = new Map(
          summaries.map((summary) => [summary.bookingId, summary]),
        );
        const merged = [...unique.values()].map((booking): BookingThread => {
          const summary = summaryByBooking.get(booking.id);
          return {
            ...booking,
            lastMessageAt: summary?.lastMessageAt ?? null,
            unreadCount: Math.max(0, summary?.unreadCount ?? 0),
          };
        });
        setThreads(merged.sort((a, b) => {
          if (!a.lastMessageAt) return b.lastMessageAt ? 1 : 0;
          if (!b.lastMessageAt) return -1;
          return b.lastMessageAt.localeCompare(a.lastMessageAt);
        }));
      })
      .catch(() => setError("Conversations could not be loaded."))
      .finally(() => setLoading(false));
  }, [activeOrgId]);
  const active = threads.find((thread) => thread.id === activeId) || (!activeId ? threads[0] : undefined);
  const activeBookingId = active?.id;
  useEffect(() => {
    if (!activeBookingId) return;
    let current = true;
    const load = (markRead: boolean) =>
      messagesApi
        .list(activeBookingId)
        .then((page) => {
          if (current) setMessages(page.content);
          if (markRead) return messagesApi.markRead(activeBookingId).then(() => {
            if (current) setThreads((existing) => existing.map((thread) => thread.id === activeBookingId ? { ...thread, unreadCount: 0 } : thread));
          });
        })
        .catch((caught) => current && setError(caught instanceof ApiError ? caught.message : "Messages could not be loaded."));
    load(true);
    // Poll for the other party's replies (no websockets in Phase 1).
    const timer = setInterval(() => load(false), 30000);
    return () => {
      current = false;
      clearInterval(timer);
    };
  }, [activeBookingId]);
  async function send(event: FormEvent) { event.preventDefault(); if (!active || !draft.trim()) return; setSending(true); setError(""); try { const message = await messagesApi.send(active.id, draft.trim()); setMessages((current) => [...current, message]); setDraft(""); } catch (caught) { const message = caught instanceof ApiError ? caught.message : "Message could not be sent."; setError(message); showToast(message, { tone: "error" }); } finally { setSending(false); } }
  const counterpart = active ? (user?.id === active.ownerId ? active.renterName : active.ownerName) : "";

  return <main className="messages-page container">
    <aside className={activeId ? "thread-list is-hidden-mobile" : "thread-list"} aria-label="Booking conversations">
      <header><h1>Messages</h1><p>Conversations connected to your bookings.</p></header>
      <div className="thread-list__items">
        {threads.map((thread) => {
          const name = user?.id === thread.ownerId ? thread.renterName : thread.ownerName;
          const isActive = thread.id === active?.id;
          const isUnread = thread.unreadCount > 0;
          return <Link href={`/messages/${thread.id}`} key={thread.id} className={`thread-preview${isActive ? " is-active" : ""}${isUnread ? " is-unread" : ""}`} aria-current={isActive ? "page" : undefined}>
            <span className="avatar avatar--small">{initials(name)}</span>
            <span className="thread-preview__copy"><strong>{name}</strong><small>{thread.listingTitle}</small><span>{humanize(thread.status)} booking</span></span>
            <span className="thread-preview__meta">{thread.lastMessageAt && <time dateTime={thread.lastMessageAt}>{formatDate(thread.lastMessageAt)}</time>}{thread.unreadCount > 0 && <b aria-label={`${thread.unreadCount} unread ${thread.unreadCount === 1 ? "message" : "messages"}`}>{thread.unreadCount > 99 ? "99+" : thread.unreadCount}</b>}</span>
          </Link>;
        })}
        {loading && <p className="thread-list__status" role="status">Loading conversations…</p>}
        {!loading && !threads.length && !error && <div className="messages-empty"><h2>No conversations yet</h2><p>Booking conversations will appear here after a request is created.</p><Link href="/explore">Browse listings <span aria-hidden="true">→</span></Link></div>}
        {error && <p className="form-error thread-list__status" role="alert">{error}</p>}
      </div>
    </aside>

    <section className={activeId ? "message-thread" : "message-thread is-hidden-mobile"} aria-label={active ? `Conversation with ${counterpart}` : "Messages"}>
      {active ? <>
        <header className="message-thread__header">
          <Link className="icon-button thread-back" href="/messages" aria-label="Back to conversations"><ArrowLeft /></Link>
          <span className="avatar avatar--small">{initials(counterpart)}</span>
          <div><strong>{active.listingTitle}</strong><span>With {counterpart} · booking #{active.id.slice(0,8)}</span></div>
          <Link href={`/bookings/${active.id}`} className="message-thread__booking-link">View booking</Link>
        </header>
        <div className="booking-context"><Info size={16} /><span>Keep dates, handover details, and changes in this booking conversation.</span></div>
        <div className="messages" aria-live="polite">
          {messages.length ? messages.map((message) => {
            const mine = message.senderId === user?.id;
            return <div className={mine ? "message is-mine" : "message"} key={message.id}><p>{message.content}</p><small>{formatTime(message.createdAt)}{mine && <CheckCheck size={13} />}</small></div>;
          }) : <p className="message-date">No messages yet. Start with a useful booking detail.</p>}
        </div>
        <form className="composer" onSubmit={send}>
          <label className="sr-only" htmlFor="message-draft">Message {counterpart}</label>
          <textarea id="message-draft" maxLength={2000} rows={1} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write about this booking…" />
          <button className="icon-button composer__send" aria-label="Send message" disabled={!draft.trim() || sending}><Send size={19} /></button>
        </form>
      </> : <div className="messages-empty messages-empty--thread"><h2>{loading ? "Loading conversations…" : "Select a conversation"}</h2>{!loading && <p>Choose a booking from the list to read or send messages.</p>}</div>}
    </section>
  </main>;
}

function initials(name: string) { return name.split(/\s+/).slice(0,2).map((part) => part[0]).join("").toUpperCase(); }
function humanize(value: string) { return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()); }
function formatDate(value: string) { return new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(new Date(value)); }
function formatTime(value: string) { return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value)); }
