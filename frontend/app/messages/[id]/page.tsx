"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Loader } from "@/components/ui/loader";
import {
  listMessages,
  sendMessage,
  deleteMessage,
  getStoredAccessToken,
  getStoredUserId,
  ApiError,
  type Message,
} from "@/lib/api";
import { formatDateTime, getInitials } from "@/lib/utils";

export default function ConversationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const conversationId = Number(params.id);

  const [messages, setMessages] = useState<Message[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentUserId(getStoredUserId());
  }, []);

  const loadMessages = async () => {
    try {
      const data = await listMessages(conversationId, 100, 0);
      setMessages(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("This conversation no longer exists or you don't have access.");
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load messages.");
      }
    }
  };

  useEffect(() => {
    if (!getStoredAccessToken()) {
      router.replace("/login");
      return;
    }
    if (Number.isNaN(conversationId)) {
      setError("Invalid conversation id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    loadMessages().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, router]);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const newMsg = await sendMessage(conversationId, content);
      setMessages((prev) => (prev ? [...prev, newMsg] : [newMsg]));
      setDraft("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId: number) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteMessage(messageId);
      setMessages((prev) =>
        prev ? prev.filter((m) => m.id !== messageId) : prev
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not delete message."
      );
    }
  };

  // Get partner id from messages (the sender that isn't us)
  const partnerId =
    messages?.find((m) => m.sender_id !== currentUserId)?.sender_id ?? null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      <Navbar />

      <div className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 flex flex-col">
        <Link
          href="/messages"
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4 self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          All messages
        </Link>

        <div className="flex-1 flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm min-h-[60vh]">
          {/* Conversation header */}
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3 bg-[var(--background)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--sdsu-red)] to-[var(--sdsu-red-dark)] text-white text-sm font-semibold">
              {getInitials(partnerId ? `User ${partnerId}` : "?")}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold truncate">
                {partnerId ? `User #${partnerId}` : "Conversation"}
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Conversation #{conversationId}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader />
              </div>
            ) : error ? (
              <div className="rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-4 text-sm text-[var(--destructive)]">
                {error}
              </div>
            ) : !messages || messages.length === 0 ? (
              <div className="text-center py-12 text-sm text-[var(--muted-foreground)]">
                <p>No messages yet.</p>
                <p className="text-xs mt-1">
                  Start the conversation with a friendly hello.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender_id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"} group`}
                  >
                    <div
                      className={`max-w-[75%] flex flex-col ${
                        isMine ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words ${
                          isMine
                            ? "bg-[var(--sdsu-red)] text-white rounded-br-md"
                            : "bg-[var(--secondary)] text-[var(--foreground)] rounded-bl-md"
                        }`}
                      >
                        {msg.message_text}
                      </div>
                      <div
                        className={`flex items-center gap-2 mt-1 text-[10px] text-[var(--muted-foreground)] ${
                          isMine ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span>{formatDateTime(msg.created_at)}</span>
                        {isMine && (
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                            title="Delete message"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSend}
            className="border-t border-[var(--border)] p-3 bg-[var(--background)] flex items-end gap-2"
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e as unknown as React.FormEvent);
                }
              }}
              placeholder="Type a message…"
              rows={1}
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--sdsu-red)] focus:outline-none focus:ring-2 focus:ring-[var(--sdsu-red)]/30 resize-none max-h-32"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              className="inline-flex items-center justify-center rounded-lg bg-[var(--sdsu-red)] h-10 w-10 text-white hover:bg-[var(--sdsu-red-dark)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              title="Send"
              aria-label="Send"
            >
              {sending ? <Loader /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>

        <p className="mt-3 text-[10px] text-center text-[var(--muted-foreground)]">
          Stay safe — meet recipients in well-lit, public campus areas.
        </p>
      </div>
    </div>
  );
}
