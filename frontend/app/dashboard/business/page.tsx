"use client";

import Topbar from "@/components/Topbar";
import BusinessPanel from "@/components/BusinessPanel";
import { useDashboard } from "@/components/DashboardDataProvider";

export default function BusinessPage() {
  const { user } = useDashboard();
  if (!user) return null;

  return (
    <>
      <Topbar userName={user.full_name} university={user.university} />
      <div className="max-w-2xl">
        <BusinessPanel />
      </div>
    </>
  );
}
