"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, CheckCircle2 } from "lucide-react";
import { type MouseEvent, useEffect, useState } from "react";
import {
  notificationsApi,
  type Notification,
} from "@/lib/api/notifications";

export function NotificationsView() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    notificationsApi
      .list()
      .then((page) => {
        if (active) setNotifications(page.content);
      })
      .catch(() => {
        if (active) setError("Notifications could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const refetch = async () => {
    const page = await notificationsApi.list();
    setNotifications(page.content);
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    setError("");
    try {
      await notificationsApi.markAllRead();
      await refetch();
    } catch {
      setError("Notifications could not be marked as read. Please try again.");
    } finally {
      setMarkingAll(false);
    }
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
      await notificationsApi.markRead(notification.id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      );
    } catch {
      // Opening the destination is still useful if updating the read state fails.
    } finally {
      setOpeningId(null);
      router.push(notification.link);
    }
  };

  const markNotificationWithoutLink = async (notification: Notification) => {
    if (openingId) return;

    setOpeningId(notification.id);
    setError("");
    try {
      await notificationsApi.markRead(notification.id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      );
    } catch {
      setError("Notification could not be marked as read. Please try again.");
    } finally {
      setOpeningId(null);
    }
  };

  const unread = notifications.some((notification) => !notification.read);

  return (
    <main className="page">
      <div className="container notifications-page">
        <header className="page-header">
          <p className="eyebrow">Account activity</p>
          <h1>Notifications</h1>
          <p>Updates about your bookings, listings, messages, and account.</p>
          <div className="button-row">
            <button
              type="button"
              className="button button--secondary button--small"
              disabled={loading || markingAll || !unread}
              onClick={markAllRead}
            >
              <CheckCheck size={17} aria-hidden="true" />
              {markingAll ? "Marking as read…" : "Mark all read"}
            </button>
          </div>
        </header>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="message-date" role="status">
            Loading notifications…
          </p>
        ) : notifications.length ? (
          <div className="notification-list">
            {notifications.map((notification) => {
              const time = formatNotificationTime(notification.createdAt);
              const cardContents = (
                <>
                  <span aria-hidden="true">
                    <Bell size={19} />
                  </span>
                  <div>
                    {notification.read ? (
                      <span>{notification.message}</span>
                    ) : (
                      <strong>{notification.message}</strong>
                    )}
                    <br />
                    <small>
                      <time dateTime={notification.createdAt} title={time.absolute}>
                        {time.display}
                      </time>
                    </small>
                  </div>
                  {!notification.read && <i aria-hidden="true" />}
                </>
              );

              return notification.link ? (
                <Link
                  key={notification.id}
                  className={
                    notification.read
                      ? "notification-card card"
                      : "notification-card card is-unread"
                  }
                  href={notification.link}
                  aria-busy={openingId === notification.id}
                  onClick={(event) =>
                    void openNotification(event, notification)
                  }
                >
                  {cardContents}
                </Link>
              ) : (
                <div
                  key={notification.id}
                  className={
                    notification.read
                      ? "notification-card card"
                      : "notification-card card is-unread"
                  }
                  role="button"
                  tabIndex={0}
                  aria-busy={openingId === notification.id}
                  onClick={() => void markNotificationWithoutLink(notification)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      void markNotificationWithoutLink(notification);
                    }
                  }}
                >
                  {cardContents}
                </div>
              );
            })}
          </div>
        ) : error ? (
          <div className="button-row">
            <button
              type="button"
              className="button button--secondary button--small"
              onClick={() => {
                setLoading(true);
                setError("");
                void refetch()
                  .catch(() =>
                    setError("Notifications could not be loaded."),
                  )
                  .finally(() => setLoading(false));
              }}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="inline-success">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>You have no notifications yet.</span>
          </div>
        )}
      </div>
    </main>
  );
}

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { display: value, absolute: value };
  }

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
        display: new Intl.RelativeTimeFormat(undefined, {
          numeric: "auto",
        }).format(relativeValue, unit),
        absolute,
      };
    }
    relativeValue = Math.round(relativeValue / limit);
  }

  return { display: absolute, absolute };
}
