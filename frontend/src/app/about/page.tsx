import Link from "next/link";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Search,
  MessageCircle,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";

const features = [
  {
    title: "Report lost items",
    description:
      "Create a clear post with the item name, description, location, status, and an image.",
    icon: ClipboardList,
  },
  {
    title: "Search campus posts",
    description:
      "Browse lost and found reports from the SDSU community and filter posts by item status.",
    icon: Search,
  },
  {
    title: "Message securely",
    description:
      "Start conversations with other users about item recovery without exposing personal contact details publicly.",
    icon: MessageCircle,
  },
  {
    title: "Track recovery status",
    description:
      "Posts can show whether an item is still active or has already been returned to its owner.",
    icon: ShieldCheck,
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
      <Navbar />

      <section className="bg-[#f4f4f4] px-6 py-20 dark:bg-gray-800 md:px-16">
        <div className="mx-auto max-w-5xl">
          <p className="font-heading text-sm font-bold uppercase tracking-[0.22em] text-[#C8102E]">
            About the project
          </p>

          <h1 className="mt-4 font-heading text-5xl font-semibold tracking-tight md:text-6xl">
            SDSU Lost &amp; Found
          </h1>

          <div className="mt-6 h-[2px] w-28 bg-[#C8102E]" />

          <p className="mt-8 max-w-3xl text-xl leading-8 text-gray-700 dark:text-gray-300">
            SDSU Lost &amp; Found is a campus web application that helps
            students, staff, and faculty report lost or found items, search
            existing posts, and communicate with each other to return belongings
            safely.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#C8102E] dark:bg-red-900/30">
                    <Icon size={24} />
                  </div>

                  <h2 className="mt-5 font-heading text-xl font-bold text-gray-900 dark:text-gray-100">
                    {feature.title}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <section>
              <h2 className="font-heading text-3xl font-bold text-gray-900 dark:text-gray-100">
                Why this app matters
              </h2>

              <p className="mt-5 text-lg leading-8 text-gray-700 dark:text-gray-300">
                Lost items on campus are usually scattered across group chats,
                front desks, classrooms, and word of mouth. This app centralizes
                the process so users can post, search, and recover items from
                one organized place.
              </p>

              <p className="mt-5 text-lg leading-8 text-gray-700 dark:text-gray-300">
                The platform also adds accountability by connecting posts to
                user accounts and keeping item communication inside the app
                through the messaging system.
              </p>
            </section>

            <aside className="rounded-xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
                Current project stack
              </h3>

              <ul className="mt-6 space-y-4 text-gray-700 dark:text-gray-300">
                <li>
                  <span className="font-semibold text-[#C8102E]">•</span>{" "}
                  Frontend: Next.js, React, TypeScript, Tailwind CSS
                </li>
                <li>
                  <span className="font-semibold text-[#C8102E]">•</span>{" "}
                  Backend: Python FastAPI, SQLAlchemy, Pydantic
                </li>
                <li>
                  <span className="font-semibold text-[#C8102E]">•</span>{" "}
                  Authentication: JWT access tokens and refresh tokens
                </li>
                <li>
                  <span className="font-semibold text-[#C8102E]">•</span>{" "}
                  Database: SQLite for local development
                </li>
              </ul>
            </aside>
          </div>

          <div className="mt-16 rounded-xl bg-[#971B2F] px-8 py-10 text-white shadow-sm md:flex md:items-center md:justify-between md:gap-8">
            <div>
              <h2 className="font-heading text-3xl font-bold">
                Ready to help return an item?
              </h2>

              <p className="mt-3 max-w-2xl text-white/85">
                Create a lost or found post so the SDSU community can help match
                items with the right owner.
              </p>
            </div>

            <Link href="/create-post">
              <Button className="mt-8 bg-white font-heading font-bold text-[#971B2F] hover:bg-gray-100 md:mt-0">
                Create a Post
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}