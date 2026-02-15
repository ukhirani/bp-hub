import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getStoredToken, getStoredRefreshToken } from "../../auth/auth";
import type { UserToken, Token } from "../../types/UserToken";

const API_BASE = "https://bp-hub-render-service.onrender.com";

type AuthContextType = {
  token: Token;
  username: string | null;
  isLoading: boolean;
  setToken: (userToken: UserToken) => void;
  clearToken: () => void;
  setUsername: (username: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<Token>(getStoredToken());
  const [username, setUsernameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch username when token changes
  useEffect(() => {
    if (!token) {
      setUsernameState(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    fetch(`${API_BASE}/userStatus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 401) {
          // Token expired — try silent refresh
          const newToken = await tryRefreshToken();
          if (!newToken) {
            // Refresh also failed — force re-login
            localStorage.removeItem("token");
            setTokenState(null);
            setUsernameState(null);
            return null;
          }
          // Retry with fresh token
          const retryResp = await fetch(`${API_BASE}/userStatus`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: newToken }),
            signal: controller.signal,
          });
          if (!retryResp.ok) {
            localStorage.removeItem("token");
            setTokenState(null);
            setUsernameState(null);
            return null;
          }
          return retryResp.json();
        }
        return response.json();
      })
      .then((data: { hasProfile?: boolean; username?: string } | null) => {
        if (data?.username) {
          setUsernameState(data.username);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch user status:", err);
        }
      })
      .finally(() => {
        setIsLoading(false);
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
    setUsernameState(null);
  };

  const setUsername = (newUsername: string) => {
    setUsernameState(newUsername);
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
