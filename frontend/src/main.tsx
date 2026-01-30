import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Login from "./pages/Login.tsx";
import Home from "./pages/Home.tsx";
import Profile from "./pages/Profile.tsx";
import NotFound from "./pages/NotFound.tsx";
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
      element: <Home />,
    },
    {
      path: "/profile/:id?",
      loader: authLoader,
      element: <Profile />,
    },
    {
      path: "*",
      element: <NotFound>Page not found</NotFound>,
    },
  ]);

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterWrapper />
  </StrictMode>,
);
