"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ApiError,
  User,
  getStoredAccessToken,
  getCurrentUser,
  updateUser,
  deleteUser,
  logout,
  clearAuthTokens,
} from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Loader } from "@/components/ui/loader";
import {
  User as UserIcon,
  Mail,
  Save,
  LogOut,
  Trash2,
  CheckCircle2,
  Plus,
  MessageSquare,
  Search,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Auth guard + initial load
  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const me = await getCurrentUser();
        if (cancelled) return;
        if (!me) {
          router.replace("/login");
          return;
        }
        setUser(me);
        setFirstName(me.first_name);
        setLastName(me.last_name);
        setEmail(me.email);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          clearAuthTokens();
          router.replace("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load account");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Client-side validation matching backend rules
    if (firstName.length < 1 || firstName.length > 15) {
      setError("First name must be 1-15 characters.");
      return;
    }
    if (lastName.length < 1 || lastName.length > 15) {
      setError("Last name must be 1-15 characters.");
      return;
    }
    if (email.length < 1 || email.length > 30) {
      setError("Email must be 1-30 characters.");
      return;
    }

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const result = await updateUser(user.id, {
        first_name: firstName !== user.first_name ? firstName : undefined,
        last_name: lastName !== user.last_name ? lastName : undefined,
        email: email !== user.email ? email : undefined,
      });
      setUser(result.user);
      setSuccess("Profile updated successfully.");
      // Auto-clear success after a few seconds
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to update profile.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    router.push("/");
  };

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteUser(user.id);
      clearAuthTokens();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <Loader />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hasChanges =
    firstName !== user.first_name || lastName !== user.last_name || email !== user.email;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header card with avatar */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--sdsu-red)] text-white text-2xl font-bold shadow-sm">
              {getInitials(user.first_name, user.last_name)}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold truncate">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-sm text-[var(--muted-foreground)] truncate">{user.email}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Member ID #{user.id}
              </p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Link
            href="/post/new"
            className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--sdsu-red)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--sdsu-red)]/10 text-[var(--sdsu-red)] group-hover:bg-[var(--sdsu-red)] group-hover:text-white transition-colors">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">New post</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Report an item
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/messages"
            className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--sdsu-red)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--sdsu-red)]/10 text-[var(--sdsu-red)] group-hover:bg-[var(--sdsu-red)] group-hover:text-white transition-colors">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Messages</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  View your inbox
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/home"
            className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--sdsu-red)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--sdsu-red)]/10 text-[var(--sdsu-red)] group-hover:bg-[var(--sdsu-red)] group-hover:text-white transition-colors">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Browse</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  See all posts
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Profile form */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-1">Profile information</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-5">
            Update your name and email. Changes apply immediately.
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium mb-1.5"
                >
                  First name
                </label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    maxLength={15}
                    required
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-3 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--sdsu-red)] focus:outline-none focus:ring-2 focus:ring-[var(--sdsu-red)]/30"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium mb-1.5"
                >
                  Last name
                </label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    maxLength={15}
                    required
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-3 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--sdsu-red)] focus:outline-none focus:ring-2 focus:ring-[var(--sdsu-red)]/30"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={30}
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-3 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--sdsu-red)] focus:outline-none focus:ring-2 focus:ring-[var(--sdsu-red)]/30"
                />
              </div>
              <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                {email.length}/30 characters.
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-3 text-sm text-[var(--destructive)]">
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--sdsu-red)] py-2.5 px-5 text-sm font-semibold text-white hover:bg-[var(--sdsu-red-dark)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Session card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-1">Session</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Sign out of this device.
          </p>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 px-4 text-sm font-medium hover:bg-[var(--muted)] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-6">
          <h2 className="text-lg font-semibold text-[var(--destructive)] mb-1">
            Danger zone
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Permanently delete your account. This action cannot be undone.
          </p>

          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--destructive)] bg-transparent py-2 px-4 text-sm font-medium text-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-white transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete account
            </button>
          ) : (
            <div className="rounded-lg border border-[var(--destructive)]/40 bg-[var(--card)] p-4">
              <p className="text-sm font-medium mb-3">
                Are you sure? This will permanently remove your account and all of its
                data.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--destructive)] py-2 px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "Deleting..." : "Yes, delete my account"}
                </button>
                <button
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 px-4 text-sm font-medium hover:bg-[var(--muted)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
