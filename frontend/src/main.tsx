// Declares the cascade-layer order; must load before any theme stylesheet.
import "./index.css";

import { StrictMode, Suspense, lazy, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Theme } from "@astryxdesign/core/theme";
import { LinkProvider } from "@astryxdesign/core/Link";
import { LayerProvider } from "@astryxdesign/core/Layer";

import { themes, defaultThemeSlug } from "./astryx-themes";
import AppLink from "./lib/AppLink.tsx";

const Login = lazy(() => import("./pages/Login.tsx"));
const Signup = lazy(() => import("./pages/Signup.tsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.tsx"));
const Home = lazy(() => import("./pages/Home.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const TemplateDetail = lazy(() => import("./pages/TemplateDetail.tsx"));
const AddTemplate = lazy(() => import("./pages/AddTemplate.tsx"));
const Docs = lazy(() => import("./pages/Docs.tsx"));
const LandingPage = lazy(() => import("./pages/LandingPage.tsx"));
const DashboardLayout = lazy(() => import("./components/layout/DashboardLayout.tsx"));
import { AuthProvider } from "./context/AuthContext.tsx";

// Each route loads its own chunk; nothing shows until it arrives (they are small).
const page = (node: ReactNode) => <Suspense fallback={null}>{node}</Suspense>;

const router = createBrowserRouter([
  { path: "/", element: page(<LandingPage />) },
  { path: "/docs", element: page(<Docs />) },
  { path: "/login", element: page(<Login />) },
  { path: "/signup", element: page(<Signup />) },
  { path: "/onboarding", element: page(<Onboarding />) },
  {
    path: "/home",
    element: page(<DashboardLayout />),
    children: [
      { index: true, element: page(<Home />) },
      {
        path: "templates/:username/:templateName",
        element: page(<TemplateDetail />),
      },
      { path: "templates/new", element: page(<AddTemplate />) },
      { path: "profile/:username", element: page(<Profile />) },
      // Reserved sections, not built yet: they show the template list.
      ...["deployments", "activity", "domains", "usage", "settings"].map(
        (path) => ({ path, element: page(<Home />) }),
      ),
    ],
  },
  { path: "*", element: page(<NotFound />) },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Theme theme={themes[defaultThemeSlug]}>
      <LayerProvider>
        <LinkProvider component={AppLink}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </LinkProvider>
      </LayerProvider>
    </Theme>
  </StrictMode>,
);
