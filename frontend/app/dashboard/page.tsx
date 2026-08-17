"use client";

import { useState } from "react";

import Topbar from "@/components/Topbar";
import BalanceCard from "@/components/BalanceCard";
import QuickActions from "@/components/QuickActions";
import TrustScoreCard from "@/components/TrustScoreCard";
import TransactionList from "@/components/TransactionList";
import ExploreGrid from "@/components/ExploreGrid";
import UrgentModal from "@/components/UrgentModal";
import MoneyModal from "@/components/MoneyModal";
import { useDashboard } from "@/components/DashboardDataProvider";

export default function DashboardHomePage() {
  const { user, wallet, trust, transactions, reload } = useDashboard();
  const [urgentOpen, setUrgentOpen] = useState(false);
  const [moneyMode, setMoneyMode] = useState<"send" | "fund" | "fees" | null>(null);

  if (!user || !wallet || !trust) return null;

  function handleQuickAction(key: string) {
    if (key === "urgent") setUrgentOpen(true);
    else if (key === "send" || key === "fund" || key === "fees") setMoneyMode(key);
  }

  return (
    <>
      <Topbar userName={user.full_name} university={user.university} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BalanceCard balance={wallet.balance} trustScore={trust.score} urgentLimit={trust.urgent_limit} />
          <QuickActions onAction={handleQuickAction} />

          <ExploreGrid />

          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-[15px] font-semibold text-paper">Recent activity</h3>
          </div>
          <TransactionList transactions={transactions} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-[15px] font-semibold text-paper">Your Trust Score</h3>
          </div>
          <TrustScoreCard data={trust} />
        </div>
      </div>

      <UrgentModal open={urgentOpen} onClose={() => setUrgentOpen(false)} onApproved={() => reload()} />
      <MoneyModal mode={moneyMode} onClose={() => setMoneyMode(null)} onSuccess={() => reload()} />
    </>
  );
}
