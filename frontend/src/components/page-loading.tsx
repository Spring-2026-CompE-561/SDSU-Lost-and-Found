import Navbar from "@/components/navbar";
import { Spinner } from "@/components/ui/spinner";

type PageLoadingProps = {
  message?: string;
};

export default function PageLoading({
  message = "Loading page...",
}: PageLoadingProps) {
  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Navbar />

      <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-10 py-9 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#C8102E] dark:bg-red-900/30">
            <Spinner className="h-7 w-7" />
          </div>

          <h1 className="mt-5 font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
            SDSU Lost & Found
          </h1>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>
      </section>
    </main>
  );
}