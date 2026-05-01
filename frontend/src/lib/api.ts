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