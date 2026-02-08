import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  FolderKanban,
  // Rocket,
  // Activity,
  // Globe,
  BarChart3,
  Settings,
} from "lucide-react";

export interface NavItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

export interface Team {
  name: string;
  initial: string;
}

interface NavigationContextType {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  navItems: NavItem[];
  teams: Team[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

// Navigation items
const navItems: NavItem[] = [
  { name: "Templates", icon: FolderKanban, path: "/" },
  // { name: "Deployments", icon: Rocket, path: "/deployments" },
  // { name: "Activity", icon: Activity, path: "/activity" },
  // { name: "Domains", icon: Globe, path: "/domains" },
  // { name: "Analytics", icon: BarChart3, path: "/analytics" },
  // { name: "Settings", icon: Settings, path: "/settings" },
];

// Teams data
const teams: Team[] = [
  { name: "cpp-template", initial: "C" },
  { name: "react-tailwind", initial: "R" },
  { name: "go-server-template", initial: "G" },
];

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeNav, setActiveNav] = useState("Templates");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <NavigationContext.Provider
      value={{
        activeNav,
        setActiveNav,
        sidebarOpen,
        setSidebarOpen,
        navItems,
        teams,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
