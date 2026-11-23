export const API_BASE = "https://bp-hub-render-service.onrender.com";

export type AuthErrorResponse = {
  error?: {
    message?: string;
  };
};

export type UserStatusResponse = {
  hasProfile: boolean;
  username?: string;
};

/** POST JSON and throw the backend's error code (or `fallbackCode`) on failure. */
export async function postJSON<T>(
  path: string,
  body: unknown,
  fallbackCode: string,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as
    | T
    | AuthErrorResponse;

  if (!response.ok) {
    throw new Error(
      (data as AuthErrorResponse)?.error?.message ?? fallbackCode,
    );
  }

  return data as T;
}

export function fetchUserStatus(idToken: string) {
  return postJSON<UserStatusResponse>(
    "/userStatus",
    { idToken },
    "USER_STATUS_FAILED",
  );
}
