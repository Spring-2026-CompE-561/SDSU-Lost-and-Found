"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import MyPostsPanel from "@/components/my-posts-panel";
import { Button } from "@/components/ui/button";
import { apiFetch, getApiErrorMessage } from "@/lib/api";
import { AlertTriangle, LogOut, Trash2, X } from "lucide-react";
type UserResponse = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

type UserUpdateResponse = {
  success: boolean;
  user: UserResponse;
};
type SuccessResponse = {
  success: boolean;
};
export default function AccountPage() {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function loadAccount() {
      const token = localStorage.getItem("token");
      const storedUserId = localStorage.getItem("userId");

      if (!token || !storedUserId) {
        router.replace("/login?message=signin-required-account&redirect=/account");
        return;
      }

      const parsedUserId = Number(storedUserId);

      if (Number.isNaN(parsedUserId)) {
        router.replace("/login?message=signin-required-account&redirect=/account");
        return;
      }

      try {
        setUserId(parsedUserId);

        const userData = await apiFetch<UserResponse>(
          `/api/v1/user/${parsedUserId}`,
        );

        setFirstName(userData.first_name);
        setLastName(userData.last_name);
        setEmail(userData.email);

        localStorage.setItem("firstName", userData.first_name);
        localStorage.setItem("lastName", userData.last_name);
        localStorage.setItem("email", userData.email);
      } catch (error) {
        setIsError(true);
        setMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    loadAccount();
  }, [router]);
  
  async function handleUpdateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) {
      return;
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    setMessage("");
    setIsError(false);

    if (!trimmedFirstName || !trimmedLastName || !trimmedEmail) {
      setIsError(true);
      setMessage("Please fill out all fields.");
      return;
    }

    if (trimmedFirstName.length > 15 || trimmedLastName.length > 15) {
      setIsError(true);
      setMessage("First name and last name must be 15 characters or less.");
      return;
    }

    if (!trimmedEmail.endsWith("@sdsu.edu")) {
      setIsError(true);
      setMessage("Please use a valid SDSU email address.");
      return;
    }

    try {
      setIsUpdating(true);

      const updatedData = await apiFetch<UserUpdateResponse>(
        `/api/v1/user/${userId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            first_name: trimmedFirstName,
            last_name: trimmedLastName,
            email: trimmedEmail,
          }),
        },
      );

      setFirstName(updatedData.user.first_name);
      setLastName(updatedData.user.last_name);
      setEmail(updatedData.user.email);

      localStorage.setItem("firstName", updatedData.user.first_name);
      localStorage.setItem("lastName", updatedData.user.last_name);
      localStorage.setItem("email", updatedData.user.email);

      setIsError(false);
      setMessage("Account updated successfully.");
    } catch (error) {
      setIsError(true);
      setMessage(getApiErrorMessage(error));
    } finally {
      setIsUpdating(false);
    }
  }
  function clearLocalAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("email");
    globalThis.dispatchEvent(new Event("auth:signout"));
  }
  function handleSignOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("email");

    router.push("/");
  }
  async function handleDeleteAccount() {
    if (deleteConfirmation !== "DELETE") {
      setIsError(true);
      setMessage("Type DELETE to confirm account deletion.");
      return;
    }

    try {
      setIsDeletingAccount(true);
      setMessage("");
      setIsError(false);

      await apiFetch<SuccessResponse>("/api/v1/user/me", {
        method: "DELETE",
      });

      clearLocalAuth();
      router.push("/");
    } catch (error) {
      setIsError(true);
      setMessage(getApiErrorMessage(error));
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Delete Account
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  This will permanently delete your account and related data.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                aria-label="Close delete account modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
              To confirm, type <span className="font-bold">DELETE</span> below.
            </div>

            <input
              type="text"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              placeholder="Type DELETE"
              className="mt-4 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="border border-gray-300 bg-white font-heading font-bold text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={isDeletingAccount || deleteConfirmation !== "DELETE"}
                onClick={handleDeleteAccount}
                className="bg-red-700 font-heading font-bold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeletingAccount ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <Navbar />
      <section className="bg-[#f4f4f4] px-6 py-20 dark:bg-gray-800 md:px-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-heading text-5xl font-semibold tracking-tight md:text-6xl">
            My Account
          </h1>

          <div className="mt-6 h-[2px] w-28 bg-[#C8102E]" />

          <p className="mt-8 max-w-3xl text-xl leading-8 text-gray-700 dark:text-gray-300">
            Your account is used to create posts, manage item recovery, and
            communicate with other users through the messaging system.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:px-16">
        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[1fr_460px]">
          <MyPostsPanel />

          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
              Profile Information
            </h2>

            {isLoading ? (
              <p className="mt-8 text-sm text-gray-600 dark:text-gray-300">
                Loading account information...
              </p>
            ) : (
              <form onSubmit={handleUpdateAccount} className="mt-8 space-y-5">
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
                      type="text"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      maxLength={15}
                      className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
                      type="text"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      maxLength={15}
                      className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
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
                  disabled={isUpdating}
                  className="w-full bg-[#C8102E] py-6 font-heading text-base font-bold text-white hover:bg-[#a00d24]"
                >
                  {isUpdating ? "Saving Changes..." : "Save Changes"}
                </Button>

                <Button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full border border-gray-300 bg-white py-6 font-heading text-base font-bold text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/60 dark:bg-red-950/30">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                      <AlertTriangle className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-heading text-lg font-bold text-red-900 dark:text-red-100">
                        Danger Zone
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-red-800 dark:text-red-200">
                        Delete your account and all related posts, messages, and conversations.
                        This action cannot be undone.
                      </p>

                      <Button
                        type="button"
                        onClick={() => {
                          setDeleteConfirmation("");
                          setIsDeleteModalOpen(true);
                        }}
                        className="mt-4 border border-red-300 bg-white font-heading font-bold text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}