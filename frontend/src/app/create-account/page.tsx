"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { apiFetch, getApiErrorMessage } from "@/lib/api";

type SignupResponse = {
  userId: number;
};

type LoginResponse = {
  token: string;
  refresh_token: string;
  userId: number;
};

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
      await apiFetch<SignupResponse>("/api/v1/user/signup", {
      method: "POST",
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      }),
    });

    const loginData = await apiFetch<LoginResponse>("/api/v1/user/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    localStorage.setItem("token", loginData.token);
    localStorage.setItem("refresh_token", loginData.refresh_token);
    localStorage.setItem("userId", String(loginData.userId));

    // Save these so the navbar can show the user's name
    localStorage.setItem("firstName", firstName);
    localStorage.setItem("lastName", lastName);
    localStorage.setItem("email", email);

    setIsError(false);
    setMessage("Account created successfully. Redirecting to homepage.");

    router.push("/home");
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
            Create Account
          </h1>

          <div className="mt-6 h-[2px] w-28 bg-[#C8102E]" />

          <p className="mt-8 max-w-2xl text-xl leading-8 text-gray-700 dark:text-gray-300">
            Create an SDSU Lost & Found account to post lost items, report found
            items, and communicate with campus members.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:px-16">
        <div className="mx-auto grid max-w-5xl items-start gap-10 md:grid-cols-[1fr_430px]">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100">
              Join SDSU Lost & Found
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-700 dark:text-gray-300">
              Your account connects posts to real campus users, helping lost and
              found items get returned safely and responsibly.
            </p>

            <div className="mt-8 space-y-4 text-gray-700 dark:text-gray-300">
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

          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
              Account Information
            </h2>

            <form onSubmit={handleCreateAccount} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block font-heading text-sm font-semibold text-gray-800 dark:text-gray-200"
                  >
                    First Name
                  </label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Your Name"
                    maxLength={15}
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block font-heading text-sm font-semibold text-gray-800 dark:text-gray-200"
                  >
                    Last Name
                  </label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Your Last Name"
                    maxLength={15}
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                  />
                </div>
              </div>

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

              <div>
                <label
                  htmlFor="password"
                  className="block font-heading text-sm font-semibold text-gray-800 dark:text-gray-200"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="8 to 20 characters"
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                />

                <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  Must include a letter, a number, and a special character.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block font-heading text-sm font-semibold text-gray-800 dark:text-gray-200"
                >
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
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
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
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