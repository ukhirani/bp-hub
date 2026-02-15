import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { NavigationProvider, useNavigation } from "@/context/NavigationContext";
import { useAuth } from "@/context/AuthContext";
import LandingPage from "@/pages/LandingPage";
import { useEffect, useState } from "react";
import Snackbar, { type SnackbarNotice } from "@/components/ui/snackbar";

function DashboardContent() {
  const { setSidebarOpen } = useNavigation();

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex">
      {/* Sidebar - fixed position */}
      <Sidebar />

      {/* Main content - with left margin to account for fixed sidebar */}
      <main className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Header - sticky */}
        <header className="sticky top-0 z-30 bg-[#0a0b0f] border-b border-gray-800 lg:hidden">
          <div className="flex items-center gap-4 px-4 sm:px-6 py-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content - scrollable */}
        <div className="flex-1 overflow-auto">
          <div className="pt-4">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout() {
  const { token } = useAuth();
  const [notice, setNotice] = useState<SnackbarNotice | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("app_notice");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as SnackbarNotice;
      setNotice(parsed);
    } catch {
      setNotice(null);
    } finally {
      sessionStorage.removeItem("app_notice");
    }
  }, []);

  // Show landing page if not authenticated
  if (!token) {
    return <LandingPage />;
  }

  return (
    <NavigationProvider>
      <Snackbar notice={notice} onClose={() => setNotice(null)} />
      <DashboardContent />
    </NavigationProvider>
  );
}
