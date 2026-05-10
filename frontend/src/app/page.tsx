"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MessageCircle,
  PackageCheck,
  Search,
  ShieldCheck,
} from "lucide-react";

export default function WelcomePage() {
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
                    Example preview
                  </p>
                </div>

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-[#C8102E] dark:bg-red-900/40">
                  Live Feed
                </span>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 h-28 rounded-lg bg-gray-200 dark:bg-gray-700" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-lg font-bold">
                        Black Hydro Flask
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Love Library · Today
                      </p>
                    </div>
                    <span className="rounded-full bg-[#C8102E] px-3 py-1 text-xs font-bold text-white">
                      Found
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-lg font-bold">
                        Red SDSU Backpack
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Student Union · Yesterday
                      </p>
                    </div>
                    <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-bold text-white dark:bg-gray-700">
                      Lost
                    </span>
                  </div>
                </div>
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
              <h3 className="font-heading text-xl font-bold">
                Post an item
              </h3>
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

      <section className="bg-gray-50 px-6 py-16 dark:bg-gray-800/50 md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-3xl bg-[#C8102E] p-8 text-white shadow-lg md:flex-row md:items-center md:p-10">
          <div>
            <h2 className="font-heading text-3xl font-bold">
              Ready to recover an item?
            </h2>
            <p className="mt-3 max-w-2xl text-white/85">
              Start by browsing the feed or creating a report for something lost
              or found on campus.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/home">
              <Button className="w-full bg-white font-heading font-bold text-[#C8102E] hover:bg-gray-100 sm:w-auto">
                Browse Items
              </Button>
            </Link>

            <Link href="/create-account">
              <Button className="w-full border border-white/40 bg-transparent font-heading font-bold text-white hover:bg-white/10 sm:w-auto">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}