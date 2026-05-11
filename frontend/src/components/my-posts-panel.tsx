"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch, getApiErrorMessage, uploadImage } from "@/lib/api";
import {
  CheckCircle2,
  MapPin,
  PackageOpen,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

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
  const router = useRouter();

  const [posts, setPosts] = useState<ItemPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionPostId, setActionPostId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"status" | "delete" | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [editingPost, setEditingPost] = useState<ItemPost | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editReportType, setEditReportType] = useState<"lost" | "found">(
    "lost",
  );
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editImageError, setEditImageError] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    if (!editImagePreview) return;

    return () => URL.revokeObjectURL(editImagePreview);
  }, [editImagePreview]);

  function handleEditImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setEditImageError(null);

    if (!file) {
      setEditImageFile(null);
      setEditImagePreview(null);
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      setEditImageError("Use JPEG, PNG, GIF, or WebP.");
      setEditImageFile(null);
      setEditImagePreview(null);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setEditImageError("Image must be 5 MB or smaller.");
      setEditImageFile(null);
      setEditImagePreview(null);
      event.target.value = "";
      return;
    }

    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveEditImage() {
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditImageUrl("");
    setEditImageError(null);
  }

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

  function openEditModal(post: ItemPost) {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditDescription(post.description);
    setEditLocation(post.location);
    setEditReportType(post.report_type);
    setEditImageUrl(post.image_url ?? "");
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditImageError(null);
    setMessage("");
    setIsError(false);
  }

  function closeEditModal() {
    setEditingPost(null);
    setEditTitle("");
    setEditDescription("");
    setEditLocation("");
    setEditReportType("lost");
    setEditImageUrl("");
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditImageError(null);
    setIsSavingEdit(false);
  }

  async function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingPost) {
      return;
    }

    const trimmedTitle = editTitle.trim();
    const trimmedDescription = editDescription.trim();
    const trimmedLocation = editLocation.trim();

    if (!trimmedTitle || !trimmedDescription || !trimmedLocation) {
      setIsError(true);
      setMessage("Please fill out title, description, and location.");
      return;
    }

    try {
      setIsSavingEdit(true);
      setMessage("");
      setIsError(false);

      let nextImageUrl: string | null = editImageUrl.trim() || null;

      if (editImageFile) {
        nextImageUrl = await uploadImage(editImageFile);
      }

      await apiFetch<SuccessResponse>(`/api/v1/home/${editingPost.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription,
          location: trimmedLocation,
          report_type: editReportType,
          image_url: nextImageUrl,
        }),
      });

      setPosts((currentPosts) =>
        currentPosts.map((currentPost) =>
          currentPost.id === editingPost.id
            ? {
                ...currentPost,
                title: trimmedTitle,
                description: trimmedDescription,
                location: trimmedLocation,
                report_type: editReportType,
                image_url: nextImageUrl,
              }
            : currentPost,
        ),
      );

      closeEditModal();
      setIsError(false);
      setMessage("Post updated successfully.");
    } catch (error) {
      setIsError(true);
      setMessage(getApiErrorMessage(error));
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleToggleReturned(post: ItemPost) {
    try {
      setActionPostId(post.id);
      setActionType("status");
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
      setActionType(null);
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
      setActionType("delete");
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
      setActionType(null);
    }
  }

  useEffect(() => {
    loadMyPosts();
  }, []);

  return (
    <>
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
            onClick={() => router.push("/create-post")}
            aria-label="Create a new post"
            className="h-11 w-11 rounded-full bg-[#C8102E] p-0 text-white hover:bg-[#a00d24]"
          >
            <Plus className="h-6 w-6" />
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
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Spinner className="h-4 w-4 text-[#C8102E]" />
              Loading your posts...
            </div>
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
              const isStatusBusy = isBusy && actionType === "status";
              const isDeleteBusy = isBusy && actionType === "delete";

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
                          <Badge className="bg-blue-600 text-white">
                            Active
                          </Badge>
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

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleToggleReturned(post)}
                      className="bg-[#C8102E] font-heading font-bold text-white hover:bg-[#a00d24] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isStatusBusy ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4 text-white" />
                          Updating...
                        </>
                      ) : post.given_back ? (
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
                      onClick={() => openEditModal(post)}
                      className="border border-gray-300 bg-white font-heading font-bold text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Post
                    </Button>

                    <Button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDeletePost(post.id)}
                      className="border border-red-200 bg-white font-heading font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDeleteBusy ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4 text-red-700" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Post
                        </>
                      )}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-6 md:items-center">
          <div className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="modal-scrollbar mr-2 max-h-[90vh] overflow-y-auto p-5 pr-7">
              <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-gray-900">
                    Edit Post
                  </h2>

                  <p className="mt-1 text-sm text-gray-600">
                    Update the item information below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Close edit post modal"
                >
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="editReportType"
                    className="block font-heading text-sm font-semibold text-gray-800"
                  >
                    Report Type
                  </label>

                  <select
                    id="editReportType"
                    value={editReportType}
                    onChange={(event) =>
                      setEditReportType(event.target.value as "lost" | "found")
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20"
                  >
                    <option value="lost">Lost Item</option>
                    <option value="found">Found Item</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="editTitle"
                    className="block font-heading text-sm font-semibold text-gray-800"
                  >
                    Item Title
                  </label>

                  <input
                    id="editTitle"
                    type="text"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    maxLength={255}
                    className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="editDescription"
                    className="block font-heading text-sm font-semibold text-gray-800"
                  >
                    Description
                  </label>

                  <textarea
                    id="editDescription"
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                    rows={3}
                    className="mt-2 w-full resize-none rounded-md border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="editLocation"
                    className="block font-heading text-sm font-semibold text-gray-800"
                  >
                    Location
                  </label>

                  <input
                    id="editLocation"
                    type="text"
                    value={editLocation}
                    onChange={(event) => setEditLocation(event.target.value)}
                    maxLength={255}
                    className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="editImage"
                    className="block font-heading text-sm font-semibold text-gray-800"
                  >
                    Image (Optional)
                  </label>

                  <input
                    id="editImage"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleEditImageChange}
                    className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-[#C8102E] file:px-4 file:py-2 file:font-heading file:text-sm file:font-semibold file:text-white hover:file:bg-[#a00d24]"
                  />

                  {(editImagePreview || editImageUrl) && (
                    <div className="mt-3 flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editImagePreview ?? editImageUrl}
                        alt="Selected preview"
                        className="h-32 w-32 rounded-md border border-gray-200 object-cover"
                      />

                      <button
                        type="button"
                        onClick={handleRemoveEditImage}
                        className="font-heading text-xs font-semibold text-red-700 underline hover:text-red-900"
                      >
                        Remove image
                      </button>
                    </div>
                  )}

                  {editImageError && (
                    <p className="mt-2 text-xs text-red-700">
                      {editImageError}
                    </p>
                  )}

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    JPEG, PNG, GIF, or WebP up to 5 MB.
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    onClick={closeEditModal}
                    className="border border-gray-300 bg-white font-heading font-bold text-gray-900 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSavingEdit}
                    className="bg-[#C8102E] font-heading font-bold text-white hover:bg-[#a00d24] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingEdit && (
                      <Spinner className="mr-2 h-4 w-4 text-white" />
                    )}
                    {isSavingEdit ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}