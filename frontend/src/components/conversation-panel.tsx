"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Inbox, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ConversationListItem,
  MessageListItem,
  getApiErrorMessage,
  getConversationMessages,
  getConversations,
  sendConversationMessage,
} from "@/lib/api";

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

export default function ConversationPanel() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
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
      setIsLoadingConversations(false);
      return;
    }

    try {
      setErrorMessage("");
      setIsLoadingConversations(true);

      const data = await getConversations();

      setConversations(data);

      if (!selectedConversationId && data.length > 0) {
        setSelectedConversationId(data[0].id);
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
    <section className="min-h-[470px] rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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
        <div className="flex min-h-[330px] items-center justify-center text-center">
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
            <div className="flex min-h-[330px] items-center justify-center text-center">
              <p className="text-sm text-gray-600">Loading conversations...</p>
            </div>
          )}

          {!isLoadingConversations && errorMessage && (
            <div className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMessage}
            </div>
          )}

          {!isLoadingConversations && conversations.length === 0 && (
            <div className="flex min-h-[330px] items-center justify-center text-center">
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
              <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                {conversations.map((conversation) => {
                  const isSelected = conversation.id === selectedConversationId;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                        isSelected
                          ? "border-[#C8102E] bg-red-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <p className="font-heading text-sm font-bold text-gray-900">
                        {conversation.partner_name}
                      </p>

                      <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                        {conversation.last_message || "No messages yet"}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-lg border border-gray-200">
                <div className="border-b border-gray-100 px-4 py-3">
                  <h3 className="font-heading text-sm font-bold text-gray-900">
                    {selectedConversation
                      ? selectedConversation.partner_name
                      : "Select a conversation"}
                  </h3>
                </div>

                <div className="max-h-64 min-h-52 space-y-3 overflow-y-auto px-4 py-4">
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
                          className={`flex ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
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
                    className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20"
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
            </div>
          )}
        </>
      )}
    </section>
  );
}