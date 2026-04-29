"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Loader } from "@/components/ui/loader";
import { login as apiLogin, storeAuthSession, ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const tokens = await apiLogin({ email, password });
      storeAuthSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        email,
      });
      router.push("/home");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Incorrect email or password.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Could not reach the server. Is the backend running?");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      {/* Top bar */}
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
              href="/signup"
              className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--sdsu-red)] px-3 py-2"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm p-8">
            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-sm text-[var(--muted-foreground)]">
                Sign in to your SDSU Lost &amp; Found account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    id="email"
                    type="email"
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
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-[var(--sdsu-red)] hover:underline"
                    onClick={() =>
                      setError(
                        "Password recovery isn't available yet — please contact support."
                      )
                    }
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-3 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--sdsu-red)] focus:outline-none focus:ring-2 focus:ring-[var(--sdsu-red)]/30"
                  />
                </div>
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
                disabled={!email || !password || loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--sdsu-red)] py-2.5 px-4 text-sm font-semibold text-white hover:bg-[var(--sdsu-red-dark)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[var(--sdsu-red)] hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
          <p className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
            By signing in, you agree to use this platform respectfully and
            within the SDSU community guidelines.
          </p>
        </div>
      </main>
    </div>
  );
}
