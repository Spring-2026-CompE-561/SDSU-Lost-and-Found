"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";

function getStoredUserName() {
  if (typeof window === "undefined") return "";
  const token = localStorage.getItem("token");
  if (!token) return "";
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const email = localStorage.getItem("email");
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();
  return fullName || email || "Signed in";
}

export default function Navbar() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setUserName(getStoredUserName());
    setIsDark(document.documentElement.classList.contains("dark"));

    function handleSignOut() {
      setUserName("");
    }

    globalThis.addEventListener("auth:signout", handleSignOut);
    return () => globalThis.removeEventListener("auth:signout", handleSignOut);
  }, []);

  function toggleDarkMode() {
    const html = document.documentElement;
    const newDark = !html.classList.contains("dark");
    html.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
    setIsDark(newDark);
  }

  function handleSignOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("email");
    setUserName("");
    globalThis.dispatchEvent(new Event("auth:signout"));
    router.push("/");
  }

  const isSignedIn = userName.length > 0;

  return (
    <nav className="w-full border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {/* SDSU letters — always red, no dark mode change needed */}
          <svg
            viewBox="0 0 100 44"
            width={72}
            aria-label="SDSU"
            style={{ height: "auto", display: "block" }}
          >
            <text
              x="50"
              y="38"
              fontFamily="'Times New Roman', Times, Georgia, serif"
              fontSize="40"
              fontWeight="700"
              fill="#C8102E"
              textAnchor="middle"
            >
              SDSU
            </text>
          </svg>

          {/* Divider between SDSU and university name */}
          <div className="h-8 w-px bg-gray-400 dark:bg-gray-500" />

          {/* San Diego State University — currentColor flips with dark mode */}
          <svg
            viewBox="0 0 115 38"
            width={100}
            aria-label="San Diego State University"
            className="text-gray-900 dark:text-white"
            style={{ height: "auto", display: "block" }}
          >
            <text
              x="0"
              y="15"
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="13"
              fontWeight="400"
              fill="currentColor"
            >
              San Diego State
            </text>
            <text
              x="0"
              y="32"
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="13"
              fontWeight="400"
              fill="currentColor"
            >
              University
            </text>
          </svg>

          {/* Divider before Lost & Found */}
          <div className="h-10 w-px bg-gray-300 dark:bg-gray-600" />

          {/* Lost & Found — unchanged */}
          <Image
            src="/logo-lost-found.svg"
            alt="Lost & Found"
            width={130}
            height={26}
            loading="eager"
            style={{ height: "auto" }}
          />
        </Link>

        {/* Nav links + dark mode toggle */}
        <div className="flex items-center gap-1 font-heading text-sm font-semibold sm:gap-3">
          <Link
            href="/"
            className="hidden rounded-md px-2 py-1 text-gray-700 transition-colors hover:text-[#C8102E] dark:text-gray-200 dark:hover:text-[#e84060] sm:inline"
          >
            Home
          </Link>

          <Link
            href="/create-post"
            className="hidden rounded-md px-2 py-1 text-gray-700 transition-colors hover:text-[#C8102E] dark:text-gray-200 dark:hover:text-[#e84060] md:inline"
          >
            Create Post
          </Link>

          <Link
            href="/about"
            className="hidden rounded-md px-2 py-1 text-gray-700 transition-colors hover:text-[#C8102E] dark:text-gray-200 dark:hover:text-[#e84060] md:inline"
          >
            About
          </Link>

          {isSignedIn ? (
            <>
              <Link
                href="/account"
                className="hidden rounded-md px-2 py-1 text-gray-700 transition-colors hover:text-[#C8102E] dark:text-gray-200 dark:hover:text-[#e84060] sm:inline"
              >
                My Account
              </Link>

              <button
                onClick={handleSignOut}
                className="rounded-md px-2 py-1 text-gray-700 transition-colors hover:text-[#C8102E] dark:text-gray-200 dark:hover:text-[#e84060]"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-md px-2 py-1 text-gray-700 transition-colors hover:text-[#C8102E] dark:text-gray-200 dark:hover:text-[#e84060] sm:inline"
              >
                Sign In
              </Link>

              <Link
                href="/create-account"
                className="hidden items-center rounded-md bg-[#C8102E] px-3 py-1.5 text-white transition-colors hover:bg-[#a00d24] md:inline-flex"
              >
                Create Account
              </Link>
            </>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
