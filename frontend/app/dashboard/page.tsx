"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Topbar from "@/components/Topbar";
import BalanceCard from "@/components/BalanceCard";
import QuickActions from "@/components/QuickActions";
import TrustScoreCard from "@/components/TrustScoreCard";
import TransactionList from "@/components/TransactionList";
import UrgentModal from "@/components/UrgentModal";
import MoneyModal from "@/components/MoneyModal";
import BusinessPanel from "@/components/BusinessPanel";
import SavingsPanel from "@/components/SavingsPanel";
import ParentLinkCard from "@/components/ParentLinkCard";

import { api, loadStoredToken, setAuthToken, User, Wallet, TrustScore, Transaction } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("home");
  const [urgentOpen, setUrgentOpen] = useState(false);
  const [moneyMode, setMoneyMode] = useState<"send" | "fund" | "fees" | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [trust, setTrust] = useState<TrustScore | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadAll = useCallback(async () => {
    const [meRes, walletRes, trustRes, txnRes] = await Promise.all([
      api.get("/auth/me"),
      api.get("/wallet"),
      api.get("/trust-score"),
      api.get("/transactions"),
    ]);
    setUser(meRes.data);
    setWallet(walletRes.data);
    setTrust(trustRes.data);
    setTransactions(txnRes.data);
  }, []);

  useEffect(() => {
    const token = loadStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    loadAll()
      .then(() => setReady(true))
      .catch(() => {
        setAuthToken(null);
        router.replace("/login");
      });
  }, [loadAll, router]);

  function handleLogout() {
    setAuthToken(null);
    router.replace("/login");
  }

  function handleQuickAction(key: string) {
    if (key === "urgent") setUrgentOpen(true);
    else if (key === "send" || key === "fund" || key === "fees") setMoneyMode(key);
  }

  if (!ready || !user || !wallet || !trust) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-copper-light to-copper-dark animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink lg:flex">
      <Sidebar
        active={tab}
        onNavigate={setTab}
        university={user.university}
        userName={user.full_name}
        onLogout={handleLogout}
      />

      <main className="flex-1 px-4 pt-6 pb-28 lg:px-10 lg:py-10 lg:pb-10 w-full max-w-7xl mx-auto">
        <Topbar userName={user.full_name} university={user.university} />

        {tab === "home" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BalanceCard balance={wallet.balance} trustScore={trust.score} urgentLimit={trust.urgent_limit} />
              <QuickActions onAction={handleQuickAction} />

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
        )}

        {tab === "business" && (
          <div className="max-w-2xl">
            <BusinessPanel />
          </div>
        )}

        {tab === "savings" && (
          <div className="max-w-2xl">
            <SavingsPanel />
          </div>
        )}

        {tab === "profile" && (
          <div className="max-w-xl">
            <div className="rounded-xl2 border border-black/[0.07] bg-ink-2 p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-ink-3 flex items-center justify-center text-base font-semibold text-paper">
                  {user.full_name.charAt(0)}
                </div>
                <div>
                  <div className="font-display font-semibold text-paper">{user.full_name}</div>
                  <div className="text-[12.5px] text-slate">{user.email}</div>
                </div>
              </div>
              <div className="space-y-3 text-[13px]">
                <Row label="Student ID" value={user.student_id || "—"} />
                <Row label="University" value={user.university.name} />
                <Row label="Member tier" value={`${trust.tier} · Trust Score ${trust.score}`} />
              </div>
            </div>
            <ParentLinkCard />
          </div>
        )}
      </main>

      <BottomNav
        active={tab}
        onNavigate={(key) => (key === "urgent" ? setUrgentOpen(true) : setTab(key))}
      />

      <UrgentModal
        open={urgentOpen}
        onClose={() => setUrgentOpen(false)}
        onApproved={() => loadAll()}
      />

      <MoneyModal
        mode={moneyMode}
        onClose={() => setMoneyMode(null)}
        onSuccess={() => loadAll()}
      />
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 rounded-xl2 border border-dashed border-black/[0.09]">
      <div className="w-11 h-11 rounded-2xl bg-black/[0.035] flex items-center justify-center mb-4">
        <Icon size={20} className="text-copper-light" />
      </div>
      <h3 className="font-display font-semibold text-paper mb-1.5">{title}</h3>
      <p className="text-[13px] text-slate max-w-xs leading-relaxed">{body}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-black/[0.06] last:border-0">
      <span className="text-slate">{label}</span>
      <span className="text-paper font-medium">{value}</span>
    </div>
  );
}
