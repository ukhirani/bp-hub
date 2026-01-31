import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Login from "./pages/Login.tsx";
import Home from "./pages/Home.tsx";
import Profile from "./pages/Profile.tsx";
import NotFound from "./pages/NotFound.tsx";
import TemplateDetail from "./pages/TemplateDetail.tsx";
import DashboardLayout from "./components/layout/DashboardLayout.tsx";
import { authLoader } from "../auth/authloader.ts";

import "./index.css";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "templates/:username/:templateName",
        element: <TemplateDetail />,
      },
      {
        path: "profile/:id?",
        loader: authLoader,
        element: <Profile />,
      },
      {
        path: "deployments",
        element: <Home />, // Placeholder - can be replaced with actual component
      },
      {
        path: "activity",
        element: <Home />, // Placeholder - can be replaced with actual component
      },
      {
        path: "domains",
        element: <Home />, // Placeholder - can be replaced with actual component
      },
      {
        path: "usage",
        element: <Home />, // Placeholder - can be replaced with actual component
      },
      {
        path: "settings",
        element: <Home />, // Placeholder - can be replaced with actual component
      },
    ],
  },
  {
    path: "*",
    element: <NotFound>Page not found</NotFound>,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
