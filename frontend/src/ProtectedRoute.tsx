import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import type { Token } from "types/UserToken";

type ProtectedRouteProps = {
  children: ReactNode;
  token?: Token;
};

export default function ProtectedRoute({
  children,
  token,
}: ProtectedRouteProps) {
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
