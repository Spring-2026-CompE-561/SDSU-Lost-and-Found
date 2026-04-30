"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type ApiErrorDetail =
  | string
  | {
      msg?: string;
      loc?: string[];
    }[];

function getApiErrorMessage(detail: ApiErrorDetail | undefined): string {
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

export default function CreateAccountPage() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsError(false);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setIsError(true);
      setMessage("Please fill out all fields.");
      setIsSubmitting(false);
      return;
    }

    if (!email.endsWith("@sdsu.edu")) {
      setIsError(true);
      setMessage("Please use a valid SDSU email address.");
      setIsSubmitting(false);
      return;
    }

    if (firstName.length > 15 || lastName.length > 15) {
      setIsError(true);
      setMessage("First name and last name must be 15 characters or less.");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8 || password.length > 20) {
      setIsError(true);
      setMessage("Password must be between 8 and 20 characters.");
      setIsSubmitting(false);
      return;
    }

    if (!/[a-zA-Z]/.test(password)) {
      setIsError(true);
      setMessage("Password must include at least one letter.");
      setIsSubmitting(false);
      return;
    }

    if (!/[0-9]/.test(password)) {
      setIsError(true);
      setMessage("Password must include at least one number.");
      setIsSubmitting(false);
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setIsError(true);
      setMessage("Password must include at least one special character.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const signupResponse = await fetch(`${API_BASE_URL}/api/v1/user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        setIsError(true);
        setMessage(getApiErrorMessage(signupData.detail));
        setIsSubmitting(false);
        return;
      }

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
        setIsError(false);
        setMessage(
          "Account created successfully. Please sign in to continue."
        );

        setTimeout(() => {
          router.push("/login");
        }, 1000);

        return;
      }

      localStorage.setItem("token", loginData.token);
      localStorage.setItem("refresh_token", loginData.refresh_token);
      localStorage.setItem("userId", String(loginData.userId));

      setIsError(false);
      setMessage("Account created successfully. Redirecting to homepage.");

      setTimeout(() => {
        router.push("/");
      }, 1000);
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
            Create Account
          </h1>

          <div className="mt-6 h-[2px] w-28 bg-[#C8102E]" />

          <p className="mt-8 max-w-2xl text-xl leading-8 text-gray-700">
            Create an SDSU Lost & Found account to post lost items, report found
            items, and communicate with campus members.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:px-16">
        <div className="mx-auto grid max-w-5xl items-start gap-10 md:grid-cols-[1fr_430px]">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-gray-900">
              Join SDSU Lost & Found
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-700">
              Your account connects posts to real campus users, helping lost and
              found items get returned safely and responsibly.
            </p>

            <div className="mt-8 space-y-4 text-gray-700">
              <p>
                <span className="font-semibold text-[#C8102E]">•</span> Post
                lost or found items.
              </p>

              <p>
                <span className="font-semibold text-[#C8102E]">•</span> Track
                item status updates.
              </p>

              <p>
                <span className="font-semibold text-[#C8102E]">•</span>{" "}
                Communicate with other users.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="font-heading text-2xl font-bold text-gray-900">
              Account Information
            </h2>

            <form onSubmit={handleCreateAccount} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block font-heading text-sm font-semibold text-gray-800"
                  >
                    First Name
                  </label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Alan"
                    maxLength={15}
                    className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block font-heading text-sm font-semibold text-gray-800"
                  >
                    Last Name
                  </label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Alaniz"
                    maxLength={15}
                    className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20"
                  />
                </div>
              </div>

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
                  placeholder="8 to 20 characters"
                  className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20"
                />

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Must include a letter, a number, and a special character.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block font-heading text-sm font-semibold text-gray-800"
                >
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
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
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
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