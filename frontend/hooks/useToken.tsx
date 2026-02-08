import { useState } from "react";
import { getStoredToken } from "../auth/auth.ts";
import type { UserToken, Token } from "../types/UserToken.ts";

export default function useToken() {
  // Store just the raw token value (string | null) in state.
  const [token, setToken] = useState<Token>(getStoredToken());

  const saveToken = (userToken: UserToken) => {
    localStorage.setItem("token", JSON.stringify(userToken));
    setToken(userToken.token);
  };

  const clearToken = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return {
    token,
    setToken: saveToken,
    clearToken,
  };
}
