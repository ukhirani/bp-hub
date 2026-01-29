import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Login from "./pages/Login.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import Profile from "./pages/Profile.tsx";
import { authLoader } from "../auth/authloader.ts";

import "./index.css";

function RouterWrapper() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/",
      loader: authLoader,
      element: <LandingPage />,
    },
    {
      path: "/profile",
      loader: authLoader,
      element: <Profile />,
    },
  ]);

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterWrapper />
  </StrictMode>,
);
