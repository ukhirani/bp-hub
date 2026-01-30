import { redirect } from "react-router-dom";
import { getStoredToken } from "./auth.ts";

export function authLoader() {
  const token = getStoredToken();

  // If there is no token, redirect to login.
  if (!token) {
    return redirect("/");
  }

  // Authorized: allow the route element to render.
  return null;
}
