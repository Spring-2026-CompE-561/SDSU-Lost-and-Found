import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 text-center px-4">
        <h1 className="text-4xl font-bold">SDSU Lost & Found</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Lost something on campus? Report it or search for lost items here.
        </p>
        <div className="flex gap-4">
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}