"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { apiFetch, getApiErrorMessage } from "@/lib/api";

type ForgotPasswordResponse = {
  reset_token: string;
  message: string;
};

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsError(false);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim().toLowerCase();

    if (!email) {
      setIsError(true);
      setMessage("Please enter your SDSU email address.");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await apiFetch<ForgotPasswordResponse>(
        "/api/v1/user/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
      );
      setResetToken(data.reset_token);
      setIsError(false);
      setMessage("Reset link generated. Click below to set your new password.");
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
            Forgot Password
          </h1>

          <div className="mt-6 h-[2px] w-28 bg-[#C8102E]" />

          <p className="mt-8 max-w-2xl text-xl leading-8 text-gray-700 dark:text-gray-300">
            Enter your SDSU email address and we&apos;ll generate a password
            reset link for you.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:px-16">
        <div className="mx-auto grid max-w-5xl items-start gap-10 md:grid-cols-[1fr_430px]">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100">
              Reset Your Password
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-700 dark:text-gray-300">
              Use a valid SDSU email address associated with your account. The
              reset link expires in 30 minutes.
            </p>

            <div className="mt-8 space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-semibold text-[#C8102E]">•</span> You
                must have an existing SDSU Lost &amp; Found account.
              </p>

              <p>
                <span className="font-semibold text-[#C8102E]">•</span> The
                reset link is valid for 30 minutes.
              </p>

              <p>
                <span className="font-semibold text-[#C8102E]">•</span> Your
                new password must meet the original security requirements.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
              Password Reset
            </h2>

            {!resetToken ? (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block font-heading text-sm font-semibold text-gray-800 dark:text-gray-200"
                  >
                    SDSU Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@sdsu.edu"
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
                  {isSubmitting ? "Generating Link..." : "Generate Reset Link"}
                </Button>
              </form>
            ) : (
              <div className="mt-8 space-y-5">
                <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
                  {message}
                </p>

                <Button
                  type="button"
                  onClick={() =>
                    router.push(`/reset-password?token=${encodeURIComponent(resetToken)}`)
                  }
                  className="w-full bg-[#C8102E] py-6 font-heading text-base font-bold text-white hover:bg-[#a00d24]"
                >
                  Reset My Password →
                </Button>

                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  This link expires in 30 minutes.
                </p>
              </div>
            )}

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
              Remembered your password?{" "}
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
