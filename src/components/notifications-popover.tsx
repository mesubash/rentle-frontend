"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarCheck,
  CheckCheck,
  ShieldCheck,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import {
  notificationsApi,
  type Notification,
} from "@/lib/api/notifications";

type NotificationsPopoverProps = {
  open: boolean;
  unreadCount: number;
  onOpenChange: (open: boolean) => void;
  onUnreadCountChange: (count: number) => void;
};

export function NotificationsPopover({
  open,
  unreadCount,
  onOpenChange,
  onUnreadCountChange,
}: NotificationsPopoverProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let active = true;
    notificationsApi
      .list(0, 10)
      .then((page) => {
        if (active) {
          setNotifications(page.content);
          setError("");
        }
      })
      .catch(() => {
        if (active) setError("Notifications could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      active = false;
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onOpenChange, open]);

  const markAllRead = async () => {
    setMarkingAll(true);
    setError("");
    try {
      await notificationsApi.markAllRead();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      onUnreadCountChange(0);
    } catch {
      setError("Notifications could not be marked as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  const markRead = async (notification: Notification) => {
    if (notification.read) return;
    await notificationsApi.markRead(notification.id);
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item,
      ),
    );
    onUnreadCountChange(Math.max(0, unreadCount - 1));
  };

  const openNotification = async (
    event: MouseEvent<HTMLAnchorElement>,
    notification: Notification,
  ) => {
    event.preventDefault();
    if (!notification.link || openingId) return;

    setOpeningId(notification.id);
    setError("");
    try {
      await markRead(notification);
    } catch {
      // The destination remains useful even when the read-state request fails.
    } finally {
      setOpeningId(null);
      onOpenChange(false);
      router.push(notification.link);
    }
  };

  const markWithoutLink = async (notification: Notification) => {
    if (notification.read || openingId) return;
    setOpeningId(notification.id);
    setError("");
    try {
      await markRead(notification);
    } catch {
      setError("Notification could not be marked as read.");
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="notification-popover-root" ref={rootRef}>
      <button
        type="button"
        className="icon-button header-bell header-expandable"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        onPointerUp={(event) => event.currentTarget.blur()}
      >
        <Bell size={19} />
        <span className="header-action-label">Notifications</span>
        {unreadCount > 0 && (
          <span className="nav-badge" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section className="notification-popover" role="dialog" aria-labelledby="notification-popover-title">
          <header>
            <div>
              <h2 id="notification-popover-title">Notifications</h2>
              <span>{unreadCount > 0 ? `${unreadCount} unread` : "You’re all caught up"}</span>
            </div>
            <div>
              {unreadCount > 0 && (
                <button type="button" className="notification-popover__mark-all" disabled={markingAll} onClick={() => void markAllRead()}>
                  <CheckCheck size={15} />
                  {markingAll ? "Marking…" : "Mark all read"}
                </button>
              )}
              <button type="button" className="icon-button notification-popover__close" aria-label="Close notifications" onClick={() => onOpenChange(false)}>
                <X size={18} />
              </button>
            </div>
          </header>

          {error && <p className="notification-popover__error" role="alert">{error}</p>}

          <div className="notification-popover__body">
            {loading ? (
              <div className="notification-popover__status" role="status">
                <Bell size={22} />
                <p>Loading updates…</p>
              </div>
            ) : notifications.length ? (
              <div className="notification-popover__list">
                {notifications.map((notification) => {
                  const time = formatNotificationTime(notification.createdAt);
                  const { Icon, tone } = notificationLook(notification.type);
                  const contents = (
                    <>
                      <span className={`notification-popover__icon notification-popover__icon--${tone}`} aria-hidden="true">
                        <Icon size={17} />
                      </span>
                      <span className="notification-popover__copy">
                        <span>{notification.message}</span>
                        <time dateTime={notification.createdAt} title={time.absolute}>{time.display}</time>
                      </span>
                      {!notification.read && <span className="notification-popover__unread" aria-label="Unread" />}
                    </>
                  );

                  return notification.link ? (
                    <Link
                      key={notification.id}
                      href={notification.link}
                      className={notification.read ? "notification-popover__item" : "notification-popover__item is-unread"}
                      aria-busy={openingId === notification.id}
                      onClick={(event) => void openNotification(event, notification)}
                    >
                      {contents}
                    </Link>
                  ) : (
                    <button
                      key={notification.id}
                      type="button"
                      className={notification.read ? "notification-popover__item" : "notification-popover__item is-unread"}
                      disabled={notification.read || openingId === notification.id}
                      onClick={() => void markWithoutLink(notification)}
                    >
                      {contents}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="notification-popover__status">
                <CheckCheck size={24} />
                <h3>Nothing new</h3>
                <p>Booking and account updates will appear here.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function notificationLook(type: string) {
  const tone = type.endsWith("_REJECTED") || type.endsWith("_CANCELLED") ? "bad" : "good";
  if (tone === "bad") return { Icon: XCircle, tone };
  if (type.startsWith("DEPOSIT_")) return { Icon: WalletCards, tone };
  if (type.startsWith("BOOKING_")) return { Icon: CalendarCheck, tone };
  if (type.startsWith("KYC_") || type.startsWith("PROVIDER_")) return { Icon: ShieldCheck, tone };
  return { Icon: Bell, tone: "neutral" as const };
}

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { display: value, absolute: value };

  const absolute = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
  const elapsedSeconds = Math.round((date.getTime() - Date.now()) / 1_000);
  const ranges: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
  ];
  let relativeValue = elapsedSeconds;

  for (const [limit, unit] of ranges) {
    if (Math.abs(relativeValue) < limit) {
      return {
        display: new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(relativeValue, unit),
        absolute,
      };
    }
    relativeValue = Math.round(relativeValue / limit);
  }

  return { display: absolute, absolute };
}
