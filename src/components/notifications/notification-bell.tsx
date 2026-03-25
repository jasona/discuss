"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, MessageSquare, AtSign, Mail, Check } from "lucide-react";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type Notification,
} from "@/lib/actions/notifications";

const POLL_INTERVAL = 30_000; // 30 seconds

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(dateStr).toLocaleDateString();
}

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "mention":
      return <AtSign className="h-4 w-4 shrink-0 text-blue-500" />;
    case "reply":
      return <MessageSquare className="h-4 w-4 shrink-0 text-green-500" />;
    case "invitation":
      return <Mail className="h-4 w-4 shrink-0 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4 shrink-0 text-muted-foreground" />;
  }
}

export function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silently fail
    }
  }, []);

  // Poll for unread count
  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchCount]);

  // Load notifications when popover opens
  useEffect(() => {
    if (open) {
      setLoading(true);
      getNotifications(20, 0)
        .then(setNotifications)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open]);

  async function handleMarkAllRead() {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  async function handleClick(notification: Notification) {
    if (!notification.isRead) {
      await markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    if (notification.pageId) {
      // We need to find the spaceId for this page to navigate properly.
      // For now, navigate using a search-based approach.
      setOpen(false);
      router.push(`/api/notifications/goto?pageId=${notification.pageId}`);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="relative inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-100 hover:bg-muted">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-content-border-light px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors duration-100 hover:text-foreground"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`flex w-full items-start gap-3 border-b border-content-border-light px-4 py-3 text-left transition-colors duration-100 hover:bg-muted ${
                  !n.isRead ? "bg-accent/30" : ""
                }`}
              >
                <NotificationIcon type={n.type} />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs leading-relaxed ${
                      !n.isRead ? "font-medium text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {n.message}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {relativeTime(n.createdAt)}
                  </p>
                </div>
                {!n.isRead && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
