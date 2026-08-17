"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Table2, Plus, Trash2, TrendingUp, TrendingDown, Equal } from "lucide-react";
import Topbar from "@/components/Topbar";
import { api, LedgerRecord } from "@/lib/api";
import { useDashboard } from "@/components/DashboardDataProvider";

const CATEGORIES = ["general", "food", "transport", "supplies", "sales", "fees", "other"];

export default function SpreadsheetPage() {
  const { user } = useDashboard();
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("general");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");

  const load = () => api.get<LedgerRecord[]>("/ledger").then((res) => setRecords(res.data));

  useEffect(() => {
    load().finally(() => setReady(true));
  }, []);

  const totals = useMemo(() => {
    const income = records.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
    const expense = records.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0);
    return { income, expense, net: income - expense };
  }, [records]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!desc.trim() || !amount) return;
    await api.post("/ledger", { description: desc, category, type, amount: parseFloat(amount) });
    setDesc("");
    setAmount("");
    setShowAdd(false);
    load();
  }

  async function handleDelete(id: string) {
    await api.delete(`/ledger/${id}`);
    load();
  }

  if (!user || !ready) return null;

  return (
    <div className="max-w-3xl">
      <Topbar userName={user.full_name} university={user.university} />

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-copper/15 text-copper-light flex items-center justify-center shrink-0">
            <Table2 size={22} />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-paper">Spreadsheet & Records</h1>
            <p className="text-[13px] text-slate mt-1 max-w-lg leading-relaxed">
              Manual record keeping — for cash sales, informal spending, anything outside your wallet.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-1.5 bg-copper hover:brightness-110 text-white font-semibold text-[13px] rounded-xl px-4 py-2.5"
        >
          <Plus size={15} /> Add row
        </button>
      </div>

      {showAdd && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleAdd}
          className="rounded-xl2 border border-line/[0.07] bg-ink-2 p-4 mb-5 overflow-hidden"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 mb-2.5">
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Description"
              className="sm:col-span-2 bg-ink-3 border border-line/[0.09] rounded-xl px-3.5 py-2.5 text-[13px] text-paper placeholder-slate focus:outline-none focus:border-copper-light/60"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-ink-3 border border-line/[0.09] rounded-xl px-3.5 py-2.5 text-[13px] text-paper focus:outline-none focus:border-copper-light/60"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (₦)"
              className="bg-ink-3 border border-line/[0.09] rounded-xl px-3.5 py-2.5 text-[13px] text-paper placeholder-slate focus:outline-none focus:border-copper-light/60"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {(["income", "expense"] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold capitalize border ${
                    type === t ? "bg-copper/15 border-copper-light/50 text-paper" : "border-line/[0.09] text-slate"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button type="submit" className="ml-auto bg-copper hover:brightness-110 text-white font-semibold text-[12.5px] rounded-lg px-4 py-2">
              Save row
            </button>
          </div>
        </motion.form>
      )}

      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <TotalCard label="Income" value={totals.income} icon={TrendingUp} tone="green" />
        <TotalCard label="Expense" value={totals.expense} icon={TrendingDown} tone="neutral" />
        <TotalCard label="Net" value={totals.net} icon={Equal} tone="amber" />
      </div>

      <div className="rounded-xl2 border border-line/[0.07] bg-ink-2 overflow-hidden">
        <div className="grid grid-cols-[1fr_90px_90px_36px] gap-2 px-4 py-2.5 border-b border-line/[0.07] text-[10.5px] font-semibold text-slate uppercase tracking-wide">
          <span>Description</span>
          <span>Category</span>
          <span className="text-right">Amount</span>
          <span></span>
        </div>
        {records.length === 0 && (
          <div className="text-center py-10 text-[12.5px] text-slate">No records yet — add your first row above.</div>
        )}
        {records.map((r) => (
          <div key={r.id} className="grid grid-cols-[1fr_90px_90px_36px] gap-2 px-4 py-3 border-b border-line/[0.05] last:border-0 items-center">
            <div className="min-w-0">
              <div className="text-[13px] text-paper truncate">{r.description}</div>
              <div className="text-[10.5px] text-slate">{new Date(r.date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</div>
            </div>
            <span className="text-[11.5px] text-slate capitalize truncate">{r.category}</span>
            <span className={`font-mono text-[12.5px] font-semibold text-right tabular ${r.type === "income" ? "text-green-light" : "text-paper"}`}>
              {r.type === "income" ? "+" : "−"}₦{r.amount.toLocaleString("en-NG")}
            </span>
            <button onClick={() => handleDelete(r.id)} className="text-slate hover:text-red-500 justify-self-end">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TotalCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: any; tone: "green" | "neutral" | "amber" }) {
  const color = tone === "green" ? "text-green-light" : tone === "amber" ? "text-amber" : "text-paper";
  return (
    <div className="rounded-xl border border-line/[0.07] bg-ink-2 px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[10px] text-slate uppercase tracking-wide font-semibold mb-1.5">
        <Icon size={11} /> {label}
      </div>
      <div className={`font-mono text-[14px] font-semibold tabular ${color}`}>
        ₦{Math.abs(value).toLocaleString("en-NG")}
      </div>
    </div>
  );
}
