"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import PostCard from "@/components/post-card";
import ConversationPanel from "@/components/conversation-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, PlusCircle, Search } from "lucide-react";
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

type ReportType = "lost" | "found";

export default function Home() {
  const router = useRouter();

  const [posts, setPosts] = useState<ItemPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ReportType[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [dateRange, setDateRange] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);
  const [conversationRefreshKey, setConversationRefreshKey] = useState(0);
  const [messageActionError, setMessageActionError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      async function fetchPosts() {
        try {
          setIsLoading(true);
          setErrorMessage("");

          const params = new URLSearchParams();

          params.set("limit", "50");
          params.set("offset", "0");
          params.set("active_only", "true");

          const trimmedSearch = searchTerm.trim();
          const trimmedLocation = locationFilter.trim();

          if (trimmedSearch) {
            params.set("search", trimmedSearch);
          }

          if (trimmedLocation) {
            params.set("location", trimmedLocation);
          }

          if (dateRange) {
            params.set("date_range", dateRange);
          }

          // Backend accepts one report_type at a time.
          // If both or none are selected, we show all active posts.
          if (selectedStatuses.length === 1) {
            params.set("report_type", selectedStatuses[0]);
          }

          const data = await apiFetch<ItemPost[]>(
            `/api/v1/home/?${params.toString()}`,
          );

          setPosts(data);
        } catch {
          setErrorMessage("Could not connect to the backend server.");
        } finally {
          setIsLoading(false);
        }
      }

      fetchPosts();
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm, selectedStatuses, locationFilter, dateRange]);

  function toggleStatusFilter(status: ReportType) {
    setSelectedStatuses((currentStatuses) =>
      currentStatuses.includes(status)
        ? currentStatuses.filter((currentStatus) => currentStatus !== status)
        : [...currentStatuses, status],
    );
  }

  function clearFilters() {
    setSearchTerm("");
    setSelectedStatuses([]);
    setLocationFilter("");
    setDateRange("");
  }

  async function handleMessageAboutItem(ownerUserId: number, itemId: number) {
    const token = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    const currentUserId = storedUserId ? Number(storedUserId) : null;

    if (!token) {
      router.push("/login?message=signin-required-message&redirect=/");
      return;
    }

    if (currentUserId === ownerUserId) {
      setMessageActionError("You cannot message yourself about your own post.");
      return;
    }

    try {
      setMessageActionError("");

      const conversation = await createConversation(ownerUserId, itemId);

      setActiveConversationId(conversation.id);
      setConversationRefreshKey((currentKey) => currentKey + 1);
    } catch (error) {
      setMessageActionError(getApiErrorMessage(error));
    }
  }

  const hasActiveFilters =
    searchTerm.trim() ||
    selectedStatuses.length > 0 ||
    locationFilter.trim() ||
    dateRange;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Search Bar */}
      <div className="mx-auto max-w-7xl px-4 pb-2 pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by title, description, or location..."
              className="rounded-md border border-gray-300 bg-white pl-9 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>

          <Link href="/create-post" className="shrink-0">
            <Button className="w-full bg-[#C8102E] font-heading font-bold text-white hover:bg-[#a00d24] sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-4 lg:grid-cols-[220px_minmax(0,1fr)_390px]">
        {/* Left — Filters */}
        <aside className="h-fit rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:sticky lg:top-6 lg:self-start">
          <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-gray-800 dark:text-gray-200">
            Filters
          </h2>

          <div className="space-y-6">
            {/* Status */}
            <section>
              <h3 className="mb-3 font-heading text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Status
              </h3>

              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <label className="flex cursor-pointer items-center gap-2 hover:text-[#C8102E]">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes("lost")}
                    onChange={() => toggleStatusFilter("lost")}
                    className="accent-[#C8102E]"
                  />
                  Lost
                </label>

                <label className="flex cursor-pointer items-center gap-2 hover:text-[#C8102E]">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes("found")}
                    onChange={() => toggleStatusFilter("found")}
                    className="accent-[#C8102E]"
                  />
                  Found
                </label>
              </div>
            </section>

            {/* Location */}
            <section>
              <label
                htmlFor="locationFilter"
                className="mb-3 block font-heading text-xs font-bold uppercase tracking-wide text-gray-500"
              >
                Location
              </label>

              <input
                id="locationFilter"
                type="text"
                value={locationFilter}
                onChange={(event) => setLocationFilter(event.target.value)}
                placeholder="Library, Union..."
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              />
            </section>

            {/* Date */}
            <section>
              <label
                htmlFor="dateRange"
                className="mb-3 block font-heading text-xs font-bold uppercase tracking-wide text-gray-500"
              >
                Date
              </label>

              <select
                id="dateRange"
                value={dateRange}
                onChange={(event) => setDateRange(event.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">Any time</option>
                <option value="today">Today</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
              </select>
            </section>

            {hasActiveFilters && (
              <Button
                type="button"
                onClick={clearFilters}
                className="w-full border border-gray-300 bg-white font-heading font-bold text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              >
                Clear Filters
              </Button>
            )}

            <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
              Returned items are hidden from the home feed automatically.
            </p>
          </div>
        </aside>

        {/* Center — Feed */}
        <main className="space-y-5">
          {messageActionError && (
            <section className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {messageActionError}
            </section>
          )}

          {isLoading && (
            <section className="rounded-xl border border-gray-200 bg-white px-8 py-16 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-300">Loading posts...</p>
            </section>
          )}

          {!isLoading && errorMessage && (
            <section className="rounded-xl border border-red-200 bg-red-50 px-8 py-16 text-center shadow-sm">
              <p className="font-heading text-lg font-bold text-red-800">
                {errorMessage}
              </p>
            </section>
          )}

          {!isLoading && !errorMessage && posts.length > 0 && (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  {...post}
                  onMessageAboutItem={handleMessageAboutItem}
                />
              ))}
            </>
          )}

          {!isLoading && !errorMessage && posts.length === 0 && (
            <section className="flex min-h-[470px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-8 py-16 text-center shadow-sm dark:border-gray-600 dark:bg-gray-800">
              <div className="max-w-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#C8102E] dark:bg-red-900/30">
                  <PlusCircle size={34} />
                </div>

                <h1 className="mt-6 font-heading text-3xl font-bold text-gray-900 dark:text-gray-100">
                  No matching items found
                </h1>

                <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Try changing your search or filters. If you lost or found an
                  item, you can also create a new post.
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
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <ConversationPanel
            activeConversationId={activeConversationId}
            refreshKey={conversationRefreshKey}
          />
        </aside>
      </div>
    </div>
  );
}