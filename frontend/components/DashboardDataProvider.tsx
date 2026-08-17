"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, loadStoredToken, setAuthToken, User, Wallet, TrustScore, Transaction } from "@/lib/api";

interface DashboardData {
  user: User | null;
  wallet: Wallet | null;
  trust: TrustScore | null;
  transactions: Transaction[];
  ready: boolean;
  reload: () => Promise<void>;
  logout: () => void;
}

const DashboardContext = createContext<DashboardData>({
  user: null,
  wallet: null,
  trust: null,
  transactions: [],
  ready: false,
  reload: async () => {},
  logout: () => {},
});

export function useDashboard() {
  return useContext(DashboardContext);
}

export default function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
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

  function logout() {
    setAuthToken(null);
    router.replace("/login");
  }

  return (
    <DashboardContext.Provider value={{ user, wallet, trust, transactions, ready, reload: loadAll, logout }}>
      {children}
    </DashboardContext.Provider>
  );
}
