"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import PostForm from "@/components/PostForm";
import { Loader } from "@/components/ui/loader";
import {
  getItem,
  updateItemStatus,
  getStoredAccessToken,
  getStoredUserId,
  ApiError,
  type Item,
  type ItemCreatePayload,
} from "@/lib/api";

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const itemId = Number(params.id);

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getStoredAccessToken()) {
      router.replace("/login");
      return;
    }
    if (Number.isNaN(itemId)) {
      setError("Invalid item id.");
      setLoading(false);
      return;
    }
    let mounted = true;
    getItem(itemId)
      .then((it) => {
        if (!mounted) return;
        const currentUserId = getStoredUserId();
        if (currentUserId !== null && it.user_id !== currentUserId) {
          setError("You don't have permission to edit this post.");
          return;
        }
        setItem(it);
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
  }, [itemId, router]);

  // The current backend PUT only updates the `given_back` flag. We send
  // that through and keep the rest of the form changes local — the team
  // can extend the backend to a full update later.
  const handleSave = async (payload: ItemCreatePayload): Promise<Item | void> => {
    if (!item) return;
    if (payload.given_back !== item.given_back) {
      await updateItemStatus(item.id, !!payload.given_back);
    }
    return { ...item, ...payload, given_back: payload.given_back ?? item.given_back };
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <Link
          href={item ? `/home/${item.id}` : "/home"}
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Edit post</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Update the details of your lost or found item.
          </p>
        </div>

        {/* Inline notice about current backend behaviour */}
        <div className="mb-4 flex gap-3 rounded-lg border border-[var(--sdsu-red)]/20 bg-[var(--sdsu-red)]/5 p-3 text-sm text-[var(--foreground)]">
          <Info className="h-4 w-4 shrink-0 text-[var(--sdsu-red)] mt-0.5" />
          <p>
            The backend currently supports updating an item&apos;s{" "}
            <strong>returned status</strong> only. Edits to the title,
            description, location or image will be saved here for now and
            persisted once the backend exposes a full update endpoint.
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
            <Link
              href="/home"
              className="inline-block mt-3 text-sm font-medium underline text-[var(--destructive)]"
            >
              Back to feed
            </Link>
          </div>
        ) : item ? (
          <PostForm
            initialItem={item}
            onSubmit={handleSave}
            redirectAfter={`/home/${item.id}`}
            submitLabel="Save changes"
          />
        ) : null}
      </div>
    </div>
  );
}
