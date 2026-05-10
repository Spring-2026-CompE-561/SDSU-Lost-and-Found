"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import {
  ArrowRight,
  MapPin,
  MessageCircle,
  PackageCheck,
  Search,
  ShieldCheck,
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

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export default function WelcomePage() {
  const [recentPosts, setRecentPosts] = useState<ItemPost[]>([]);
  const [isLoadingRecentPosts, setIsLoadingRecentPosts] = useState(true);

  useEffect(() => {
    async function loadRecentPosts() {
      try {
        setIsLoadingRecentPosts(true);

        const data = await apiFetch<ItemPost[]>(
          "/api/v1/home/?limit=10&offset=0&active_only=true",
        );

        const latestActivePosts = data
          .filter((post) => !post.given_back)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )
          .slice(0, 2);

        setRecentPosts(latestActivePosts);
      } catch {
        setRecentPosts([]);
      } finally {
        setIsLoadingRecentPosts(false);
      }
    }

    loadRecentPosts();
  }, []);

  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Navbar />

      <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-white via-gray-50 to-red-50 px-6 py-20 dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-red-950/30 md:px-16">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="font-heading text-5xl font-extrabold leading-tight tracking-tight text-gray-950 dark:text-white md:text-7xl">
              Lost something at SDSU?
              <span className="block text-[#C8102E]">Find it faster.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-700 dark:text-gray-300">
              Report lost items, browse found items, and safely message other
              SDSU users to help return belongings across campus.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/home">
                <Button className="w-full bg-[#C8102E] px-6 py-6 font-heading text-base font-bold text-white hover:bg-[#a00d24] sm:w-auto">
                  Browse Lost & Found
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/create-post">
                <Button className="w-full border border-gray-300 bg-white px-6 py-6 font-heading text-base font-bold text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 sm:w-auto">
                  Report an Item
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="rounded-2xl bg-gray-50 p-5 dark:bg-gray-900">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="font-heading text-sm font-bold text-gray-900 dark:text-gray-100">
                    Recent Campus Reports
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Latest active posts
                  </p>
                </div>

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-[#C8102E] dark:bg-red-900/40">
                  Live Feed
                </span>
              </div>

              <div className="space-y-4">
                {isLoadingRecentPosts && (
                  <>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                      <div className="mb-3 h-28 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                      <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                      <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </>
                )}

                {!isLoadingRecentPosts && recentPosts.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
                    <PackageCheck className="mx-auto h-10 w-10 text-[#C8102E]" />
                    <h3 className="mt-4 font-heading text-lg font-bold text-gray-900 dark:text-gray-100">
                      No active reports yet
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Recent lost and found posts will appear here.
                    </p>
                  </div>
                )}

                {!isLoadingRecentPosts &&
                  recentPosts.map((post, index) => {
                    const isLost = post.report_type === "lost";

                    return (
                      <div
                        key={post.id}
                        className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                      >
                        {index === 0 && post.image_url && (
                          <div className="mb-3 h-28 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={post.image_url}
                              alt={post.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}

                        {index === 0 && !post.image_url && (
                          <div className="mb-3 h-28 rounded-lg bg-gray-200 dark:bg-gray-700" />
                        )}

                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-heading text-lg font-bold text-gray-950 dark:text-white">
                              {post.title}
                            </h3>

                            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                              <MapPin size={14} />
                              {post.location} · {formatDate(post.created_at)}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold text-white ${
                              isLost
                                ? "bg-gray-950 dark:bg-gray-700"
                                : "bg-[#C8102E]"
                            }`}
                          >
                            {isLost ? "Lost" : "Found"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h2 className="font-heading text-4xl font-bold text-gray-950 dark:text-white">
              How it works
            </h2>

            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
              A simple process to help SDSU students and staff recover items
              without needing multiple group chats or scattered posts.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#C8102E] dark:bg-red-900/30">
                <PackageCheck />
              </div>
              <h3 className="font-heading text-xl font-bold">Post an item</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                Create a lost or found report with a description, location, and
                optional image.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#C8102E] dark:bg-red-900/30">
                <Search />
              </div>
              <h3 className="font-heading text-xl font-bold">
                Search reports
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                Browse active posts and filter by item type, location, or date.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#C8102E] dark:bg-red-900/30">
                <MessageCircle />
              </div>
              <h3 className="font-heading text-xl font-bold">
                Message safely
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                Contact the owner or finder directly through the built-in
                conversation system.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#C8102E] dark:bg-red-900/30">
                <ShieldCheck />
              </div>
              <h3 className="font-heading text-xl font-bold">
                Return safely
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                Keep item recovery organized and mark posts as returned once
                they are resolved.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-gray-50 px-6 py-12 dark:border-gray-800 dark:bg-gray-950 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 border-b border-gray-300 pb-12 dark:border-gray-800 md:grid-cols-[1.2fr_1fr_1fr]">
            {/* SDSU Contact */}
            <div>
              <h2 className="font-heading text-4xl font-extrabold tracking-wide text-[#C8102E]">
                SDSU
              </h2>

              <p className="mt-6 font-heading text-xl font-bold text-gray-950 dark:text-white">
                San Diego State University
              </p>

              <div className="mt-6 space-y-1 text-base leading-7 text-gray-600 dark:text-gray-400">
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  619-594-5200
                </p>
                <p>5500 Campanile Drive</p>
                <p>San Diego, CA 92182</p>
              </div>
            </div>

            {/* Lost & Found Links */}
            <div>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-gray-100">
                Lost & Found
              </h3>

              <div className="mt-6 grid gap-2 text-base text-gray-600 dark:text-gray-400">
                <Link href="/home" className="transition hover:text-[#C8102E]">
                  Browse Items
                </Link>

                <Link href="/create-post" className="transition hover:text-[#C8102E]">
                  Create Post
                </Link>

                <Link href="/about" className="transition hover:text-[#C8102E]">
                  About
                </Link>

                <Link href="/account" className="transition hover:text-[#C8102E]">
                  My Account
                </Link>
              </div>
            </div>

            {/* Campus Resources */}
            <div>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-gray-100">
                Campus Resources
              </h3>

              <div className="mt-6 grid gap-2 text-base text-gray-600 dark:text-gray-400">
                <a
                  href="https://map.concept3d.com/?id=801#!ct/15205,15544,40419,91344,97540,83801,103110,91346,91347?s/"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#C8102E]"
                >
                  Maps
                </a>

                <a
                  href="https://police.sdsu.edu/crime-prevention-safety/services"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#C8102E]"
                >
                  Campus Safety
                </a>

                <a
                  href="https://it.sdsu.edu/get-help"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#C8102E]"
                >
                  IT Resources
                </a>

                <a
                  href="https://my.sdsu.edu/"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#C8102E]"
                >
                  my.SDSU
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-8 text-sm text-gray-600 dark:text-gray-400 md:flex-row md:items-center md:justify-between">
            <p>© 2026 San Diego State University</p>
            <p>COMPE 561 Full Stack Web Development Project</p>
          </div>
        </div>
      </footer>
    </main>
  );
}