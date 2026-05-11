"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { apiFetch, getApiErrorMessage } from "@/lib/api";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsError(false);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("new_password") || "");
    const confirmPassword = String(formData.get("confirm_password") || "");

    if (!newPassword || !confirmPassword) {
      setIsError(true);
      setMessage("Please fill in both password fields.");
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    if (!tokenFromUrl) {
      setIsError(true);
      setMessage(
        "Missing reset token. Please use the link from the forgot-password page.",
      );
      setIsSubmitting(false);
      return;
    }

    try {
      await apiFetch("/api/v1/user/reset-password", {
        method: "POST",
        body: JSON.stringify({ token: tokenFromUrl, new_password: newPassword }),
      });
      setSucceeded(true);
      setIsError(false);
      setMessage("Password reset successfully! Redirecting to sign in...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      setIsError(true);
      setMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
      <Navbar />

      <section className="bg-[#f4f4f4] px-6 py-20 dark:bg-gray-800 md:px-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-heading text-5xl font-semibold tracking-tight md:text-6xl">
            Reset Password
          </h1>

          <div className="mt-6 h-[2px] w-28 bg-[#C8102E]" />

          <p className="mt-8 max-w-2xl text-xl leading-8 text-gray-700 dark:text-gray-300">
            Choose a new password for your SDSU Lost &amp; Found account.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:px-16">
        <div className="mx-auto grid max-w-5xl items-start gap-10 md:grid-cols-[1fr_430px]">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100">
              Create New Password
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-700 dark:text-gray-300">
              Your new password must meet the following requirements.
            </p>

            <div className="mt-8 space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-semibold text-[#C8102E]">•</span> 8–20
                characters long.
              </p>

              <p>
                <span className="font-semibold text-[#C8102E]">•</span> At
                least one letter and one number.
              </p>

              <p>
                <span className="font-semibold text-[#C8102E]">•</span> At
                least one special character (e.g. !@#$%).
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
              New Password
            </h2>

            {succeeded ? (
              <div className="mt-8 space-y-5">
                <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
                  {message}
                </p>

                <Link href="/login">
                  <Button className="w-full bg-[#C8102E] py-6 font-heading text-base font-bold text-white hover:bg-[#a00d24]">
                    Go to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="new_password"
                    className="block font-heading text-sm font-semibold text-gray-800 dark:text-gray-200"
                  >
                    New Password
                  </label>

                  <input
                    id="new_password"
                    name="new_password"
                    type="password"
                    placeholder="Enter new password"
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm_password"
                    className="block font-heading text-sm font-semibold text-gray-800 dark:text-gray-200"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    placeholder="Confirm new password"
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                  />
                </div>

                {message && (
                  <p
                    className={`rounded-md px-4 py-3 text-sm ${
                      isError
                        ? "bg-red-50 text-red-800"
                        : "bg-green-50 text-green-800"
                    }`}
                  >
                    {message}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#C8102E] py-6 font-heading text-base font-bold text-white hover:bg-[#a00d24]"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
              Back to{" "}
              <Link
                href="/login"
                className="font-heading font-semibold text-[#C8102E] hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
