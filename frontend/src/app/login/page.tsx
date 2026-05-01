"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type FastApiErrorDetail =
  | string
  | {
      msg?: string;
      loc?: string[];
    }[];

type LoginResponse = {
  token: string;
  refresh_token: string;
  userId: number;
};

type UserResponse = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

function getApiErrorMessage(detail: FastApiErrorDetail | undefined): string {
  if (!detail) {
    return "Something went wrong. Please try again.";
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((error) => error.msg)
      .filter(Boolean)
      .join(" ");
  }

  return "Something went wrong. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsError(false);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setIsError(true);
      setMessage("Please enter your email and password.");
      setIsSubmitting(false);
      return;
    }

    try {
      const loginResponse = await fetch(`${API_BASE_URL}/api/v1/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        setIsError(true);
        setMessage(getApiErrorMessage(loginData.detail));
        setIsSubmitting(false);
        return;
      }

      const typedLoginData = loginData as LoginResponse;

      localStorage.setItem("token", typedLoginData.token);
      localStorage.setItem("refresh_token", typedLoginData.refresh_token);
      localStorage.setItem("userId", String(typedLoginData.userId));

      try {
        const userResponse = await fetch(
          `${API_BASE_URL}/api/v1/user/${typedLoginData.userId}`
        );

        if (userResponse.ok) {
          const userData = (await userResponse.json()) as UserResponse;

          localStorage.setItem("firstName", userData.first_name);
          localStorage.setItem("lastName", userData.last_name);
          localStorage.setItem("email", userData.email);
        }
      } catch {
        // Login still succeeded even if the profile request fails.
      }

      setIsError(false);
      setMessage("Signed in successfully. Redirecting...");

      router.push("/");
    } catch {
      setIsError(true);
      setMessage("Could not connect to the backend server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <section className="bg-[#f4f4f4] px-6 py-20 md:px-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-heading text-5xl font-semibold tracking-tight md:text-6xl">
            Sign In
          </h1>

          <div className="mt-6 h-[2px] w-28 bg-[#C8102E]" />

          <p className="mt-8 max-w-2xl text-xl leading-8 text-gray-700">
            Sign in to your SDSU Lost & Found account to manage your posts,
            view updates, and communicate with campus members.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:px-16">
        <div className="mx-auto grid max-w-5xl items-start gap-10 md:grid-cols-[1fr_430px]">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-gray-900">
              Welcome Back
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-700">
              Access your account to continue helping lost items find their way
              back to the right people.
            </p>

            <div className="mt-8 space-y-4 text-gray-700">
              <p>
                <span className="font-semibold text-[#C8102E]">•</span> Manage
                your lost and found posts.
              </p>

              <p>
                <span className="font-semibold text-[#C8102E]">•</span> Check
                conversations and item updates.
              </p>

              <p>
                <span className="font-semibold text-[#C8102E]">•</span> Help
                keep the SDSU community connected.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="font-heading text-2xl font-bold text-gray-900">
              Account Login
            </h2>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block font-heading text-sm font-semibold text-gray-800"
                >
                  SDSU Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@sdsu.edu"
                  className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block font-heading text-sm font-semibold text-gray-800"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20"
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
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/create-account"
                className="font-heading font-semibold text-[#C8102E] hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}