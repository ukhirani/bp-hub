import { useState } from "react";
import type { UserToken } from "../types/UserToken.ts";

export default function useToken() {
  const getToken = () => {
    const tokenString = sessionStorage.getItem("token");
    if (!tokenString) {
      return null;
    }
    const userToken = JSON.parse(tokenString);
    return userToken?.token;
  };

  const [token, setToken] = useState(getToken());

  const saveToken = (userToken: UserToken) => {
    sessionStorage.setItem("token", JSON.stringify(userToken));
    setToken(userToken.token);
  };

  return {
    setToken: saveToken,
    token,
  };
}
