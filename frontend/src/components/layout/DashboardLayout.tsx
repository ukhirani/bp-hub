import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AppShell } from "@astryxdesign/core/AppShell";
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from "@astryxdesign/core/SideNav";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { BookOpen, LayoutList, LogOut, Plus, UserRound } from "lucide-react";

import BrandMark from "@/components/BrandMark";
import Snackbar, { type SnackbarNotice } from "@/components/ui/snackbar";
import { useAuth } from "@/context/auth-context";

function AppSideNav({ onLogout }: { onLogout: () => void }) {
  const { pathname } = useLocation();
  const { username, isLoading } = useAuth();

  const profilePath = username ? `/home/profile/${username}` : undefined;
  const isTemplates =
    pathname === "/home" ||
    (pathname.startsWith("/home/templates/") &&
      pathname !== "/home/templates/new");

  return (
    <SideNav
      collapsible
      header={
        <SideNavHeading
          heading="BP Hub"
          subheading="Boilerplate templates"
          headingHref="/home"
          icon={<BrandMark size={28} label="" />}
        />
      }
      topContent={
        <Button
          label="Add template"
          variant="primary"
          icon={<Icon icon={Plus} />}
          href="/home/templates/new"
          width="100%"
        />
      }
      footer={
        <SideNavSection title="Account" isHeaderHidden>
          {isLoading || !username ? (
            <Skeleton height={36} radius={2} />
          ) : (
            <SideNavItem
              label={username}
              icon={UserRound}
              href={profilePath}
              isSelected={pathname === profilePath}
            />
          )}
          <SideNavItem label="Log out" icon={LogOut} onClick={onLogout} />
        </SideNavSection>
      }
    >
      <SideNavSection title="Registry" isHeaderHidden>
        <SideNavItem
          label="Templates"
          icon={LayoutList}
          href="/home"
          isSelected={isTemplates}
        />
        <SideNavItem label="Documentation" icon={BookOpen} href="/docs" />
      </SideNavSection>
    </SideNav>
  );
}

export default function DashboardLayout() {
  const { token, clearToken } = useAuth();
  // Logging out sends you to sign in; losing the session any other way goes home.
  const [loggedOut, setLoggedOut] = useState(false);
  const [notice, setNotice] = useState<SnackbarNotice | null>(null);

  // A page that navigated here can leave one notice behind (e.g. "Template created").
  useEffect(() => {
    const stored = sessionStorage.getItem("app_notice");
    if (!stored) return;
    try {
      setNotice(JSON.parse(stored) as SnackbarNotice);
    } catch {
      setNotice(null);
    } finally {
      sessionStorage.removeItem("app_notice");
    }
  }, []);

  if (!token) {
    return <Navigate to={loggedOut ? "/login" : "/"} replace />;
  }

  return (
    <AppShell
      sideNav={
        <AppSideNav
          onLogout={() => {
            setLoggedOut(true);
            clearToken();
          }}
        />
      }
    >
      <Snackbar notice={notice} onClose={() => setNotice(null)} />
      <Outlet />
    </AppShell>
  );
}
