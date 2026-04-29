import Link from "next/link";
import Navbar from "@/components/navbar";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      {/* 404 Hero Section */}
      <section className="bg-[#f4f4f4] px-6 md:px-16 py-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-heading text-5xl md:text-6xl font-semibold tracking-tight">
            404 Page Not Found
          </h1>

          <div className="mt-6 h-[2px] w-28 bg-[#C8102E]" />

          <p className="mt-10 text-2xl md:text-3xl text-gray-800">
            We're sorry, that page doesn't exist.
          </p>
        </div>
      </section>

      {/* Help Section */}
      <section className="px-6 md:px-16 py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-xl md:text-2xl text-gray-800 mb-8">
            Try going back to the homepage or select the link below.
          </p>

          <ul className="space-y-5 text-xl md:text-2xl font-heading font-semibold">
            <li className="flex items-center gap-4">
              <span className="text-[#A6192E]">•</span>
              <Link href="/" className="text-[#A6192E] hover:underline">
                Homepage
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}