const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type ApiValidationError = {
  msg?: string;
};

type ApiErrorResponse = {
  detail?: string | ApiValidationError[];
};

export function getApiErrorMessage(error: unknown): string {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (Array.isArray(error)) {
    return error
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(" ");
  }

  if (typeof error === "object" && "detail" in error) {
    const apiError = error as ApiErrorResponse;

    if (typeof apiError.detail === "string") {
      return apiError.detail;
    }

    if (Array.isArray(apiError.detail)) {
      return apiError.detail
        .map((item) => item.msg)
        .filter(Boolean)
        .join(" ");
    }
  }

  return "Something went wrong. Please try again.";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw data;
  }

  return data as T;
}
// Conversation API types

export type ConversationListItem = {
  id: number;
  partner_id: number;
  partner_name: string;
  last_message: string | null;
};

export type ConversationOut = {
  id: number;
  participant_ids: number[];
};

export type MessageListItem = {
  id: number;
  sender_id: number;
  message_text: string;
  created_at: string;
};

export type MessageOut = {
  id: number;
  sender_id: number;
  message_text: string;
  is_read: boolean;
  created_at: string;
};

export type SuccessResponse = {
  success: boolean;
};

// Conversation API functions

export function getConversations(limit = 50, offset = 0) {
  return apiFetch<ConversationListItem[]>(
    `/api/v1/conversations/?limit=${limit}&offset=${offset}`,
  );
}

export function createConversation(recipientId: number) {
  return apiFetch<ConversationOut>("/api/v1/conversations/", {
    method: "POST",
    body: JSON.stringify({
      recipient_id: recipientId,
    }),
  });
}

export function deleteConversation(conversationId: number) {
  return apiFetch<SuccessResponse>(`/api/v1/conversations/${conversationId}`, {
    method: "DELETE",
  });
}

export function getConversationMessages(
  conversationId: number,
  limit = 50,
  offset = 0,
) {
  return apiFetch<MessageListItem[]>(
    `/api/v1/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
  );
}

export function sendConversationMessage(conversationId: number, content: string) {
  return apiFetch<MessageOut>(
    `/api/v1/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        content,
      }),
    },
  );
}

export function deleteMessage(messageId: number) {
  return apiFetch<SuccessResponse>(`/api/v1/messages/${messageId}`, {
    method: "DELETE",
  });
}