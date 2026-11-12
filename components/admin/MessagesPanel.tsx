"use client";
import { Loader2, Mail, MailOpen, RefreshCw, Reply, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { deleteMessage, loadMessages, setMessageRead, type Message } from "@/lib/admin-client";
import type { Notify } from "./CollectionEditor";

const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function MessagesPanel({ notify }: { notify: Notify }) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const reload = useCallback(
    () =>
      loadMessages()
        .then(setMessages)
        .catch(() => notify("Could not load messages. Are the Firestore rules deployed?", "error")),
    [notify],
  );
  useEffect(() => {
    reload();
  }, [reload]);

  if (!messages) {
    return (
      <p className="flex items-center gap-2 text-muted">
        <Loader2 size={18} className="animate-spin" aria-hidden /> Loading…
      </p>
    );
  }

  const unread = messages.filter((m) => !m.read).length;
  const shown = unreadOnly ? messages.filter((m) => !m.read) : messages;

  const toggleRead = async (m: Message) => {
    setBusy(m.id);
    try {
      await setMessageRead(m.id, !m.read);
      setMessages((list) => list!.map((x) => (x.id === m.id ? { ...x, read: !m.read } : x)));
    } catch (e) {
      notify(e instanceof Error ? e.message : "Update failed.", "error");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (m: Message) => {
    setBusy(m.id);
    try {
      await deleteMessage(m.id);
      setMessages((list) => list!.filter((x) => x.id !== m.id));
      notify("Message deleted.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Delete failed.", "error");
    } finally {
      setBusy(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-text">
          Messages{" "}
          <span className="font-mono text-base font-normal text-muted">
            {unread} unread / {messages.length}
          </span>
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            aria-pressed={unreadOnly}
            onClick={() => setUnreadOnly((v) => !v)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
              unreadOnly ? "border-accent text-accent" : "border-line text-text hover:border-accent"
            }`}
          >
            Unread only
          </button>
          <button
            type="button"
            onClick={() => {
              setMessages(null);
              reload();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-medium text-text hover:border-accent"
          >
            <RefreshCw size={15} aria-hidden /> Refresh
          </button>
        </div>
      </div>

      {shown.length === 0 && <p className="text-muted">{unreadOnly ? "No unread messages." : "No messages yet."}</p>}

      <ul className="space-y-3">
        {shown.map((m) => (
          <li
            key={m.id}
            className={`border-2 bg-surface p-5 shadow-hard ${m.read ? "border-line" : "border-accent"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-semibold text-text">
                  {!m.read && <span className="size-2 rounded-full bg-accent" aria-label="Unread" />}
                  {m.name}
                </p>
                <a href={`mailto:${m.email}`} className="break-all text-sm text-accent hover:underline">
                  {m.email}
                </a>
              </div>
              <time className="font-mono text-xs text-muted" dateTime={m.createdAt?.toISOString()}>
                {m.createdAt ? fmt.format(m.createdAt) : "Just now"}
              </time>
            </div>
            <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-text">{m.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message on yashdingar.in")}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-bg border-2 border-line font-display text-sm shadow-hard-sm transition hover:-translate-x-px hover:-translate-y-px"
              >
                <Reply size={15} aria-hidden /> Reply
              </a>
              <button
                type="button"
                disabled={busy === m.id}
                onClick={() => toggleRead(m)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-text hover:border-accent disabled:opacity-60"
              >
                {m.read ? <Mail size={15} aria-hidden /> : <MailOpen size={15} aria-hidden />}
                Mark as {m.read ? "unread" : "read"}
              </button>
              {confirmDelete === m.id ? (
                <>
                  <button
                    type="button"
                    disabled={busy === m.id}
                    onClick={() => remove(m)}
                    className="inline-flex items-center gap-1.5 rounded-lg border-2 border-line bg-danger font-display shadow-hard-sm px-3 py-1.5 text-sm font-semibold text-bg"
                  >
                    <Trash2 size={15} aria-hidden /> Confirm delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(null)}
                    className="rounded-lg border border-line px-3 py-1.5 text-sm text-text"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(m.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-text hover:border-danger"
                >
                  <Trash2 size={15} aria-hidden /> Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
