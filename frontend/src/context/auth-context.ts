import { createContext, useContext } from "react";
import type { UserToken, Token } from "../../types/UserToken";

export type AuthContextType = {
  token: Token;
  username: string | null;
  isLoading: boolean;
  setToken: (userToken: UserToken) => void;
  clearToken: () => void;
  setUsername: (username: string) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
