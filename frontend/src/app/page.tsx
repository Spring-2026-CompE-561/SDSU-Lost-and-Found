"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import PostCard from "@/components/post-card";
import ConversationPanel from "@/components/conversation-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { apiFetch, createConversation, getApiErrorMessage } from "@/lib/api";

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

export default function Home() {
  const router = useRouter();

  const [posts, setPosts] = useState<ItemPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);
  const [conversationRefreshKey, setConversationRefreshKey] = useState(0);
  const [messageActionError, setMessageActionError] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await apiFetch<ItemPost[]>("/api/v1/home/");
        setPosts(data);
      } catch {
        setErrorMessage("Could not connect to the backend server.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const normalizedSearch = searchTerm.toLowerCase();

      const matchesSearch =
        post.title.toLowerCase().includes(normalizedSearch) ||
        post.description.toLowerCase().includes(normalizedSearch) ||
        post.location.toLowerCase().includes(normalizedSearch);

      const wantsLost = selectedFilters.includes("Status: Lost");
      const wantsFound = selectedFilters.includes("Status: Found");

      const matchesStatus =
        (!wantsLost && !wantsFound) ||
        (wantsLost && post.report_type === "lost") ||
        (wantsFound && post.report_type === "found");

      return matchesSearch && matchesStatus;
    });
  }, [posts, searchTerm, selectedFilters]);

  function toggleFilter(filter: string) {
    setSelectedFilters((currentFilters) =>
      currentFilters.includes(filter)
        ? currentFilters.filter((currentFilter) => currentFilter !== filter)
        : [...currentFilters, filter],
    );
  }

  async function handleMessageAboutItem(ownerUserId: number) {
    const token = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    const currentUserId = storedUserId ? Number(storedUserId) : null;

    if (!token) {
      router.push("/login?message=signin-required&redirect=/");
      return;
    }

    if (currentUserId === ownerUserId) {
      setMessageActionError("You cannot message yourself about your own post.");
      return;
    }

    try {
      setMessageActionError("");

      const conversation = await createConversation(ownerUserId);

      setActiveConversationId(conversation.id);
      setConversationRefreshKey((currentKey) => currentKey + 1);
    } catch (error) {
      setMessageActionError(getApiErrorMessage(error));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Search Bar */}
      <div className="mx-auto max-w-7xl px-4 pb-2 pt-5">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search lost & found items..."
            className="rounded-md border border-gray-300 bg-white pl-9"
          />
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-4 lg:grid-cols-[220px_1fr_340px]">
        {/* Left — Filters */}
        <aside className="h-fit rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-gray-800">
            Filters
          </h2>

          <ul className="space-y-3 text-sm text-gray-700">
            {["Location", "Date", "Status: Lost", "Status: Found", "Color"].map(
              (filter) => (
                <li key={filter}>
                  <label className="flex cursor-pointer items-center gap-2 hover:text-[#C8102E]">
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(filter)}
                      onChange={() => toggleFilter(filter)}
                      className="accent-[#C8102E]"
                    />
                    {filter}
                  </label>
                </li>
              ),
            )}
          </ul>

          <p className="mt-5 text-xs leading-5 text-gray-500">
            Status filters work now. Location, date, and color filters will be
            connected later.
          </p>
        </aside>

        {/* Center — Feed */}
        <main className="space-y-5">
          {messageActionError && (
            <section className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {messageActionError}
            </section>
          )}

          {isLoading && (
            <section className="rounded-xl border border-gray-200 bg-white px-8 py-16 text-center shadow-sm">
              <p className="text-gray-600">Loading posts...</p>
            </section>
          )}

          {!isLoading && errorMessage && (
            <section className="rounded-xl border border-red-200 bg-red-50 px-8 py-16 text-center shadow-sm">
              <p className="font-heading text-lg font-bold text-red-800">
                {errorMessage}
              </p>
            </section>
          )}

          {!isLoading && !errorMessage && filteredPosts.length > 0 && (
            <>
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  {...post}
                  onMessageAboutItem={handleMessageAboutItem}
                />
              ))}
            </>
          )}

          {!isLoading && !errorMessage && filteredPosts.length === 0 && (
            <section className="flex min-h-[470px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-8 py-16 text-center shadow-sm">
              <div className="max-w-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#C8102E]">
                  <PlusCircle size={34} />
                </div>

                <h1 className="mt-6 font-heading text-3xl font-bold text-gray-900">
                  No items posted yet
                </h1>

                <p className="mt-4 text-base leading-7 text-gray-600">
                  Lost and found posts will appear here once users start
                  creating real item reports.
                </p>

                <Link href="/create-post">
                  <Button className="mt-8 bg-[#C8102E] font-heading font-bold text-white hover:bg-[#a00d24]">
                    Create a Post
                  </Button>
                </Link>
              </div>
            </section>
          )}
        </main>

        {/* Right — Messages */}
        <aside>
          <ConversationPanel
            activeConversationId={activeConversationId}
            refreshKey={conversationRefreshKey}
          />
        </aside>
      </div>
    </div>
  );
}