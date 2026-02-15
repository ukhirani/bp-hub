import type { UserToken, Token } from "../types/UserToken.ts";

export function getStoredToken(): Token {
  const tokenString = localStorage.getItem("token");
  if (!tokenString) return null;

  const userToken: UserToken = JSON.parse(tokenString);
  return userToken?.token ?? null;
}

export function getStoredRefreshToken(): string | null {
  const tokenString = localStorage.getItem("token");
  if (!tokenString) return null;

  const userToken: UserToken = JSON.parse(tokenString);
  return userToken?.refreshToken ?? null;
}
