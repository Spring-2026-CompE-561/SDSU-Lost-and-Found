/**
 * API client for the SDSU Lost & Found backend.
 *
 * Backend (FastAPI) lives at NEXT_PUBLIC_API_URL and exposes its routes
 * under the /api/v1 prefix. All routes that touch user-owned data require
 * a Bearer access token — we keep both the access token and the refresh
 * token in localStorage and rotate the access token via /token/refresh
 * when a 401 comes back.
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const API_BASE = `${API_URL}/api/v1`;

// ---------- Types ----------

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Item {
  id: number;
  user_id: number;
  title: string;
  description: string;
  location: string;
  image_url: string | null;
  given_back: boolean;
  created_at: string;
}

export interface ItemListItem {
  id: number;
  title: string;
  description: string;
  location: string;
  image_url: string | null;
  given_back: boolean;
  created_at: string;
}

export interface ItemCreatePayload {
  title: string;
  description: string;
  location: string;
  image_url?: string | null;
  given_back?: boolean;
}

export interface Conversation {
  id: number;
  participant_ids: number[];
}

export interface ConversationListItem {
  id: number;
  partner_id: number;
  last_message: string | null;
}

export interface Message {
  id: number;
  sender_id: number;
  message_text: string;
  is_read?: boolean;
  created_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
}

export interface SignupResponse {
  userId: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

// ---------- Errors ----------

export class ApiError extends Error {
  status: number;
  detail?: unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

// ---------- Token storage ----------

const ACCESS_TOKEN_KEY = "sdsu_access_token";
const REFRESH_TOKEN_KEY = "sdsu_refresh_token";
const USER_ID_KEY = "sdsu_user_id";
const USER_EMAIL_KEY = "sdsu_user_email";

export const getStoredAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getStoredRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getStoredUserId = (): number | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_ID_KEY);
  return raw ? Number(raw) : null;
};

export const getStoredUserEmail = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_EMAIL_KEY);
};

export const storeAuthSession = (params: {
  access_token: string;
  refresh_token: string;
  user_id?: number;
  email?: string;
}) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, params.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, params.refresh_token);
  if (params.user_id !== undefined) {
    localStorage.setItem(USER_ID_KEY, String(params.user_id));
  }
  if (params.email !== undefined) {
    localStorage.setItem(USER_EMAIL_KEY, params.email);
  }
};

export const clearAuthTokens = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
};

// ---------- Internal helpers ----------

const buildAuthHeaders = (
  extra?: Record<string, string>
): Record<string, string> => {
  const headers: Record<string, string> = { ...(extra || {}) };
  const token = getStoredAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.ok) {
    // 204 No Content
    if (response.status === 204) return undefined as unknown as T;
    const text = await response.text();
    if (!text) return undefined as unknown as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  let detail: unknown = undefined;
  let message = `Request failed with status ${response.status}`;
  try {
    const data = await response.json();
    detail = data;
    if (data && typeof data === "object") {
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        message = data.detail[0].msg;
      }
    }
  } catch {
    // body wasn't JSON
  }
  throw new ApiError(message, response.status, detail);
};

/**
 * Try once, and if we get a 401 try to refresh the access token using
 * the stored refresh token, then retry the original request once.
 */
const fetchWithAuth = async <T>(
  url: string,
  init: RequestInit
): Promise<T> => {
  let response = await fetch(url, init);
  if (response.status !== 401) {
    return handleResponse<T>(response);
  }

  const refresh = getStoredRefreshToken();
  if (!refresh) {
    return handleResponse<T>(response); // surface the 401
  }

  // Try refresh
  try {
    const refreshResp = await fetch(`${API_BASE}/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!refreshResp.ok) {
      clearAuthTokens();
      return handleResponse<T>(response);
    }
    const refreshed = (await refreshResp.json()) as AccessTokenResponse;
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_TOKEN_KEY, refreshed.access_token);
    }

    // Retry original request with new token
    const retryHeaders = new Headers(init.headers || {});
    retryHeaders.set("Authorization", `Bearer ${refreshed.access_token}`);
    response = await fetch(url, { ...init, headers: retryHeaders });
    return handleResponse<T>(response);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    return handleResponse<T>(response);
  }
};

// ============================================================
// Auth
// ============================================================

export const signup = async (
  payload: SignupPayload
): Promise<SignupResponse> => {
  const response = await fetch(`${API_BASE}/user/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<SignupResponse>(response);
};

export const login = async (
  payload: LoginPayload
): Promise<TokenPair> => {
  const response = await fetch(`${API_BASE}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<TokenPair>(response);
};

export const logout = async (): Promise<void> => {
  const refresh = getStoredRefreshToken();
  if (refresh) {
    try {
      await fetch(`${API_BASE}/token/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });
    } catch {
      // best effort
    }
  }
  clearAuthTokens();
};

// ============================================================
// User
// ============================================================

export const getUser = async (id: number): Promise<User> => {
  return fetchWithAuth<User>(`${API_BASE}/user/${id}`, {
    method: "GET",
    headers: buildAuthHeaders(),
  });
};

export const updateUser = async (
  id: number,
  payload: { first_name?: string; last_name?: string; email?: string }
): Promise<{ success: boolean; user: User }> => {
  return fetchWithAuth(`${API_BASE}/user/${id}`, {
    method: "PUT",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
};

export const deleteUser = async (id: number): Promise<{ success: boolean }> => {
  return fetchWithAuth(`${API_BASE}/user/${id}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });
};

// ============================================================
// Items (lost & found posts) — backend mounts under /home
// ============================================================

export const listItems = async (
  limit = 50,
  offset = 0
): Promise<ItemListItem[]> => {
  const url = new URL(`${API_BASE}/home/`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  const response = await fetch(url.toString(), { method: "GET" });
  return handleResponse<ItemListItem[]>(response);
};

export const getItem = async (itemId: number): Promise<Item> => {
  const response = await fetch(`${API_BASE}/home/${itemId}`, {
    method: "GET",
  });
  return handleResponse<Item>(response);
};

export const createItem = async (
  payload: ItemCreatePayload
): Promise<Item> => {
  return fetchWithAuth<Item>(`${API_BASE}/home/`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
};

export const updateItemStatus = async (
  itemId: number,
  givenBack: boolean
): Promise<{ success: boolean }> => {
  return fetchWithAuth(`${API_BASE}/home/${itemId}`, {
    method: "PUT",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ given_back: givenBack }),
  });
};

export const deleteItem = async (
  itemId: number
): Promise<{ success: boolean }> => {
  return fetchWithAuth(`${API_BASE}/home/${itemId}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });
};

// ============================================================
// Conversations & Messages
// ============================================================

export const createOrFindConversation = async (
  recipientId: number
): Promise<Conversation> => {
  return fetchWithAuth<Conversation>(`${API_BASE}/conversations/`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ recipient_id: recipientId }),
  });
};

export const listConversations = async (
  limit = 50,
  offset = 0
): Promise<ConversationListItem[]> => {
  const url = new URL(`${API_BASE}/conversations/`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  return fetchWithAuth<ConversationListItem[]>(url.toString(), {
    method: "GET",
    headers: buildAuthHeaders(),
  });
};

export const deleteConversation = async (
  conversationId: number
): Promise<{ success: boolean }> => {
  return fetchWithAuth(`${API_BASE}/conversations/${conversationId}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });
};

export const listMessages = async (
  conversationId: number,
  limit = 50,
  offset = 0
): Promise<Message[]> => {
  const url = new URL(`${API_BASE}/conversations/${conversationId}/messages`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  return fetchWithAuth<Message[]>(url.toString(), {
    method: "GET",
    headers: buildAuthHeaders(),
  });
};

export const sendMessage = async (
  conversationId: number,
  content: string
): Promise<Message> => {
  return fetchWithAuth<Message>(
    `${API_BASE}/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: buildAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ content }),
    }
  );
};

export const deleteMessage = async (
  messageId: number
): Promise<{ success: boolean }> => {
  return fetchWithAuth(`${API_BASE}/messages/${messageId}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });
};

// ============================================================
// Helpers
// ============================================================

/**
 * Best-effort fetch of the current logged-in user. Backend doesn't expose
 * /me on the items API, so we use the stored user id from login.
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const id = getStoredUserId();
  if (!id) return null;
  try {
    return await getUser(id);
  } catch {
    return null;
  }
};
