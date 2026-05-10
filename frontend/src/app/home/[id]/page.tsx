"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Clock,
  MessageCircle,
  Pencil,
  Trash2,
  CheckCircle2,
  ImageOff,
  User as UserIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Loader } from "@/components/ui/loader";
import {
  getItem,
  getUser,
  deleteItem,
  updateItemStatus,
  createOrFindConversation,
  getStoredUserId,
  getStoredAccessToken,
  ApiError,
  type Item,
  type User,
} from "@/lib/api";
import { formatDateTime, getInitials } from "@/lib/utils";

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const itemId = Number(params.id);

  const [item, setItem] = useState<Item | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInFlight, setActionInFlight] = useState<
    "delete" | "status" | "message" | null
  >(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    setCurrentUserId(getStoredUserId());
  }, []);

  useEffect(() => {
    if (Number.isNaN(itemId)) {
      setError("Invalid item id.");
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    setError(null);

    getItem(itemId)
      .then(async (it) => {
        if (!mounted) return;
        setItem(it);
        // Try to fetch the owner's name. Requires auth — silently skip on 401.
        if (getStoredAccessToken()) {
          try {
            const u = await getUser(it.user_id);
            if (mounted) setOwner(u);
          } catch {
            /* silent — not all backends require auth here */
          }
        }
      })
      .catch((err) => {
        if (!mounted) return;
        if (err instanceof ApiError && err.status === 404) {
          setError("This post no longer exists.");
        } else if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load this post.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [itemId]);

  const isOwner = !!item && currentUserId !== null && item.user_id === currentUserId;

  const handleDelete = async () => {
    if (!item) return;
    if (
      !window.confirm(
        "Delete this post permanently? This action can't be undone."
      )
    )
      return;
    setActionInFlight("delete");
    try {
      await deleteItem(item.id);
      router.push("/home");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete post.");
      setActionInFlight(null);
    }
  };

  const handleToggleStatus = async () => {
    if (!item) return;
    setActionInFlight("status");
    try {
      await updateItemStatus(item.id, !item.given_back);
      setItem({ ...item, given_back: !item.given_back });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to update status."
      );
    } finally {
      setActionInFlight(null);
    }
  };

  const handleMessageOwner = async () => {
    if (!item) return;
    if (!getStoredAccessToken()) {
      router.push("/login");
      return;
    }
    if (isOwner) return;
    setActionInFlight("message");
    try {
      const convo = await createOrFindConversation(item.user_id);
      router.push(`/messages/${convo.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not start a conversation."
      );
      setActionInFlight(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <Link
          href="/home"
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-6 text-center">
            <p className="text-sm font-medium text-[var(--destructive)]">
              {error}
            </p>
            <Link
              href="/home"
              className="inline-block mt-3 text-sm font-medium underline text-[var(--destructive)]"
            >
              Back to feed
            </Link>
          </div>
        ) : item ? (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Image */}
            <div className="lg:col-span-3">
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--secondary)] flex items-center justify-center">
                {item.image_url && !imgFailed ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 700px"
                    className="object-cover"
                    onError={() => setImgFailed(true)}
                    unoptimized
                    priority
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[var(--muted-foreground)]">
                    <ImageOff className="h-12 w-12" />
                    <span className="text-sm">No photo provided</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-2 space-y-4">
              {/* Status badge */}
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium ${
                  item.given_back
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-[var(--sdsu-red)]/10 text-[var(--sdsu-red)] border-[var(--sdsu-red)]/30"
                }`}
              >
                {item.given_back ? "Returned" : "Active"}
              </span>

              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                {item.title}
              </h1>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>Posted {formatDateTime(item.created_at)}</span>
                </div>
                {owner && (
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                    <UserIcon className="h-4 w-4 shrink-0" />
                    <span>
                      By{" "}
                      <span className="font-medium text-[var(--foreground)]">
                        {owner.first_name} {owner.last_name}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-2">
                  Description
                </h2>
                <p className="text-sm whitespace-pre-wrap leading-relaxed text-[var(--foreground)]">
                  {item.description}
                </p>
              </div>

              {/* Owner section: avatar + name */}
              {owner && (
                <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--sdsu-red)] to-[var(--sdsu-red-dark)] text-white text-sm font-semibold shrink-0">
                    {getInitials(`${owner.first_name} ${owner.last_name}`)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {owner.first_name} {owner.last_name}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">
                      {owner.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-2">
                {isOwner ? (
                  <>
                    <Link
                      href={`/post/${item.id}/edit`}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--sdsu-red)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--sdsu-red-dark)] transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit post
                    </Link>
                    <button
                      onClick={handleToggleStatus}
                      disabled={actionInFlight !== null}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {item.given_back
                        ? "Mark as still active"
                        : "Mark as returned"}
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={actionInFlight !== null}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--destructive)]/30 px-4 py-2.5 text-sm font-medium text-[var(--destructive)] hover:bg-[var(--destructive)]/5 transition-colors disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete post
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleMessageOwner}
                    disabled={actionInFlight !== null}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--sdsu-red)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--sdsu-red-dark)] transition-colors disabled:opacity-60"
                  >
                    {actionInFlight === "message" ? (
                      <Loader />
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4" />
                        Message poster
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
