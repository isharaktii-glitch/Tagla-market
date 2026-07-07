"use client";
import { useEffect, useState } from "react";

type Notification = {
  read_id: string;
  is_pinned: boolean;
  title: string;
  message: string;
};

export default function PinnedNotificationsBar() {
  const [pinned, setPinned] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<Notification | null>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setPinned((d.notifications || []).filter((n: Notification) => n.is_pinned)));
  }, []);

  if (pinned.length === 0) return null;

  return (
    <>
      <div className="bg-galaxy-800/60 border-b border-accent/20 px-4 py-2 flex gap-2 overflow-x-auto">
        {pinned.map((n) => (
          <button
            key={n.read_id}
            onClick={() => setSelected(n)}
            className="whitespace-nowrap text-xs px-3 py-1 rounded-full bg-accent/20 text-accent flex items-center gap-1 flex-shrink-0"
          >
            📌 {n.title}
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={() => setSelected(null)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-white mb-2">📌 {selected.title}</h3>
            <p className="text-sm text-galaxy-300 whitespace-pre-wrap">{selected.message}</p>
            <button onClick={() => setSelected(null)} className="btn-primary w-full mt-4 py-2 rounded-lg text-sm">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
