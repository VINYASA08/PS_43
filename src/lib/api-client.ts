import { useAuthStore } from "@/stores/authStore";

export interface ApiFetchOptions extends Record<string, any> {
  method?: string;
  headers?: HeadersInit;
  body?: any;
}

export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});

  // Extract CSRF token from browser cookie if available
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|; )(?:sih_csrf|csrf_token)=([^;]*)/);
    if (match && !headers.has("x-csrf-token")) {
      headers.set("x-csrf-token", decodeURIComponent(match[1]));
    } else if (!headers.has("x-csrf-token") && options.method && !["GET", "HEAD", "OPTIONS"].includes(options.method.toUpperCase())) {
      try {
        const csrfRes = await fetch("/api/csrf");
        if (csrfRes.ok) {
          const { csrfToken } = await csrfRes.json();
          if (csrfToken) {
            headers.set("x-csrf-token", csrfToken);
          }
        }
      } catch {
        // Continue without header
      }
    }
  }

  // Automatically JSON serialize object bodies
  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: "include", // Ensure sih_session cookie is sent
  });

  if (response.status === 401) {
    // Avoid redirect loops if checking /api/auth/me or already on login page
    if (!endpoint.includes("/api/auth/me") && typeof window !== "undefined") {
      useAuthStore.getState().setSessionExpired(true);
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?expired=true&returnUrl=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Session expired or unauthorized");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
