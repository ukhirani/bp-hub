import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage.tsx";
import Profile from "./pages/Profile";
import { useState } from "react";
import Login from "./pages/Login.tsx";
export default function App() {
  const [token, setToken] = useState<string | null>(null);

  // show
  if (!token) {
    return <Login setToken={setToken} />;
  }
  return (
    <div className="wrapper">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
