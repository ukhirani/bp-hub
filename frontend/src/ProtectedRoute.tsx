import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, token }) {
  if (!token) {
    console.log(children, token);
    return <Navigate to="/login" replace />;
  }

  return children;
}
