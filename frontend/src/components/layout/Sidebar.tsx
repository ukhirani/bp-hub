import { useNavigate } from "react-router-dom";
import { LogOut, Plus, UserRound, X } from "lucide-react";
import { useNavigation } from "@/context/NavigationContext";
import { useAuth } from "@/context/AuthContext";
import bpLogo from "@/assets/white.png";
import { useState } from "react";
import { RandomAvatar } from "react-random-avatars";

export default function Sidebar() {
  const {
    activeNav,
    setActiveNav,
    sidebarOpen,
    setSidebarOpen,
    navItems,
  } = useNavigation();
  const navigate = useNavigate();
  const { username, isLoading, clearToken } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (item: { name: string; path: string }) => {
    setActiveNav(item.name);
    navigate(item.path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    clearToken();
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:fixed inset-y-0 left-0 z-50
          w-64 bg-[#0f1117] border-r border-gray-800
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col h-screen overflow-hidden
        `}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <img className="w-8 h-8 text-white" src={bpLogo} alt="Logo" />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 pt-4">
          <button
            onClick={() => navigate("/home/templates/new")}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 px-3 py-2 text-sm font-medium hover:bg-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Add template
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                transition-colors cursor-pointer
                ${
                  activeNav === item.name
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
        {/* <div className="px-3 py-4 border-t border-gray-800 flex-shrink-0">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Your Templates
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
        </div> */}

        {/* User profile */}
        <div className="p-4 border-t border-gray-800 flex-shrink-0 relative">
          {isLoading || !username ? (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
              <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
            </div>
          ) : (
            <>
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <RandomAvatar key={username} name={username} size={32} />
                <span className="text-sm font-medium text-white">{username}</span>
              </button>

              {menuOpen && (
                <div className="absolute bottom-14 left-4 w-48 rounded-lg border border-gray-800 bg-[#0f1117] shadow-lg overflow-hidden flex flex-col">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(`/home/profile/${username}`);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm leading-5 text-left text-gray-200 hover:bg-gray-800"
                  >
                    <UserRound className="h-4 w-4" />
                    View profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm leading-5 text-left text-red-300 hover:bg-gray-800"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
