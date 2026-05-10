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

async function tryRefreshToken(): Promise<boolean> {
  if (globalThis.window === undefined) return false;

  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      return false;
    }

    const data: { token: string; refresh_token: string } = await response.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("refresh_token", data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  _isRetry = false,
): Promise<T> {
  const token =
    globalThis.window === undefined ? null : localStorage.getItem("token");

  const headers = new Headers(options.headers);

  if (
    options.body &&
    !headers.has("Content-Type") &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (
    response.status === 401 &&
    !_isRetry &&
    path !== "/api/v1/token/refresh"
  ) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return apiFetch<T>(path, options, true);
    }
  }

  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw data;
  }

  return data as T;
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const { url } = await apiFetch<{ url: string }>("/api/v1/uploads/image", {
    method: "POST",
    body: formData,
  });

  return url.startsWith("/") ? `${API_BASE_URL}${url}` : url;
}

// Conversation API types

export type ConversationListItem = {
  id: number;
  partner_id: number;
  partner_name: string;
  last_message: string | null;
  item_id: number | null;
  item_title: string | null;
};

export type ConversationOut = {
  id: number;
  participant_ids: number[];
  item_id: number | null;
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

export function createConversation(recipientId: number, itemId?: number) {
  return apiFetch<ConversationOut>("/api/v1/conversations/", {
    method: "POST",
    body: JSON.stringify({
      recipient_id: recipientId,
      item_id: itemId ?? null,
    }),
  });
}
export type ConversationStartResponse = {
  conversation: ConversationOut;
  message: MessageOut;
};

export function startConversationWithMessage(
  recipientId: number,
  itemId: number,
  content: string,
) {
  return apiFetch<ConversationStartResponse>("/api/v1/conversations/start", {
    method: "POST",
    body: JSON.stringify({
      recipient_id: recipientId,
      item_id: itemId,
      content,
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