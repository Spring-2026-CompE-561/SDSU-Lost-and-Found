"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, Check, X } from "lucide-react";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Loader } from "@/components/ui/loader";
import {
  signup as apiSignup,
  login as apiLogin,
  storeAuthSession,
  ApiError,
} from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const { isDark, toggleDarkMode } = useDarkMode();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mirror the backend's password rules so users get instant feedback
  const passwordChecks = [
    { label: "8–20 characters", ok: password.length >= 8 && password.length <= 20 },
    { label: "At least 1 letter", ok: /[a-zA-Z]/.test(password) },
    { label: "At least 1 number", ok: /[0-9]/.test(password) },
    {
      label: "At least 1 special character",
      ok: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];
  const passwordValid = passwordChecks.every((c) => c.ok);

  const formValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    passwordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formValid) return;
    setLoading(true);

    try {
      // Step 1: Create the user
      const signupRes = await apiSignup({
        email,
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      // Step 2: Log them in immediately so the feed loads with their identity
      const tokens = await apiLogin({ email, password });
      storeAuthSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user_id: signupRes.userId,
        email,
      });
      router.push("/home");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Sign-up failed. Please try again.");
      } else {
        setError("Could not reach the server. Is the backend running?");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--sdsu-red)] text-white font-bold shadow-sm">
              SD
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                San Diego State University
              </span>
              <span className="text-base font-bold">Lost &amp; Found</span>
            </div>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleDarkMode}
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-3 py-2"
            >
              {isDark ? "Light" : "Dark"}
            </button>
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--sdsu-red)] px-3 py-2"
            >
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm p-8">
            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-bold">Create your account</h1>
              <p className="text-sm text-[var(--muted-foreground)]">
                Join the SDSU Lost &amp; Found community.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium mb-1.5"
                  >
                    First name{" "}
                    <span className="text-xs text-[var(--muted-foreground)]">
                      ({firstName.length}/15)
                    </span>
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    <input
                      id="firstName"
                      type="text"
                      maxLength={15}
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-3 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--sdsu-red)] focus:outline-none focus:ring-2 focus:ring-[var(--sdsu-red)]/30"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium mb-1.5"
                  >
                    Last name{" "}
                    <span className="text-xs text-[var(--muted-foreground)]">
                      ({lastName.length}/15)
                    </span>
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    <input
                      id="lastName"
                      type="text"
                      maxLength={15}
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Aztec"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-3 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--sdsu-red)] focus:outline-none focus:ring-2 focus:ring-[var(--sdsu-red)]/30"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1.5"
                >
                  Email{" "}
                  <span className="text-xs text-[var(--muted-foreground)]">
                    ({email.length}/30)
                  </span>
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    id="email"
                    type="email"
                    maxLength={30}
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@sdsu.edu"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-3 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--sdsu-red)] focus:outline-none focus:ring-2 focus:ring-[var(--sdsu-red)]/30"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={20}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-3 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--sdsu-red)] focus:outline-none focus:ring-2 focus:ring-[var(--sdsu-red)]/30"
                  />
                </div>
                {/* Password requirements */}
                <ul className="mt-2 space-y-1 text-xs">
                  {passwordChecks.map((c) => (
                    <li
                      key={c.label}
                      className={`flex items-center gap-1.5 ${
                        c.ok
                          ? "text-emerald-600"
                          : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {c.ok ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      {c.label}
                    </li>
                  ))}
                </ul>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-3 text-sm text-[var(--destructive)]"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!formValid || loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--sdsu-red)] py-2.5 px-4 text-sm font-semibold text-white hover:bg-[var(--sdsu-red-dark)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader />
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[var(--sdsu-red)] hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
