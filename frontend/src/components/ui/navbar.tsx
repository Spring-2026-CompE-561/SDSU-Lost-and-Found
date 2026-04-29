import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold">
        SDSU Lost & Found
      </Link>
      <div className="flex gap-4">
        <Link href="/login" className="text-sm hover:underline">
          Login
        </Link>
        <Link href="/signup" className="text-sm hover:underline">
          Sign Up
        </Link>
      </div>
    </nav>
  );
}