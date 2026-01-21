import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage.tsx";
import Profile from "./pages/Profile";
import Login from "./pages/Login.tsx";
import useToken from "../hooks/useToken.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";

export default function App() {
  const { token, setToken } = useToken();
  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <div className="wrapper">
      <h1>Application</h1>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute token={token}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/" // ik it's kinda stupid to put the landing page in a ProtectedRoute
            element={
              <ProtectedRoute token={token}>
                <LandingPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
