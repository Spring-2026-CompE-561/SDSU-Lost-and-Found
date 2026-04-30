"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-6 md:px-20 py-3 flex items-center justify-between">
          
          {/* Left — SDSU Lost & Found branding */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="SDSU Lost & Found Logo"
              width={260}
              height={52}
              loading="eager"
              style={{ height: "auto" }}
            />
          </Link>

          {/* Right — SDSU-style menu button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex items-center gap-3 text-gray-900 font-semibold hover:text-[#C8102E] transition-colors"
            aria-label="Open navigation menu"
          >
            <span className="hidden sm:inline">Menu</span>

            {/* Three dashes icon */}
            <span className="flex flex-col gap-1">
              <span className="w-7 h-0.5 bg-current rounded" />
              <span className="w-7 h-0.5 bg-current rounded" />
              <span className="w-7 h-0.5 bg-current rounded" />
            </span>
          </button>
        </div>
      </nav>

      {/* Dark overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Side menu */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#971B2F] text-white z-50 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Menu header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/20">
          <h2 className="font-heading text-xl font-bold tracking-tight">
            SDSU Lost & Found
          </h2>

          <button
            onClick={() => setMenuOpen(false)}
            className="text-4xl leading-none hover:opacity-80"
            aria-label="Close navigation menu"
          >
            ×
          </button>
        </div>

        {/* Top quick actions */}
        <div className="font-heading bg-white text-[#971B2F] px-8 py-5 flex gap-4 justify-between font-bold">          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="hover:underline"
          >
            Sign In
          </Link>

          <Link
            href="/create-account"
            onClick={() => setMenuOpen(false)}
            className="hover:underline"
          >
            Create Account
          </Link>
        </div>

        {/* Main menu links */}
        <div className="font-heading px-10 py-10 flex flex-col gap-8 text-2xl font-bold tracking-tight">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="hover:opacity-80"
          >
            Home
          </Link>

          <Link
            href="/create-post"
            onClick={() => setMenuOpen(false)}
            className="hover:opacity-80"
          >
            Create Lost/Found Post
          </Link>

          <Link
            href="/about"
            onClick={() => setMenuOpen(false)}
            className="hover:opacity-80"
          >
            About SDSU Lost & Found
          </Link>
        </div>

        {/* Bottom buttons */}
        <div className="absolute bottom-8 left-8 right-8 flex flex-col gap-3">
          <Link href="/create-post" onClick={() => setMenuOpen(false)}>
            <Button
              variant="outline"
              className="w-full border-white text-white hover:bg-white hover:text-[#971B2F] font-heading font-bold"
            >
              Sign In
            </Button>
          </Link>

          <Link href="/login" onClick={() => setMenuOpen(false)}>
            <Button
              variant="outline"
              className="w-full border-white text-white hover:bg-white hover:text-[#971B2F] font-bold"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </aside>
    </>
  );
}