"use client";
import { useState, useEffect } from "react";

type Announcement = {
  id: string;
  title: string;
  message: string;
  target_role: string;
  total_recipients: string;
  read_count: string;
  created_at: string;
};

export default function AnnouncementForm() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  function load() {
    fetch("/api/admin/announcements")
      .then((r) => r.json())
      .then((d) => setAnnouncements(d.announcements || []));
  }

  useEffect(() => { load(); }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMsg("");
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message, target_role: targetRole }),
    });
    setSending(false);
    if (res.ok) {
      setMsg("✅ Announcement sent!");
      setTitle("");
      setMessage("");
      load();
    } else {
      setMsg("❌ Failed to send");
    }
    setTimeout(() => setMsg(""), 3000);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSend} className="glass-card rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-white mb-2">📢 Send Announcement</h3>
        <input
          required
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
        />
        <textarea
          required
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
        />
        <select
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
        >
          <option value="all">Everyone</option>
          <option value="seller">Sellers only</option>
          <option value="reseller">Resellers/Customers only</option>
        </select>
        {msg && <p className="text-sm">{msg}</p>}
        <button type="submit" disabled={sending} className="btn-primary w-full py-3 rounded-lg disabled:opacity-50">
          {sending ? "Sending..." : "Send Announcement"}
        </button>
      </form>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-bold text-white mb-3">Sent Announcements</h3>
        {announcements.length === 0 ? (
          <p className="text-galaxy-400 text-sm">No announcements sent yet.</p>
        ) : (
          <div className="space-y-2">
            {announcements.map((a) => (
              <div key={a.id} className="border-b border-galaxy-400/10 py-3 flex justify-between items-start gap-2">
                <div>
                  <p className="text-white font-medium">{a.title}</p>
                  <p className="text-xs text-galaxy-400 mt-1">{a.message}</p>
                  <p className="text-xs text-galaxy-500 mt-1">
                    To: {a.target_role} • Read {a.read_count}/{a.total_recipients} •{" "}
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex-shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
