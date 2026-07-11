"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { ArrowLeft, CheckCheck, ImagePlus, Info, Send, X } from "lucide-react";
import { images } from "@/lib/data";

const threads = [
  { id: "RNT-8924", name: "Sarah M.", item: "Sony Alpha A7 IV", preview: "I’ve added the eSewa number above.", time: "10:42", unread: 2, image: images.sony },
  { id: "RNT-9018", name: "Nabin Karki", item: "Canon EOS R5", preview: "Pickup at 9am works for me.", time: "10:18", unread: 1, image: images.canon },
  { id: "RNT-8741", name: "Aayush S.", item: "Daura Suruwal Set", preview: "Thank you. Hope the event went well.", time: "Yesterday", unread: 0, image: images.daura },
  { id: "RNT-8655", name: "Suman G.", item: "Camping Tent", preview: "The return is confirmed.", time: "22 Jul", unread: 0, image: images.tent },
];

export function MessagesWorkspace({ activeId }: { activeId?: string }) {
  const active = threads.find((thread) => thread.id === activeId) ?? threads[0];
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState("");
  const attachmentRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState(active.id === "RNT-9018" ? [
    { mine: false, body: "Hi, I need the Canon for a documentary shoot from 24–26 August. Pickup at 9am works for me.", time: "10:02" },
    { mine: true, body: "The dates are available. I’ve approved the request—please check the booking for the deposit amount.", time: "10:18" },
  ] : [
    { mine: false, body: "Hi Aayush, the camera is available for 18–20 August. Pickup from Baneshwor works after 8am.", time: "10:14" },
    { mine: true, body: "Great, thank you. I’ll use it for a wedding in Bhaktapur and return it by 7pm on the 20th.", time: "10:20" },
    { mine: false, body: "That works. I’ve added the eSewa number above. Please upload proof on the booking after sending the deposit.", time: "10:42" },
  ]);

  function send(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim() || (attachment ? `Sent an attachment: ${attachment}` : "");
    if (!body) return;
    setMessages((current) => [...current, { mine: true, body, time: "Now" }]);
    setDraft("");
    setAttachment("");
  }

  return (
    <main className="messages-page">
      <div className={activeId ? "thread-list is-hidden-mobile" : "thread-list"}>
        <header><p className="eyebrow">Booking conversations</p><h1>Messages</h1></header>
        <div className="thread-list__items">{threads.map((thread) => <Link href={`/messages/${thread.id}`} key={thread.id} className={thread.id === active.id ? "thread-preview is-active" : "thread-preview"}><span className="thread-preview__image"><Image src={thread.image} alt="" fill sizes="54px" /></span><span className="thread-preview__copy"><strong>{thread.name}</strong><small>{thread.item}</small><span>{thread.preview}</span></span><span className="thread-preview__meta"><time>{thread.time}</time>{thread.unread ? <b>{thread.unread}</b> : null}</span></Link>)}</div>
      </div>

      <section className={activeId ? "message-thread" : "message-thread is-hidden-mobile"}>
        <header className="message-thread__header"><Link className="icon-button thread-back" href="/messages" aria-label="Back to conversations"><ArrowLeft /></Link><span className="thread-preview__image"><Image src={active.image} alt="Sony Alpha A7 IV camera" fill sizes="46px" /></span><div><strong>{active.item}</strong><span>Booking #{active.id} · 18–20 Aug</span></div><Link href={`/bookings/${active.id}`} className="button button--secondary button--small">View booking</Link></header>
        <div className="booking-context"><Info size={16} /><span>This conversation is part of booking #{active.id}. Agreements here stay on the record.</span></div>
        <div className="messages" aria-live="polite"><p className="message-date">Today</p>{messages.map((message, index) => <div className={message.mine ? "message is-mine" : "message"} key={index}><p>{message.body}</p><small>{message.time}{message.mine && <CheckCheck size={13} />}</small></div>)}</div>
        <form className="composer" onSubmit={send}>{attachment && <span className="composer-attachment"><ImagePlus size={15} />{attachment}<button type="button" aria-label="Remove attachment" onClick={() => setAttachment("")}><X size={14} /></button></span>}<input ref={attachmentRef} className="sr-only" type="file" accept="image/*" onChange={(event) => setAttachment(event.target.files?.[0]?.name ?? "")} /><button type="button" className="icon-button" aria-label="Attach image" onClick={() => attachmentRef.current?.click()}><ImagePlus size={20} /></button><label className="sr-only" htmlFor="message-draft">Message {active.name}</label><textarea id="message-draft" rows={1} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message about this booking…" /><button className="icon-button composer__send" aria-label="Send message" disabled={!draft.trim() && !attachment}><Send size={19} /></button></form>
      </section>
    </main>
  );
}
