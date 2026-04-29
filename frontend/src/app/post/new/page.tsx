"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import PostForm from "@/components/PostForm";
import { getStoredAccessToken } from "@/lib/api";

export default function NewPostPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getStoredAccessToken()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <Link
          href="/home"
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create a post</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Tell the community about an item you lost or found on campus.
          </p>
        </div>

        <PostForm submitLabel="Publish post" />
      </div>
    </div>
  );
}
