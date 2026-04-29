"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Filter, X, Inbox } from "lucide-react";
import Navbar from "@/components/Navbar";
import RightRail from "@/components/RightRail";
import ItemCard from "@/components/ItemCard";
import { Loader } from "@/components/ui/loader";
import {
  listItems,
  getStoredUserId,
  type ItemListItem,
  ApiError,
} from "@/lib/api";

type StatusFilter = "all" | "active" | "returned";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialLocation = searchParams.get("location") ?? "";
  const initialStatus =
    (searchParams.get("status") as StatusFilter | null) ?? "all";

  const [items, setItems] = useState<ItemListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [locationFilter, setLocationFilter] = useState(initialLocation);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    setCurrentUserId(getStoredUserId());
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    listItems(50, 0)
      .then((data) => {
        if (!mounted) return;
        setItems(data);
      })
      .catch((err) => {
        if (!mounted) return;
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Could not load posts. Is the backend running?");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Client-side filtering — backend doesn't expose query params for these yet,
  // so we filter the result of /home/ in the browser.
  const filteredItems = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (statusFilter === "active" && it.given_back) return false;
      if (statusFilter === "returned" && !it.given_back) return false;
      if (
        locationFilter &&
        !it.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
        return false;
      if (q) {
        const hay = `${it.title} ${it.description} ${it.location}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, search, locationFilter, statusFilter]);

  const updateUrlQuery = (
    nextSearch: string,
    nextLocation: string,
    nextStatus: StatusFilter
  ) => {
    const params = new URLSearchParams();
    if (nextSearch) params.set("q", nextSearch);
    if (nextLocation) params.set("location", nextLocation);
    if (nextStatus !== "all") params.set("status", nextStatus);
    const qs = params.toString();
    router.replace(`/home${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    updateUrlQuery(q, locationFilter, statusFilter);
  };

  const clearFilters = () => {
    setSearch("");
    setLocationFilter("");
    setStatusFilter("all");
    router.replace("/home", { scroll: false });
  };

  const hasActiveFilter =
    !!search || !!locationFilter || statusFilter !== "all";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar onSearch={handleSearch} initialSearch={search} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Main feed column */}
          <main className="flex-1 min-w-0">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Recent posts</h1>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Browse lost and found items posted by the SDSU community.
                </p>
              </div>
              <Link
                href="/post/new"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--sdsu-red)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--sdsu-red-dark)] transition-colors shadow-sm self-start"
              >
                <PlusCircle className="h-4 w-4" />
                New post
              </Link>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 mb-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)] pr-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </div>

                {/* Status pills */}
                <div className="inline-flex rounded-lg border border-[var(--border)] p-0.5">
                  {(["all", "active", "returned"] as StatusFilter[]).map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setStatusFilter(s);
                          updateUrlQuery(search, locationFilter, s);
                        }}
                        className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                          statusFilter === s
                            ? "bg-[var(--sdsu-red)] text-white"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        {s}
                      </button>
                    )
                  )}
                </div>

                {/* Location filter */}
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => {
                    setLocationFilter(e.target.value);
                    updateUrlQuery(search, e.target.value, statusFilter);
                  }}
                  placeholder="Filter by location…"
                  className="flex-1 min-w-0 max-w-xs rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs placeholder:text-[var(--muted-foreground)] focus:border-[var(--sdsu-red)] focus:outline-none focus:ring-2 focus:ring-[var(--sdsu-red)]/30"
                />

                {hasActiveFilter && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Result count */}
            {!loading && !error && items && (
              <p className="text-xs text-[var(--muted-foreground)] mb-3">
                Showing <strong>{filteredItems.length}</strong> of{" "}
                {items.length} {items.length === 1 ? "post" : "posts"}
              </p>
            )}

            {/* Feed body */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-6 text-center">
                <p className="text-sm font-medium text-[var(--destructive)]">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 text-sm font-medium underline text-[var(--destructive)]"
                >
                  Try again
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <EmptyState hasFilter={hasActiveFilter} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    ownedByCurrentUser={
                      "user_id" in item &&
                      currentUserId !== null &&
                      (item as { user_id: number }).user_id === currentUserId
                    }
                  />
                ))}
              </div>
            )}
          </main>

          {/* Right sidebar */}
          <RightRail />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sdsu-red)]/10 text-[var(--sdsu-red)] mb-4">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold mb-1">
        {hasFilter ? "No posts match your filters" : "No posts yet"}
      </h3>
      <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto mb-4">
        {hasFilter
          ? "Try clearing the filters or broadening your search."
          : "Be the first one to post about a lost or found item on campus."}
      </p>
      <Link
        href="/post/new"
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--sdsu-red)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--sdsu-red-dark)] transition-colors"
      >
        <PlusCircle className="h-4 w-4" />
        Create a post
      </Link>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
