"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendMessage, markThreadRead } from "@/app/messages/actions";

type Message = { id: string; body: string; createdAt: string; senderId: string };

export default function MessageThread({
  counterpartUserId,
  currentUserId,
  messages,
}: {
  counterpartUserId: string;
  currentUserId: string;
  messages: Message[];
}) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markThreadRead(counterpartUserId).catch(() => {});
  }, [counterpartUserId, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setError(null);
    startTransition(async () => {
      try {
        await sendMessage(counterpartUserId, trimmed);
        setBody("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't send that message.");
      }
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto py-2">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted">
            No messages yet — say hello.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-[13.5px] ${
                    mine ? "bg-accent text-bg" : "border border-border bg-surface-2 text-text"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-bg/70" : "text-muted"}`}>
                    {new Date(m.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-[12px] text-red-400">{error}</p>}

      <form onSubmit={handleSend} className="mt-2 flex items-end gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={1}
          placeholder="Write a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          className="min-w-0 flex-1 resize-none rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-[14px] text-text outline-none focus-visible:border-accent"
        />
        <button
          type="submit"
          disabled={pending || body.trim().length === 0}
          className="shrink-0 rounded-xl bg-accent px-4 py-2.5 text-[12px] font-bold tracking-wide text-bg uppercase disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
