"use client";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import DashboardDataProvider, { useDashboard } from "@/components/DashboardDataProvider";

function Shell({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useDashboard();

  if (!ready || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-copper-light to-copper-dark animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink lg:flex">
      <Sidebar university={user.university} userName={user.full_name} onLogout={logout} />
      <main className="flex-1 px-4 pt-6 pb-28 lg:px-10 lg:py-10 lg:pb-10 w-full max-w-7xl mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardDataProvider>
      <Shell>{children}</Shell>
    </DashboardDataProvider>
  );
}
