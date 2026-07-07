"use client";
import { useEffect, useState } from "react";

type Notification = {
  read_id: string;
  is_read: boolean;
  is_pinned: boolean;
  announcement_id: string;
  title: string;
  message: string;
  created_at: string;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selected, setSelected] = useState<Notification | null>(null);

  function load() {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.notifications || []);
        setUnreadCount(parseInt(d.unreadCount || "0"));
      });
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  async function openNotification(n: Notification) {
    setSelected(n);
    if (!n.is_read) {
      await fetch(`/api/notifications/${n.read_id}/mark-read`, { method: "POST" });
      load();
    }
  }

  async function togglePin(n: Notification, e: React.MouseEvent) {
    e.stopPropagation();
    await fetch(`/api/notifications/${n.read_id}/pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !n.is_pinned }),
    });
    load();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative text-galaxy-300 hover:text-white text-lg"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto glass-card rounded-xl z-50 shadow-2xl">
          <div className="p-3 border-b border-galaxy-400/20 flex justify-between items-center">
            <span className="font-bold text-white text-sm">Notifications</span>
            <button onClick={() => setOpen(false)} className="text-galaxy-400 text-xs">✕</button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-galaxy-400 text-sm p-4">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.read_id}
                onClick={() => openNotification(n)}
                className={`p-3 border-b border-galaxy-400/10 cursor-pointer hover:bg-galaxy-800/40 ${!n.is_read ? "bg-galaxy-800/20" : ""}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className={`text-sm ${!n.is_read ? "text-white font-semibold" : "text-galaxy-300"}`}>
                      {!n.is_read && <span className="text-accent">● </span>}
                      {n.title}
                    </p>
                    <p className="text-xs text-galaxy-500 mt-1 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-galaxy-600 mt-1">
                      {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => togglePin(n, e)}
                    className={`text-xs ${n.is_pinned ? "text-accent" : "text-galaxy-600"}`}
                    title="Pin"
                  >
                    📌
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={() => setSelected(null)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-white mb-2">{selected.title}</h3>
            <p className="text-sm text-galaxy-300 whitespace-pre-wrap">{selected.message}</p>
            <p className="text-xs text-galaxy-500 mt-4">
              {new Date(selected.created_at).toLocaleString()}
            </p>
            <button
              onClick={() => setSelected(null)}
              className="btn-primary w-full mt-4 py-2 rounded-lg text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
