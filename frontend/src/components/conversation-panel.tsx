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
} from "@/lib/api";

type ConversationPanelProps = {
  activeConversationId?: number | null;
  refreshKey?: number;
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
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="message-panel-scrollbar mr-3 flex max-h-[calc(100vh-3rem)] min-h-[520px] flex-col overflow-y-auto p-5 pr-4">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-[#C8102E]">
          <Inbox size={22} />
        </div>

        <div>
          <h2 className="font-heading text-lg font-bold text-gray-900">
            Messages
          </h2>
          <p className="text-sm text-gray-500">
            Conversations about item recovery
          </p>
        </div>
      </div>

      {!isSignedIn && !isLoadingConversations && (
        <div className="flex min-h-[420px] flex-1 items-center justify-center text-center">
          <div>
            <h3 className="font-heading text-xl font-bold text-gray-900">
              Sign in to view messages
            </h3>

            <p className="mt-3 max-w-xs text-sm leading-6 text-gray-600">
              You need an account to message other users about lost and found
              items.
            </p>

            <Link href="/login?message=signin-required&redirect=/">
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
              <p className="text-sm text-gray-600">Loading conversations...</p>
            </div>
          )}

          {!isLoadingConversations && errorMessage && (
            <div className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMessage}
            </div>
          )}

          {!isLoadingConversations && conversations.length === 0 && (
            <div className="flex min-h-[360px] flex-1 items-center justify-center text-center">
              <div>
                <MessageCircle className="mx-auto h-10 w-10 text-[#C8102E]" />

                <h3 className="mt-4 font-heading text-xl font-bold text-gray-900">
                  No conversations yet
                </h3>

                <p className="mt-3 max-w-xs text-sm leading-6 text-gray-600">
                  When you message someone about an item, the conversation will
                  appear here.
                </p>
              </div>
            </div>
          )}

          {!isLoadingConversations && conversations.length > 0 && (
  <div className="mt-5 space-y-5">
    {/* Top — Active chat */}
    {!selectedConversationId && (
      <div className="animate-chat-panel-in rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center">
        <MessageCircle className="mx-auto h-10 w-10 text-[#C8102E]" />

        <h3 className="mt-4 font-heading text-lg font-bold text-gray-900">
          Select a conversation
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Click a conversation below to open the chat.
        </p>
      </div>
    )}

    {selectedConversationId && selectedConversation && (
      <div className="animate-chat-panel-in rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div>
            <h3 className="font-heading text-sm font-bold text-gray-900">
              {selectedConversation.item_title ?? selectedConversation.partner_name}
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              {selectedConversation.item_title
                ? selectedConversation.partner_name
                : "Active conversation"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCloseConversation}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close conversation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="message-panel-scrollbar mr-2 max-h-56 min-h-36 space-y-3 overflow-y-auto px-4 py-4 pr-5">
          {isLoadingMessages && (
            <p className="text-center text-sm text-gray-500">
              Loading messages...
            </p>
          )}

          {!isLoadingMessages && messages.length === 0 && (
            <p className="text-center text-sm text-gray-500">
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
                          className="mt-1 rounded-full p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100 data-[state=open]:opacity-100"
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
                        : "bg-gray-100 text-gray-800"
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
          className="border-t border-gray-100 p-3"
        >
          <textarea
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            placeholder="Write a message..."
            rows={3}
            className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20"
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
    <div className="border-t border-gray-100 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-gray-800">
          Conversations
        </h3>

        <p className="text-xs text-gray-500">
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
                  ? "border-[#C8102E] bg-red-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedConversationId(conversation.id)}
                className="w-full rounded-lg px-3 py-2.5 pr-10 text-left"
              >
                <p className="font-heading text-sm font-bold text-gray-900">
                  {conversation.item_title ?? conversation.partner_name}
                </p>

                {conversation.item_title && (
                  <p className="mt-0.5 text-xs font-medium text-gray-600">
                    {conversation.partner_name}
                  </p>
                )}

                <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                  {conversation.last_message || "No messages yet"}
                </p>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-full p-1 text-gray-500 opacity-0 transition hover:bg-gray-200 hover:text-gray-900 group-hover:opacity-100 data-[state=open]:opacity-100"
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
  </div>
)}
        </>
      )}
      </div>
    </section>
  );
}