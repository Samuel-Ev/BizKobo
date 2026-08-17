"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Repeat, Coins } from "lucide-react";
import { api, SavingsGroup } from "@/lib/api";

export default function SavingsPanel() {
  const [myGroups, setMyGroups] = useState<SavingsGroup[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<SavingsGroup[]>([]);
  const [ready, setReady] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [contribAmount, setContribAmount] = useState("2000");
  const [frequency, setFrequency] = useState("7");
  const [busyGroupId, setBusyGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const [mine, discover] = await Promise.all([
      api.get<SavingsGroup[]>("/savings"),
      api.get<SavingsGroup[]>("/savings/discover"),
    ]);
    setMyGroups(mine.data);
    setDiscoverGroups(discover.data);
    setReady(true);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await api.post("/savings", {
      name,
      contribution_amount: parseFloat(contribAmount),
      frequency_days: parseInt(frequency),
    });
    setShowCreate(false);
    setName("");
    loadAll();
  }

  async function handleJoin(groupId: string) {
    setBusyGroupId(groupId);
    setError(null);
    try {
      await api.post(`/savings/${groupId}/join`);
      loadAll();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Couldn't join this group");
    } finally {
      setBusyGroupId(null);
    }
  }

  async function handleContribute(groupId: string) {
    setBusyGroupId(groupId);
    setError(null);
    try {
      await api.post(`/savings/${groupId}/contribute`);
      loadAll();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Couldn't process contribution");
    } finally {
      setBusyGroupId(null);
    }
  }

  if (!ready) {
    return <div className="h-40 flex items-center justify-center text-slate text-sm">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-[15px] font-semibold text-paper">Your Ajo groups</h3>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-1.5 text-[12.5px] font-semibold text-copper-light"
        >
          <Plus size={14} /> New group
        </button>
      </div>

      {showCreate && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleCreate}
          className="rounded-xl2 border border-line/[0.07] bg-ink-2 p-4 mb-5 space-y-3 overflow-hidden"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name — e.g. Roommates Ajo"
            className="w-full bg-ink-3 border border-line/[0.09] rounded-xl px-3.5 py-2.5 text-[13.5px] text-paper placeholder-slate focus:outline-none focus:border-copper-light/60"
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[11px] text-slate mb-1 block">Contribution (₦)</label>
              <input
                type="number"
                value={contribAmount}
                onChange={(e) => setContribAmount(e.target.value)}
                className="w-full bg-ink-3 border border-line/[0.09] rounded-xl px-3.5 py-2.5 text-[13.5px] text-paper focus:outline-none focus:border-copper-light/60"
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] text-slate mb-1 block">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-ink-3 border border-line/[0.09] rounded-xl px-3.5 py-2.5 text-[13.5px] text-paper focus:outline-none focus:border-copper-light/60"
              >
                <option value="7">Weekly</option>
                <option value="30">Monthly</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-copper hover:brightness-110 text-white font-semibold text-sm rounded-xl py-3">
            Create group
          </button>
        </motion.form>
      )}

      {error && (
        <div className="text-[12.5px] text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl px-3.5 py-2.5 mb-4">
          {error}
        </div>
      )}

      {myGroups.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center text-center py-10 px-6 rounded-xl2 border border-dashed border-line/[0.09] mb-6">
          <Users size={20} className="text-copper-light mb-2" />
          <p className="text-[13px] text-slate max-w-xs">You're not in any Ajo group yet — create one or join below.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-7">
          {myGroups.map((g) => (
            <div key={g.id} className="rounded-xl2 border border-line/[0.07] bg-ink-2 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-paper text-[13.5px]">{g.name}</div>
                <div className="text-[11px] text-slate flex items-center gap-1">
                  <Repeat size={11} /> {g.frequency_days === 7 ? "Weekly" : "Monthly"}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[12px] text-slate">
                  Cycle {g.current_cycle} · {g.member_count} member{g.member_count !== 1 ? "s" : ""}
                </div>
                <button
                  onClick={() => handleContribute(g.id)}
                  disabled={busyGroupId === g.id}
                  className="flex items-center gap-1.5 bg-copper/15 border border-copper-light/40 text-copper-light text-[12px] font-semibold rounded-lg px-3 py-1.5 disabled:opacity-50"
                >
                  <Coins size={12} /> Contribute ₦{g.contribution_amount.toLocaleString("en-NG")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {discoverGroups.length > 0 && (
        <>
          <h3 className="font-display text-[15px] font-semibold text-paper mb-3">Join a group at NBU</h3>
          <div className="space-y-3">
            {discoverGroups.map((g) => (
              <div key={g.id} className="rounded-xl2 border border-line/[0.07] bg-ink-2 p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-paper text-[13.5px]">{g.name}</div>
                  <div className="text-[11.5px] text-slate mt-0.5">
                    ₦{g.contribution_amount.toLocaleString("en-NG")} · {g.frequency_days === 7 ? "Weekly" : "Monthly"} · {g.member_count} member{g.member_count !== 1 ? "s" : ""}
                  </div>
                </div>
                <button
                  onClick={() => handleJoin(g.id)}
                  disabled={busyGroupId === g.id}
                  className="bg-line/[0.045] hover:bg-line/[0.05] text-paper text-[12.5px] font-semibold rounded-lg px-3.5 py-2 disabled:opacity-50"
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
