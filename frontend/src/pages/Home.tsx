import useToken from "../../hooks/useToken";
import LandingPage from "./LandingPage";
import { useState } from "react";
import bpLogo from "@/assets/white.png";

import {
  FolderKanban,
  Rocket,
  Activity,
  Globe,
  BarChart3,
  Settings,
  Search,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Navigation items
const navItems = [
  { name: "Projects", icon: FolderKanban, active: false },
  { name: "Deployments", icon: Rocket, active: true },
  { name: "Activity", icon: Activity, active: false },
  { name: "Domains", icon: Globe, active: false },
  { name: "Usage", icon: BarChart3, active: false },
  { name: "Settings", icon: Settings, active: false },
];

// Teams data
const teams = [
  { name: "Planetaria", initial: "P" },
  { name: "Protocol", initial: "P" },
  { name: "Tailwind Labs", initial: "T" },
];

// Deployments data
const deployments = [
  {
    team: "Planetaria",
    project: "ios-app",
    status: "success",
    source: "GitHub",
    time: "Initiated 1m 32s ago",
    badge: "Preview",
  },
  {
    team: "Planetaria",
    project: "mobile-api",
    status: "success",
    source: "GitHub",
    time: "Deployed 3m ago",
    badge: "Production",
  },
  {
    team: "Tailwind Labs",
    project: "tailwindcss.com",
    status: "success",
    source: "GitHub",
    time: "Deployed 3h ago",
    badge: "Preview",
  },
  {
    team: "Tailwind Labs",
    project: "company-website",
    status: "success",
    source: "GitHub",
    time: "Deployed 1d ago",
    badge: "Preview",
  },
  {
    team: "Protocol",
    project: "relay-service",
    status: "success",
    source: "GitHub",
    time: "Deployed 1d ago",
    badge: "Production",
  },
  {
    team: "Planetaria",
    project: "android-app",
    status: "success",
    source: "GitHub",
    time: "Deployed 5d ago",
    badge: "Preview",
  },
  {
    team: "Protocol",
    project: "api.protocol.chat",
    status: "error",
    source: "GitHub",
    time: "Failed to deploy 6d ago",
    badge: "Preview",
  },
  {
    team: "Planetaria",
    project: "planetaria.tech",
    status: "success",
    source: "GitHub",
    time: "Deployed 6d ago",
    badge: "Preview",
  },
];

// Sidebar component
function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-[#0f1117] border-r border-gray-800
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img className="w-8 h-8 text-white" src={bpLogo} alt="Logo" />
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                transition-colors cursor-pointer
                ${
                  item.active
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>

        {/* Teams section */}
        <div className="px-3 py-4 border-t border-gray-800">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Your teams
          </h3>
          <div className="space-y-1">
            {teams.map((team) => (
              <button
                key={team.name}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <span className="w-6 h-6 rounded-md bg-gray-700 flex items-center justify-center text-xs font-medium text-white">
                  {team.initial}
                </span>
                {team.name}
              </button>
            ))}
          </div>
        </div>

        {/* User profile */}
        <div className="p-4 border-t border-gray-800">
          <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
              alt="User avatar"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm font-medium text-white">Tom Cook</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// Deployment item component
function DeploymentItem({
  team,
  project,
  status,
  source,
  time,
  badge,
}: {
  team: string;
  project: string;
  status: "success" | "error";
  source: string;
  time: string;
  badge: "Preview" | "Production";
}) {
  return (
    <div className="flex items-center justify-between py-4 px-4 sm:px-6 hover:bg-gray-800/30 transition-colors cursor-pointer group">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        {/* Status indicator */}
        <span
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            status === "success" ? "bg-emerald-500" : "bg-red-500"
          }`}
        />

        {/* Project info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-white font-medium text-sm sm:text-base">
            <span className="truncate">{team}</span>
            <span className="text-gray-500">/</span>
            <span className="truncate">{project}</span>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Deploys from {source} · {time}
          </div>
        </div>
      </div>

      {/* Badge and arrow */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2">
        <Button
          variant="outline"
          size="sm"
          className={`
            text-xs font-medium border rounded-md px-2.5 py-1 h-auto
            ${
              badge === "Production"
                ? "bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20"
                : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
            }
          `}
        >
          {badge}
        </Button>
        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors hidden sm:block" />
      </div>
    </div>
  );
}

export default function Home() {
  const { token } = useToken();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!token) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header with search */}
        <header className="sticky top-0 z-30 bg-[#0a0b0f] border-b border-gray-800">
          <div className="flex items-center gap-4 px-4 sm:px-6 py-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-white placeholder-gray-500 text-sm"
                readOnly
              />
            </div>
          </div>
        </header>

        {/* Deployments list */}
        <div className="flex-1 overflow-auto">
          <div className="divide-y divide-gray-800">
            {deployments.map((deployment, index) => (
              <DeploymentItem
                key={index}
                team={deployment.team}
                project={deployment.project}
                status={deployment.status as "success" | "error"}
                source={deployment.source}
                time={deployment.time}
                badge={deployment.badge as "Preview" | "Production"}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
