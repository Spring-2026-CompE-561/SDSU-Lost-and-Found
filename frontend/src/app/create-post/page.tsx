"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { apiFetch, getApiErrorMessage } from "@/lib/api";

export default function CreatePostPage() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if(!token) {
        router.replace("/login?message=signin-required&redirect=/create-post");
    }
}, [router]);

  async function handleCreatePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsError(false);
    setIsSubmitting(true);

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login?message=signin-required&redirect=/create-post");
      return;
    }

    const formData = new FormData(event.currentTarget);

    const reportType = String(formData.get("reportType") || "lost");
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const imageUrl = String(formData.get("imageUrl") || "").trim();

    if (!title || !description || !location) {
      setIsError(true);
      setMessage("Please fill out title, description, and location.");
      setIsSubmitting(false);
      return;
    }

    try {
      await apiFetch("/api/v1/home/", {
        method: "POST",
        body: JSON.stringify({
            title,
            description,
            location,
            report_type: reportType,
            image_url: imageUrl || null,
            given_back: false,
        }),
        });

    setIsError(false);
    setMessage("Post created successfully. Redirecting to homepage...");
    router.push("/");
    } catch (error) {
    setIsError(true);
    setMessage(getApiErrorMessage(error));
    } finally {
    setIsSubmitting(false);
    }
  }

  

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <section className="bg-[#f4f4f4] px-6 py-20 md:px-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-heading text-5xl font-semibold tracking-tight md:text-6xl">
            Create a Post
          </h1>

          <div className="mt-6 h-[2px] w-28 bg-[#C8102E]" />

          <p className="mt-8 max-w-2xl text-xl leading-8 text-gray-700">
            Report a lost or found item so the SDSU community can help recover
            it.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:px-16">
        <div className="mx-auto grid max-w-5xl items-start gap-10 md:grid-cols-[1fr_460px]">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-gray-900">
              Help return items safely
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-700">
              Add clear details about the item, where it was lost or found, and
              any identifying information that can help match it with the right
              person.
            </p>

            <div className="mt-8 space-y-4 text-gray-700">
              <p>
                <span className="font-semibold text-[#C8102E]">•</span> Choose
                whether the item was lost or found.
              </p>

              <p>
                <span className="font-semibold text-[#C8102E]">•</span> Include
                the most specific campus location possible.
              </p>

              <p>
                <span className="font-semibold text-[#C8102E]">•</span> Avoid
                sharing sensitive personal information.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="font-heading text-2xl font-bold text-gray-900">
              Item Information
            </h2>

            <form onSubmit={handleCreatePost} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="reportType"
                  className="block font-heading text-sm font-semibold text-gray-800"
                >
                  Report Type
                </label>

                <select
                  id="reportType"
                  name="reportType"
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20"
                >
                  <option value="lost">Lost Item</option>
                  <option value="found">Found Item</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="block font-heading text-sm font-semibold text-gray-800"
                >
                  Item Title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Red SDSU backpack"
                  maxLength={255}
                  className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block font-heading text-sm font-semibold text-gray-800"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe the item and any helpful details..."
                  rows={5}
                  className="mt-2 w-full resize-none rounded-md border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block font-heading text-sm font-semibold text-gray-800"
                >
                  Location
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Love Library, Student Union, GMCS..."
                  maxLength={255}
                  className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="imageUrl"
                  className="block font-heading text-sm font-semibold text-gray-800"
                >
                  Image URL Optional
                </label>

                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  placeholder="Image upload will be added later"
                  className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20"
                />

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  For now, image upload is not connected. You can leave this
                  empty.
                </p>
              </div>

              {message && (
                <p
                  className={`rounded-md px-4 py-3 text-sm ${
                    isError
                      ? "bg-red-50 text-red-800"
                      : "bg-green-50 text-green-800"
                  }`}
                >
                  {message}
                </p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#C8102E] py-6 font-heading text-base font-bold text-white hover:bg-[#a00d24]"
              >
                {isSubmitting ? "Creating Post..." : "Create Post"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}