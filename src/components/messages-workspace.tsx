"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, CheckCheck, Info, Send } from "lucide-react";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast-provider";
import { bookingsApi, type Booking } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";
import { messagesApi, type Message } from "@/lib/api/messages";

const messageable = new Set(["APPROVED", "DEPOSIT_PENDING", "ACTIVE", "COMPLETED"]);

export function MessagesWorkspace({ activeId }: { activeId?: string }) {
  const { user } = useAuth(); const { showToast } = useToast(); const [threads, setThreads] = useState<Booking[]>([]); const [messages, setMessages] = useState<Message[]>([]); const [draft, setDraft] = useState(""); const [error, setError] = useState(""); const [sending, setSending] = useState(false);
  useEffect(() => { Promise.all([bookingsApi.asRenter(0, 50), bookingsApi.asOwner(0, 50)]).then(([renter, owner]) => { const unique = new Map([...renter.content, ...owner.content].filter((booking) => messageable.has(booking.status)).map((booking) => [booking.id, booking])); setThreads([...unique.values()].sort((a,b) => b.createdAt.localeCompare(a.createdAt))); }).catch(() => setError("Conversations could not be loaded.")); }, []);
  const active = threads.find((thread) => thread.id === activeId) || (!activeId ? threads[0] : undefined);
  useEffect(() => {
    if (!active) return;
    let current = true;
    const load = (markRead: boolean) =>
      messagesApi
        .list(active.id)
        .then((page) => {
          if (current) setMessages(page.content);
          if (markRead) return messagesApi.markRead(active.id);
        })
        .catch((caught) => current && setError(caught instanceof ApiError ? caught.message : "Messages could not be loaded."));
    load(true);
    // Poll for the other party's replies (no websockets in Phase 1).
    const timer = setInterval(() => load(false), 30000);
    return () => {
      current = false;
      clearInterval(timer);
    };
  }, [active]);
  async function send(event: FormEvent) { event.preventDefault(); if (!active || !draft.trim()) return; setSending(true); setError(""); try { const message = await messagesApi.send(active.id, draft.trim()); setMessages((current) => [...current, message]); setDraft(""); } catch (caught) { const message = caught instanceof ApiError ? caught.message : "Message could not be sent."; setError(message); showToast(message, { tone: "error" }); } finally { setSending(false); } }
  const counterpart = active ? (user?.id === active.ownerId ? active.renterName : active.ownerName) : "";

  return <main className="messages-page"><div className={activeId ? "thread-list is-hidden-mobile" : "thread-list"}><header><p className="eyebrow">Booking conversations</p><h1>Messages</h1></header><div className="thread-list__items">{threads.map((thread) => { const name = user?.id === thread.ownerId ? thread.renterName : thread.ownerName; return <Link href={`/messages/${thread.id}`} key={thread.id} className={thread.id === active?.id ? "thread-preview is-active" : "thread-preview"}><span className="avatar avatar--small">{initials(name)}</span><span className="thread-preview__copy"><strong>{name}</strong><small>{thread.listingTitle}</small><span>{humanize(thread.status)} booking</span></span><span className="thread-preview__meta"><time>{formatDate(thread.createdAt)}</time></span></Link>; })}{!threads.length && !error && <div className="empty-state"><p>Approved booking conversations will appear here.</p></div>}{error && <p className="form-error" role="alert">{error}</p>}</div></div>
  <section className={activeId ? "message-thread" : "message-thread is-hidden-mobile"}>{active ? <><header className="message-thread__header"><Link className="icon-button thread-back" href="/messages" aria-label="Back to conversations"><ArrowLeft /></Link><span className="avatar avatar--small">{initials(counterpart)}</span><div><strong>{active.listingTitle}</strong><span>With {counterpart} · booking #{active.id.slice(0,8)}</span></div><Link href={`/bookings/${active.id}`} className="button button--secondary button--small">View booking</Link></header><div className="booking-context"><Info size={16} /><span>This conversation belongs to booking #{active.id.slice(0,8)}. Keep changes and handover details here.</span></div><div className="messages" aria-live="polite">{messages.length ? messages.map((message) => { const mine = message.senderId === user?.id; return <div className={mine ? "message is-mine" : "message"} key={message.id}><p>{message.content}</p><small>{formatTime(message.createdAt)}{mine && <CheckCheck size={13} />}</small></div>; }) : <p className="message-date">No messages yet. Start with a useful booking detail.</p>}</div><form className="composer" onSubmit={send}><label className="sr-only" htmlFor="message-draft">Message {counterpart}</label><textarea id="message-draft" maxLength={2000} rows={1} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write about this booking…" /><button className="icon-button composer__send" aria-label="Send message" disabled={!draft.trim() || sending}><Send size={19} /></button></form></> : <div className="empty-state"><h2>Select a booking conversation</h2><p>Messages open after an owner approves a request.</p></div>}</section></main>;
}

function initials(name: string) { return name.split(/\s+/).slice(0,2).map((part) => part[0]).join("").toUpperCase(); }
function humanize(value: string) { return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()); }
function formatDate(value: string) { return new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(new Date(value)); }
function formatTime(value: string) { return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value)); }
