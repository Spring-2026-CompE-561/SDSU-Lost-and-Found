"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Inbox, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Loader } from "@/components/ui/loader";
import {
  listConversations,
  deleteConversation,
  getStoredAccessToken,
  ApiError,
  type ConversationListItem,
} from "@/lib/api";
import { getInitials } from "@/lib/utils";

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<
    ConversationListItem[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!getStoredAccessToken()) {
      router.replace("/login");
      return;
    }
    let mounted = true;
    setLoading(true);
    listConversations(50, 0)
      .then((data) => {
        if (mounted) setConversations(data);
      })
      .catch((err) => {
        if (!mounted) return;
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Could not load your conversations.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [router]);

  const handleDelete = async (
    e: React.MouseEvent,
    conversationId: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this conversation? All messages will be lost."))
      return;
    setDeletingId(conversationId);
    try {
      await deleteConversation(conversationId);
      setConversations((prev) =>
        prev ? prev.filter((c) => c.id !== conversationId) : prev
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to delete the conversation."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[var(--sdsu-red)]" />
            Messages
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Conversations you&apos;ve started or received about lost &amp; found posts.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-6 text-center">
            <p className="text-sm font-medium text-[var(--destructive)]">
              {error}
            </p>
          </div>
        ) : !conversations || conversations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sdsu-red)]/10 text-[var(--sdsu-red)] mb-4">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No messages yet</h3>
            <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto mb-4">
              When you message someone from a post, your conversations will
              show up here.
            </p>
            <Link
              href="/home"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--sdsu-red)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--sdsu-red-dark)] transition-colors"
            >
              Browse posts
            </Link>
          </div>
        ) : (
          <ul className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden divide-y divide-[var(--border)]">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/messages/${c.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-[var(--secondary)]/50 transition-colors"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--sdsu-red)] to-[var(--sdsu-red-dark)] text-white text-sm font-semibold">
                    {getInitials(`User ${c.partner_id}`)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                      User #{c.partner_id}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">
                      {c.last_message ?? "No messages yet — say hi"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, c.id)}
                    disabled={deletingId === c.id}
                    className="p-2 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)] transition-colors disabled:opacity-60"
                    title="Delete conversation"
                  >
                    {deletingId === c.id ? (
                      <Loader />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
