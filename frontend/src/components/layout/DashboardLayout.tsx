import { Outlet } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import Sidebar from "./Sidebar";
import { NavigationProvider, useNavigation } from "@/context/NavigationContext";
import useToken from "../../../hooks/useToken";
import LandingPage from "@/pages/LandingPage";

function DashboardContent() {
  const { setSidebarOpen } = useNavigation();

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex">
      {/* Sidebar - fixed position */}
      <Sidebar />

      {/* Main content - with left margin to account for fixed sidebar */}
      <main className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Header with search - sticky */}
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

        {/* Page content - scrollable */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout() {
  const { token } = useToken();

  // Show landing page if not authenticated
  if (!token) {
    return <LandingPage />;
  }

  return (
    <NavigationProvider>
      <DashboardContent />
    </NavigationProvider>
  );
}
