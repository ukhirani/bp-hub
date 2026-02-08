import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Home from "./pages/Home.tsx";
import Profile from "./pages/Profile.tsx";
import NotFound from "./pages/NotFound.tsx";
import TemplateDetail from "./pages/TemplateDetail.tsx";
import AddTemplate from "./pages/AddTemplate.tsx";
import DashboardLayout from "./components/layout/DashboardLayout.tsx";

import "./index.css";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
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
        path: "templates/new",
        element: <AddTemplate />,
      },
      {
        path: "profile/:username",
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
