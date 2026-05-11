"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Inbox, MessageCircle, MoreHorizontal, Send, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ConversationListItem,
  MessageListItem,
  deleteConversation,
  deleteMessage,
  getApiErrorMessage,
  getConversationMessages,
  getConversations,
  sendConversationMessage,
  startConversationWithMessage,
} from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
type ConversationPanelProps = {
  activeConversationId?: number | null;
  refreshKey?: number;
  draftConversation?: DraftConversation | null;
  onDraftConversationClose?: () => void;
  onConversationStarted?: (conversationId: number) => void;
};

type DraftConversation = {
  recipientId: number;
  itemId: number;
  itemTitle: string;
};
function getStoredUserId() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUserId = localStorage.getItem("userId");

  if (!storedUserId) {
    return null;
  }

  const parsedUserId = Number(storedUserId);

  return Number.isNaN(parsedUserId) ? null : parsedUserId;
}

export default function ConversationPanel({
  activeConversationId = null,
  refreshKey = 0,
  draftConversation = null,
  onDraftConversationClose,
  onConversationStarted,
}: ConversationPanelProps) {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const [conversations, setConversations] = useState<ConversationListItem[]>(
    [],
  );
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [messages, setMessages] = useState<MessageListItem[]>([]);

  const [newMessage, setNewMessage] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  );

  async function loadConversations() {
    const token = localStorage.getItem("token");
    const storedUserId = getStoredUserId();

    setCurrentUserId(storedUserId);
    setIsSignedIn(Boolean(token));

    if (!token) {
      setConversations([]);
      setSelectedConversationId(null);
      setMessages([]);
      setIsLoadingConversations(false);
      return;
    }

    try {
      setErrorMessage("");
      setIsLoadingConversations(true);

      const data = await getConversations();

      setConversations(data);

      const shouldOpenActiveConversation =
        activeConversationId &&
        data.some((conversation) => conversation.id === activeConversationId);

      if (shouldOpenActiveConversation) {
        setSelectedConversationId(activeConversationId);
        return;
      }

      if (
        selectedConversationId &&
        !data.some((conversation) => conversation.id === selectedConversationId)
      ) {
        setSelectedConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoadingConversations(false);
    }
  }

  async function loadMessages(conversationId: number) {
    try {
      setErrorMessage("");
      setIsLoadingMessages(true);

      const data = await getConversationMessages(conversationId);

      setMessages(data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoadingMessages(false);
    }
  }

  function handleCloseConversation() {
    setSelectedConversationId(null);
    setMessages([]);
    setNewMessage("");
    setErrorMessage("");
  }

  async function handleDeleteConversation(conversationId: number) {
    const shouldDelete = globalThis.confirm(
      "Delete this conversation? This cannot be undone.",
    );

    if (!shouldDelete) return;

    try {
      setErrorMessage("");
      await deleteConversation(conversationId);

      setConversations((current) =>
        current.filter((conversation) => conversation.id !== conversationId),
      );

      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  }

  async function handleDeleteMessage(messageId: number) {
    const shouldDelete = globalThis.confirm("Delete this message?");

    if (!shouldDelete) return;

    try {
      setErrorMessage("");
      await deleteMessage(messageId);

      setMessages((current) =>
        current.filter((message) => message.id !== messageId),
      );
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  }
  function handleCloseDraftConversation() {
    onDraftConversationClose?.();
    setNewMessage("");
    setErrorMessage("");
  }

  async function handleSendDraftMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = newMessage.trim();

    if (!draftConversation || !trimmedMessage) {
      return;
    }

    try {
      setErrorMessage("");
      setIsSending(true);

      const response = await startConversationWithMessage(
        draftConversation.recipientId,
        draftConversation.itemId,
        trimmedMessage,
      );

      setNewMessage("");
      onDraftConversationClose?.();
      setSelectedConversationId(response.conversation.id);
      setMessages([response.message]);

      const updatedConversations = await getConversations();
      setConversations(updatedConversations);

      onConversationStarted?.(response.conversation.id);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  }
  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = newMessage.trim();

    if (!selectedConversationId || !trimmedMessage) {
      return;
    }

    try {
      setErrorMessage("");
      setIsSending(true);

      const sentMessage = await sendConversationMessage(
        selectedConversationId,
        trimmedMessage,
      );

      setMessages((currentMessages) => [...currentMessages, sentMessage]);
      setNewMessage("");

      const updatedConversations = await getConversations();
      setConversations(updatedConversations);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadConversations();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    function handleSignOut() {
      setIsSignedIn(false);
      setCurrentUserId(null);
      setConversations([]);
      setSelectedConversationId(null);
      setMessages([]);
      setNewMessage("");
      setErrorMessage("");
      setIsLoadingConversations(false);
      setIsLoadingMessages(false);
    }

    globalThis.addEventListener("auth:signout", handleSignOut);

    return () => globalThis.removeEventListener("auth:signout", handleSignOut);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (selectedConversationId) {
        loadMessages(selectedConversationId);
      } else {
        setMessages([]);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [selectedConversationId]);

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="message-panel-scrollbar mr-3 flex max-h-[calc(100vh-3rem)] min-h-[520px] flex-col overflow-y-auto p-5 pr-4">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-700">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-[#C8102E] dark:bg-red-900/30">
          <Inbox size={22} />
        </div>

        <div>
          <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-gray-100">
            Messages
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Conversations about item recovery
          </p>
        </div>
      </div>

      {!isSignedIn && !isLoadingConversations && (
        <div className="flex min-h-[420px] flex-1 items-center justify-center text-center">
          <div>
            <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-gray-100">
              Sign in to view messages
            </h3>

            <p className="mt-3 max-w-xs text-sm leading-6 text-gray-600 dark:text-gray-300">
              You need an account to message other users about lost and found
              items.
            </p>

            <Link href="/login?message=signin-required-messages&redirect=/">
              <Button className="mt-6 bg-[#C8102E] font-heading font-bold text-white hover:bg-[#a00d24]">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}

      {isSignedIn && (
        <>
          {isLoadingConversations && (
            <div className="flex flex-1 items-center justify-center text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">Loading conversations...</p>
            </div>
          )}

          {!isLoadingConversations && errorMessage && (
            <div className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMessage}
            </div>
          )}

          {!isLoadingConversations && !draftConversation && conversations.length === 0 && (
            <div className="flex min-h-[360px] flex-1 items-center justify-center text-center">
              <div>
                <MessageCircle className="mx-auto h-10 w-10 text-[#C8102E]" />

                <h3 className="mt-4 font-heading text-xl font-bold text-gray-900 dark:text-gray-100">
                  No conversations yet
                </h3>

                <p className="mt-3 max-w-xs text-sm leading-6 text-gray-600 dark:text-gray-300">
                  When you message someone about an item, the conversation will
                  appear here.
                </p>
              </div>
            </div>
          )}

          {!isLoadingConversations && (draftConversation || conversations.length > 0) && (
            <div className="mt-5 space-y-5">
              {/* Top — Active chat */}
              {draftConversation && (
                <div className="animate-chat-panel-in rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                    <div>
                      <h3 className="font-heading text-sm font-bold text-gray-900 dark:text-gray-100">
                        New message about:
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-[#C8102E]">
                        {draftConversation.itemTitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCloseDraftConversation}
                      className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                      aria-label="Close draft conversation"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form
                    onSubmit={handleSendDraftMessage}
                    className="p-3"
                  >
                    <textarea
                      value={newMessage}
                      onChange={(event) => setNewMessage(event.target.value)}
                      placeholder="Write your first message..."
                      rows={4}
                      className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                    />

                    <Button
                      type="submit"
                      disabled={isSending || !newMessage.trim()}
                      className="mt-3 w-full bg-[#C8102E] font-heading font-bold text-white hover:bg-[#a00d24] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSending ? (
                      <Spinner className="mr-2 h-4 w-4 text-white" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    {isSending ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </div>
              )}
              {!draftConversation && !selectedConversationId && (
                <div className="animate-chat-panel-in rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center dark:border-gray-600 dark:bg-gray-700/50">
                  <MessageCircle className="mx-auto h-10 w-10 text-[#C8102E]" />

                  <h3 className="mt-4 font-heading text-lg font-bold text-gray-900 dark:text-gray-100">
                    Select a conversation
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    Click a conversation below to open the chat.
                  </p>
                </div>
              )}

              {!draftConversation && selectedConversationId && selectedConversation && (
                <div className="animate-chat-panel-in rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                    <div>
                      <h3 className="font-heading text-sm font-bold text-gray-900 dark:text-gray-100">
                        {selectedConversation.item_title ?? selectedConversation.partner_name}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {selectedConversation.item_title
                          ? selectedConversation.partner_name
                          : "Active conversation"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCloseConversation}
                      className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                      aria-label="Close conversation"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="message-panel-scrollbar mr-2 max-h-56 min-h-36 space-y-3 overflow-y-auto px-4 py-4 pr-5">
                    {isLoadingMessages && (
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Loading messages...
                      </p>
                    )}

                    {!isLoadingMessages && messages.length === 0 && (
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        No messages in this conversation yet.
                      </p>
                    )}

                    {!isLoadingMessages &&
                      messages.map((message) => {
                        const isMine = message.sender_id === currentUserId;

                        return (
                          <div
                            key={message.id}
                            className={`group flex items-start gap-1 ${
                              isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            {isMine && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    className="mt-1 rounded-full p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100 data-[state=open]:opacity-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                    aria-label="Message actions"
                                  >
                                    <MoreHorizontal size={14} />
                                  </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => handleDeleteMessage(message.id)}
                                  >
                                    <Trash2 />
                                    Delete message
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}

                            <div
                              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-5 ${
                                isMine
                                  ? "bg-[#C8102E] text-white"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                              }`}
                            >
                              {message.message_text}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <form
                    onSubmit={handleSendMessage}
                    className="border-t border-gray-100 p-3 dark:border-gray-700"
                  >
                    <textarea
                      value={newMessage}
                      onChange={(event) => setNewMessage(event.target.value)}
                      placeholder="Write a message..."
                      rows={3}
                      className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                    />

                    <Button
                      type="submit"
                      disabled={
                        isSending || !selectedConversationId || !newMessage.trim()
                      }
                      className="mt-3 w-full bg-[#C8102E] font-heading font-bold text-white hover:bg-[#a00d24] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {isSending ? "Sending..." : "Send"}
                    </Button>
                  </form>
                </div>
              )}

              {/* Bottom — Conversation list */}
              {conversations.length > 0 && (
                <div className="border-t border-gray-100 pt-4 dark:border-gray-700">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                      Conversations
                    </h3>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {conversations.length} total
                    </p>
                  </div>

                  <div className="message-panel-scrollbar mr-2 max-h-52 space-y-2 overflow-y-auto py-1 pl-1 pr-5">
                    {conversations.map((conversation) => {
                      const isSelected = conversation.id === selectedConversationId;

                      return (
                        <div
                          key={conversation.id}
                          className={`group relative rounded-lg border transition-all duration-200 ${
                            isSelected
                              ? "border-[#C8102E] bg-red-50 shadow-sm dark:bg-red-900/20"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 dark:hover:bg-gray-700"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedConversationId(conversation.id)}
                            className="w-full rounded-lg px-3 py-2.5 pr-10 text-left"
                          >
                            <p className="font-heading text-sm font-bold text-gray-900 dark:text-gray-100">
                              {conversation.item_title ?? conversation.partner_name}
                            </p>

                            {conversation.item_title && (
                              <p className="mt-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                                {conversation.partner_name}
                              </p>
                            )}

                            <p className="mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                              {conversation.last_message || "No messages yet"}
                            </p>
                          </button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="absolute right-2 top-2 rounded-full p-1 text-gray-500 opacity-0 transition hover:bg-gray-200 hover:text-gray-900 group-hover:opacity-100 data-[state=open]:opacity-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-100"
                                aria-label="Conversation actions"
                              >
                                <MoreHorizontal size={16} />
                              </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDeleteConversation(conversation.id)}
                              >
                                <Trash2 />
                                Delete conversation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              </div>
)}
        </>
      )}
      </div>
    </section>
  );
}