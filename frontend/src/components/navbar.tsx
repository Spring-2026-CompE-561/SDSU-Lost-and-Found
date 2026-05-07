"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

function getStoredUserName() {
  if (typeof window === "undefined") {
    return "";
  }

  const token = localStorage.getItem("token");
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const email = localStorage.getItem("email");

  if (!token) {
    return "";
  }

  const fullName = `${firstName || ""} ${lastName || ""}`.trim();

  if (fullName) {
    return fullName;
  }

  if (email) {
    return email;
  }

  return "Signed in";
}

export default function Navbar() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");

  const isSignedIn = userName.length > 0;
  
  function openMenu() {
  setUserName(getStoredUserName());
  setMenuOpen(true);
}
  function closeMenu() {
    setMenuOpen(false);
  }

  function handleSignOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("email");

    setUserName("");
    setMenuOpen(false);

    globalThis.dispatchEvent(new Event("auth:signout"));

    router.push("/");
  }

  return (
    <>
      <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-6 py-3 md:px-10 flex items-center justify-between">
          {/* Left — SDSU Lost & Found branding */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="SDSU Lost & Found Logo"
              width={300}
              height={64}
              loading="eager"
              style={{ height: "auto" }}
            />
          </Link>

          {/* Right — SDSU-style menu button */}
          <button
            onClick={openMenu}
            className="flex items-center gap-3 font-heading font-semibold text-gray-900 transition-colors hover:text-[#C8102E]"
            aria-label="Open navigation menu"
          >
            <span className="hidden sm:inline">Menu</span>

            {/* Three dashes icon */}
            <span className="flex flex-col gap-1">
              <span className="h-0.5 w-7 rounded bg-current" />
              <span className="h-0.5 w-7 rounded bg-current" />
              <span className="h-0.5 w-7 rounded bg-current" />
            </span>
          </button>
        </div>
      </nav>

      {/* Dark overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={closeMenu}
        />
      )}

      {/* Side menu */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full transform bg-[#971B2F] text-white transition-transform duration-300 ease-in-out sm:w-[420px] ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Menu header */}
        <div className="flex items-start justify-between border-b border-white/20 px-8 pb-8 pt-10">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight">
              SDSU Lost & Found
            </h2>

            {isSignedIn && (
              <p className="mt-2 font-heading text-base font-semibold text-white/85">
                {userName}
              </p>
            )}
          </div>

          <button
            onClick={closeMenu}
            className="text-4xl leading-none transition hover:opacity-80"
            aria-label="Close navigation menu"
          >
            ×
          </button>
        </div>

        {/* Top quick actions */}
        <div className="font-heading flex justify-between gap-4 bg-white px-8 py-5 font-bold text-[#971B2F]">
          {isSignedIn ? (
            <>
              <Link
                href="/account"
                onClick={closeMenu}
                className="hover:underline"
              >
                My Account
              </Link>

              <button onClick={handleSignOut} className="hover:underline">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={closeMenu}
                className="hover:underline"
              >
                Sign In
              </Link>

              <Link
                href="/create-account"
                onClick={closeMenu}
                className="hover:underline"
              >
                Create Account
              </Link>
            </>
          )}
        </div>

        {/* Main menu links */}
        <div className="font-heading flex flex-col gap-8 px-10 py-10 text-2xl font-bold tracking-tight">
          <Link href="/" onClick={closeMenu} className="hover:opacity-80">
            Home
          </Link>

          <Link
            href="/create-post"
            onClick={closeMenu}
            className="hover:opacity-80"
          >
            Create Lost/Found Post
          </Link>

          <Link
            href="/about"
            onClick={closeMenu}
            className="hover:opacity-80"
          >
            About SDSU Lost & Found
          </Link>
        </div>
      </aside>
    </>
  );
}