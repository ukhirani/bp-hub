import { useState, useEffect, useCallback, type ReactNode } from "react";
import { getStoredToken, getStoredRefreshToken } from "../../auth/auth";
import type { UserToken, Token } from "../../types/UserToken";
import { AuthContext } from "./auth-context";
import { API_BASE } from "@/lib/api";

/** The /userStatus answer, remembered with the token it was fetched for. */
type Fetched = { token: Token; username: string | null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<Token>(getStoredToken());
  const [fetched, setFetched] = useState<Fetched | null>(null);
  // A username the app already knows (set right after login or onboarding).
  const [knownUsername, setKnownUsername] = useState<string | null>(null);

  // Derived during render, so the effect below only sets state from its callbacks.
  const isLoading = !!token && fetched?.token !== token;
  const username = token
    ? (knownUsername ?? (fetched?.token === token ? fetched.username : null))
    : null;

  // Try to refresh the ID token using the stored refresh token
  const tryRefreshToken = useCallback(async (): Promise<string | null> => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE}/refreshToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (data?.idToken) {
        // Update localStorage with new tokens
        const stored = { token: data.idToken, refreshToken: data.refreshToken || refreshToken };
        localStorage.setItem("token", JSON.stringify(stored));
        setTokenState(data.idToken);
        return data.idToken;
      }
    } catch {
      // Refresh failed silently
    }
    return null;
  }, []);

  // Fetch the username whenever the token changes.
  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    const signOut = () => {
      localStorage.removeItem("token");
      setTokenState(null);
      setKnownUsername(null);
    };
    const statusFor = (idToken: string) =>
      fetch(`${API_BASE}/userStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        signal: controller.signal,
      });

    statusFor(token)
      .then(async (response) => {
        if (response.status !== 401) return response.json();
        // Token expired: try a silent refresh, then retry once.
        const newToken = await tryRefreshToken();
        if (!newToken) {
          signOut();
          return null;
        }
        const retry = await statusFor(newToken);
        if (!retry.ok) {
          signOut();
          return null;
        }
        return retry.json();
      })
      .then((data: { hasProfile?: boolean; username?: string } | null) => {
        setFetched({ token, username: data?.username ?? null });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Failed to fetch user status:", err);
        setFetched({ token, username: null });
      });

    return () => controller.abort();
  }, [token, tryRefreshToken]);

  const setToken = (userToken: UserToken) => {
    localStorage.setItem("token", JSON.stringify(userToken));
    setTokenState(userToken.token);
  };

  const clearToken = () => {
    localStorage.removeItem("token");
    setTokenState(null);
    setKnownUsername(null);
  };

  const setUsername = (newUsername: string) => {
    setKnownUsername(newUsername);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        isLoading,
        setToken,
        clearToken,
        setUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
