/**
 * Frontend ↔ Backend Integration Tests
 *
 * These tests exercise the API client (src/lib/api.ts) — the exact code
 * the Next.js pages use to talk to the FastAPI backend.  Each test mocks
 * the network at the fetch boundary, verifying that:
 *   1. The client sends correctly shaped requests to the right endpoints.
 *   2. The client handles success responses the way the backend delivers them.
 *   3. The client handles error/auth responses (401, 400, 422) correctly.
 *
 * This proves the contract between frontend and backend is sound without
 * needing both servers running at the same time.
 */

import fetchMock from "jest-fetch-mock";
import { apiFetch, getApiErrorMessage } from "../../lib/api";

const API_BASE = "http://localhost:8000";

beforeEach(() => {
  fetchMock.resetMocks();
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// getApiErrorMessage — error parsing used by every page component
// ---------------------------------------------------------------------------

describe("getApiErrorMessage", () => {
  it("returns a fallback for null/undefined", () => {
    expect(getApiErrorMessage(null)).toBe("Something went wrong. Please try again.");
    expect(getApiErrorMessage(undefined)).toBe("Something went wrong. Please try again.");
  });

  it("returns plain string errors as-is", () => {
    expect(getApiErrorMessage("Server error")).toBe("Server error");
  });

  it("extracts detail string from FastAPI error object", () => {
    expect(getApiErrorMessage({ detail: "Email already registered." })).toBe(
      "Email already registered."
    );
  });

  it("joins msgs from FastAPI validation error array", () => {
    const validationErrors = {
      detail: [{ msg: "Invalid email" }, { msg: "Password too short" }],
    };
    expect(getApiErrorMessage(validationErrors)).toBe("Invalid email Password too short");
  });

  it("joins msgs from a plain array", () => {
    expect(getApiErrorMessage([{ msg: "Required" }, { msg: "Must be SDSU email" }])).toBe(
      "Required Must be SDSU email"
    );
  });
});

// ---------------------------------------------------------------------------
// apiFetch — the core HTTP wrapper used by all frontend API calls
// ---------------------------------------------------------------------------

describe("apiFetch — request construction", () => {
  it("calls the correct backend URL for GET /home/", async () => {
    fetchMock.mockResponseOnce(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });

    await apiFetch<unknown[]>("/api/v1/home/");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE}/api/v1/home/`,
      expect.objectContaining({ headers: expect.any(Headers) })
    );
  });

  it("attaches Authorization header when localStorage has a token", async () => {
    localStorage.setItem("token", "access-token-abc");
    fetchMock.mockResponseOnce(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });

    await apiFetch<unknown[]>("/api/v1/home/my-posts");

    const sentHeaders = fetchMock.mock.calls[0][1]?.headers as Headers;
    expect(sentHeaders.get("Authorization")).toBe("Bearer access-token-abc");
  });

  it("sets Content-Type to application/json for POST with body", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ userId: 1 }), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    });

    await apiFetch("/api/v1/user/signup", {
      method: "POST",
      body: JSON.stringify({ email: "test@sdsu.edu", password: "TestPass1!" }),
    });

    const sentHeaders = fetchMock.mock.calls[0][1]?.headers as Headers;
    expect(sentHeaders.get("Content-Type")).toBe("application/json");
  });

  it("does NOT set Content-Type for FormData (image upload)", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ url: "/uploads/image.jpg" }), {
      headers: { "Content-Type": "application/json" },
    });

    const fd = new FormData();
    fd.append("file", new Blob(["img"]), "photo.jpg");

    await apiFetch("/api/v1/uploads/image", { method: "POST", body: fd });

    const sentHeaders = fetchMock.mock.calls[0][1]?.headers as Headers;
    expect(sentHeaders.get("Content-Type")).toBeNull();
  });
});

describe("apiFetch — response handling", () => {
  it("returns parsed JSON on success", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ userId: 42 }), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    });

    const result = await apiFetch<{ userId: number }>("/api/v1/user/signup", {
      method: "POST",
      body: JSON.stringify({}),
    });

    expect(result).toEqual({ userId: 42 });
  });

  it("throws the parsed error body on non-ok response", async () => {
    const errorBody = { detail: "An account with that email already exists." };
    fetchMock.mockResponseOnce(JSON.stringify(errorBody), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });

    await expect(
      apiFetch("/api/v1/user/signup", { method: "POST", body: JSON.stringify({}) })
    ).rejects.toEqual(errorBody);
  });
});

describe("apiFetch — token refresh flow", () => {
  it("refreshes the access token on 401 and retries the request", async () => {
    localStorage.setItem("token", "expired-token");
    localStorage.setItem("refresh_token", "valid-refresh");

    // 1st call: protected endpoint → 401
    fetchMock.mockResponseOnce(JSON.stringify({ detail: "Token expired" }), {
      headers: { "Content-Type": "application/json" },
      status: 401,
    });
    // 2nd call: token refresh → new token
    fetchMock.mockResponseOnce(
      JSON.stringify({ token: "fresh-token", refresh_token: "valid-refresh" }),
      { headers: { "Content-Type": "application/json" } }
    );
    // 3rd call: retry with new token → success
    fetchMock.mockResponseOnce(JSON.stringify([{ id: 1, title: "Found Keys" }]), {
      headers: { "Content-Type": "application/json" },
    });

    const result = await apiFetch<unknown[]>("/api/v1/home/my-posts");

    expect(result).toEqual([{ id: 1, title: "Found Keys" }]);
    expect(localStorage.getItem("token")).toBe("fresh-token");
    // Three fetches: original + refresh + retry
    expect(fetchMock.mock.calls).toHaveLength(3);
  });

  it("clears tokens and throws when the refresh token is invalid", async () => {
    localStorage.setItem("token", "expired-token");
    localStorage.setItem("refresh_token", "bad-refresh");

    // Protected endpoint → 401
    fetchMock.mockResponseOnce(JSON.stringify({ detail: "Expired" }), {
      headers: { "Content-Type": "application/json" },
      status: 401,
    });
    // Refresh call → 401
    fetchMock.mockResponseOnce(JSON.stringify({ detail: "Invalid refresh token" }), {
      headers: { "Content-Type": "application/json" },
      status: 401,
    });

    await expect(apiFetch("/api/v1/home/my-posts")).rejects.toBeDefined();

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Signup → Login flow  (mirrors: create-account/page.tsx + login/page.tsx)
// ---------------------------------------------------------------------------

describe("Signup → Login flow", () => {
  it("POST /user/signup returns a userId", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ userId: 7 }), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    });

    const result = await apiFetch<{ userId: number }>("/api/v1/user/signup", {
      method: "POST",
      body: JSON.stringify({
        first_name: "Jane",
        last_name: "Aztec",
        email: "jane@sdsu.edu",
        password: "TestPass1!",
      }),
    });

    expect(result.userId).toBe(7);
    const call = fetchMock.mock.calls[0];
    expect(call[0]).toBe(`${API_BASE}/api/v1/user/signup`);
  });

  it("POST /user/login returns token pair", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ token: "access-123", refresh_token: "refresh-456", userId: 7 }),
      { headers: { "Content-Type": "application/json" } }
    );

    const result = await apiFetch<{ token: string; refresh_token: string; userId: number }>(
      "/api/v1/user/login",
      { method: "POST", body: JSON.stringify({ email: "jane@sdsu.edu", password: "TestPass1!" }) }
    );

    expect(result.token).toBe("access-123");
    expect(result.refresh_token).toBe("refresh-456");
    expect(result.userId).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// Items flow  (mirrors: home/page.tsx + create-post/page.tsx)
// ---------------------------------------------------------------------------

describe("Items flow", () => {
  it("GET /home/ fetches the public item list", async () => {
    const items = [
      { id: 1, title: "Lost Keys", report_type: "lost", location: "Library" },
    ];
    fetchMock.mockResponseOnce(JSON.stringify(items), {
      headers: { "Content-Type": "application/json" },
    });

    const result = await apiFetch<typeof items>("/api/v1/home/");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Lost Keys");
  });

  it("POST /home/ sends item data with auth header", async () => {
    localStorage.setItem("token", "user-token");
    fetchMock.mockResponseOnce(
      JSON.stringify({ id: 5, title: "Lost Backpack", user_id: 7 }),
      { headers: { "Content-Type": "application/json" } }
    );

    const result = await apiFetch<{ id: number; title: string }>("/api/v1/home/", {
      method: "POST",
      body: JSON.stringify({ title: "Lost Backpack", description: "desc", location: "lib", report_type: "lost" }),
    });

    expect(result.id).toBe(5);
    const sentHeaders = fetchMock.mock.calls[0][1]?.headers as Headers;
    expect(sentHeaders.get("Authorization")).toBe("Bearer user-token");
  });
});
