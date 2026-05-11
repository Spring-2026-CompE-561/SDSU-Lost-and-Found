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
      <div className="flex h-20 w-full items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
        >
          {/* Light mode logo — black text */}
          <Image
            src="/sdsu_logo.png"
            alt="SDSU San Diego State University"
            width={220}
            height={66}
            priority
            className="block h-10 w-auto object-contain dark:hidden"
          />
          {/* Dark mode logo — white text */}
          <Image
            src="/sdsu_logo_BLACK.png"
            alt="SDSU San Diego State University"
            width={220}
            height={66}
            priority
            className="hidden h-10 w-auto object-contain dark:block"
          />
          <span className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
          <span className="whitespace-nowrap font-heading text-sm font-bold text-gray-900 dark:text-white">
            Lost &amp; Found
          </span>
        </Link>

        {/* Nav links + dark mode toggle */}
        <div className="flex items-center gap-1 font-heading text-sm font-semibold sm:gap-3">
          <Link
            href="/home"
            className="hidden rounded-md px-2 py-1 text-gray-700 transition-all hover:bg-gray-100 hover:text-[#C8102E] dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-[#e84060] sm:inline"
          >
            Browse Items
          </Link>

          <Link
            href="/about"
            className="hidden rounded-md px-2 py-1 text-gray-700 transition-all hover:bg-gray-100 hover:text-[#C8102E] dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-[#e84060] md:inline"
          >
            About
          </Link>

          {isSignedIn ? (
            <>
              <Link
                href="/account"
                className="hidden rounded-md px-2 py-1 text-gray-700 transition-all hover:bg-gray-100 hover:text-[#C8102E] dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-[#e84060] sm:inline"
              >
                My Account
              </Link>

              <button
                onClick={handleSignOut}
                className="rounded-md bg-[#C8102E] px-3 py-1.5 font-heading font-semibold text-white transition-all hover:-translate-y-px hover:bg-[#a00d24] hover:shadow-md active:translate-y-0 active:shadow-sm"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-md px-2 py-1 text-gray-700 transition-all hover:bg-gray-100 hover:text-[#C8102E] dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-[#e84060] sm:inline"
              >
                Sign In
              </Link>

              <Link
                href="/create-account"
                className="hidden items-center rounded-md bg-[#C8102E] px-3 py-1.5 text-white transition-all hover:-translate-y-px hover:bg-[#a00d24] hover:shadow-md active:translate-y-0 active:shadow-sm md:inline-flex"
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
