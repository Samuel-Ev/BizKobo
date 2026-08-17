"use client";

import Topbar from "@/components/Topbar";
import SavingsPanel from "@/components/SavingsPanel";
import { useDashboard } from "@/components/DashboardDataProvider";

export default function SavingsPage() {
  const { user } = useDashboard();
  if (!user) return null;

  return (
    <>
      <Topbar userName={user.full_name} university={user.university} />
      <div className="max-w-2xl">
        <SavingsPanel />
      </div>
    </>
  );
}
