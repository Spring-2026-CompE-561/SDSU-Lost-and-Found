"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch, getApiErrorMessage } from "@/lib/api";
import {
  CheckCircle2,
  MapPin,
  PackageOpen,
  RotateCcw,
  Trash2,
} from "lucide-react";

type ItemPost = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  location: string;
  report_type: "lost" | "found";
  image_url: string | null;
  given_back: boolean;
  created_at: string;
};

type SuccessResponse = {
  success: boolean;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function MyPostsPanel() {
  const [posts, setPosts] = useState<ItemPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionPostId, setActionPostId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function loadMyPosts() {
    try {
      setMessage("");
      setIsError(false);
      setIsLoading(true);

      const data = await apiFetch<ItemPost[]>("/api/v1/home/my-posts");

      setPosts(data);
    } catch (error) {
      setIsError(true);
      setMessage(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleReturned(post: ItemPost) {
    try {
      setActionPostId(post.id);
      setMessage("");
      setIsError(false);

      await apiFetch<SuccessResponse>(`/api/v1/home/${post.id}`, {
        method: "PUT",
        body: JSON.stringify({
          given_back: !post.given_back,
        }),
      });

      setPosts((currentPosts) =>
        currentPosts.map((currentPost) =>
          currentPost.id === post.id
            ? { ...currentPost, given_back: !currentPost.given_back }
            : currentPost,
        ),
      );

      setMessage(
        post.given_back
          ? "Post marked as active again. It will show on the home feed."
          : "Post marked as returned. It will no longer show on the home feed.",
      );
    } catch (error) {
      setIsError(true);
      setMessage(getApiErrorMessage(error));
    } finally {
      setActionPostId(null);
    }
  }

  async function handleDeletePost(postId: number) {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this post?",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setActionPostId(postId);
      setMessage("");
      setIsError(false);

      await apiFetch<SuccessResponse>(`/api/v1/home/${postId}`, {
        method: "DELETE",
      });

      setPosts((currentPosts) =>
        currentPosts.filter((currentPost) => currentPost.id !== postId),
      );

      setMessage("Post deleted successfully.");
    } catch (error) {
      setIsError(true);
      setMessage(getApiErrorMessage(error));
    } finally {
      setActionPostId(null);
    }
  }

  useEffect(() => {
    loadMyPosts();
  }, []);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-gray-900">
            My Posts
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Manage the lost and found posts created by your account.
          </p>
        </div>

        <Button
          type="button"
          onClick={loadMyPosts}
          className="bg-[#C8102E] font-heading font-bold text-white hover:bg-[#a00d24]"
        >
          Refresh
        </Button>
      </div>

      {message && (
        <p
          className={`mt-5 rounded-md px-4 py-3 text-sm ${
            isError ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"
          }`}
        >
          {message}
        </p>
      )}

      {isLoading && (
        <div className="flex min-h-44 items-center justify-center text-center">
          <p className="text-sm text-gray-600">Loading your posts...</p>
        </div>
      )}

      {!isLoading && posts.length === 0 && (
        <div className="flex min-h-52 items-center justify-center text-center">
          <div>
            <PackageOpen className="mx-auto h-12 w-12 text-[#C8102E]" />

            <h3 className="mt-4 font-heading text-xl font-bold text-gray-900">
              No posts yet
            </h3>

            <p className="mt-3 max-w-md text-sm leading-6 text-gray-600">
              Once you create a lost or found item post, it will appear here so
              you can manage it.
            </p>
          </div>
        </div>
      )}

      {!isLoading && posts.length > 0 && (
        <div className="mt-6 grid gap-5">
          {posts.map((post) => {
            const isLost = post.report_type === "lost";
            const isBusy = actionPostId === post.id;

            return (
              <article
                key={post.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-xl font-bold text-gray-900">
                        {post.title}
                      </h3>

                      <Badge className="bg-[#C8102E] text-white">
                        {isLost ? "Lost" : "Found"}
                      </Badge>

                      {post.given_back ? (
                        <Badge className="bg-gray-800 text-white">
                          Returned
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-600 text-white">Active</Badge>
                      )}
                    </div>

                    <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={14} />
                      {post.location} · {formatDate(post.created_at)}
                    </p>

                    <p className="mt-4 text-sm leading-6 text-gray-700">
                      {post.description}
                    </p>
                  </div>

                  {post.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="h-28 w-full rounded-lg object-cover md:w-36"
                    />
                  )}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleToggleReturned(post)}
                    className="bg-[#C8102E] font-heading font-bold text-white hover:bg-[#a00d24] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {post.given_back ? (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Mark Active
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark Returned
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleDeletePost(post.id)}
                    className="border border-red-200 bg-white font-heading font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Post
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}