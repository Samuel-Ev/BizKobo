"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, GraduationCap } from "lucide-react";
import { api } from "@/lib/api";

interface ParentView {
  student_name: string;
  university_name: string;
  wallet_balance: number;
  monthly_budget_limit: number | null;
  monthly_spend_so_far: number;
  over_budget: boolean;
  recent_transactions: {
    id: string;
    type: string;
    amount: number;
    counterparty: string | null;
    note: string | null;
    created_at: string;
  }[];
}

export default function ParentViewPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<ParentView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ParentView>(`/parent/view/${token}`)
      .then((res) => setData(res.data))
      .catch(() => setError("This link is invalid or has expired."));
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-6">
        <p className="text-slate text-sm">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-copper-light to-copper-dark animate-pulse" />
      </div>
    );
  }

  const budgetPct = data.monthly_budget_limit
    ? Math.min(100, (data.monthly_spend_so_far / data.monthly_budget_limit) * 100)
    : null;

  return (
    <div className="min-h-screen bg-ink px-5 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap size={15} className="text-copper-light" />
          <span className="text-[11px] font-semibold text-copper-light uppercase tracking-wide">
            {data.university_name}
          </span>
        </div>
        <h1 className="font-display text-xl font-semibold text-paper mb-1">{data.student_name}</h1>
        <p className="text-slate text-[13px] mb-6">Read-only parent view — spending summary</p>

        <div className="rounded-xl2 border border-line/[0.08] bg-ink-2 p-5 mb-5">
          <div className="text-[12px] text-slate mb-1.5">Current wallet balance</div>
          <div className="font-mono text-3xl font-semibold text-paper tabular">
            ₦{data.wallet_balance.toLocaleString("en-NG")}
          </div>
        </div>

        {data.monthly_budget_limit && (
          <div className="rounded-xl2 border border-line/[0.07] bg-ink-2 p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12.5px] font-semibold text-paper">This month's spending</span>
              {data.over_budget ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber">
                  <AlertTriangle size={12} /> Over budget
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-green-light">
                  <CheckCircle2 size={12} /> Within budget
                </span>
              )}
            </div>
            <div className="h-2 rounded-full bg-line/[0.04] overflow-hidden mb-2">
              <div
                className={`h-full rounded-full ${data.over_budget ? "bg-amber" : "bg-green"}`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11.5px] text-slate">
              <span>₦{data.monthly_spend_so_far.toLocaleString("en-NG")} spent</span>
              <span>of ₦{data.monthly_budget_limit.toLocaleString("en-NG")} limit</span>
            </div>
          </div>
        )}

        <div className="text-[13px] font-semibold text-paper mb-3">Recent transactions</div>
        <div className="rounded-xl2 border border-line/[0.07] bg-ink-2 divide-y divide-line/[0.07] overflow-hidden">
          {data.recent_transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-[13px] text-paper font-medium">{t.counterparty || t.note || t.type}</div>
                <div className="text-[11px] text-slate mt-0.5">
                  {new Date(t.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                </div>
              </div>
              <div className={`font-mono text-[13px] font-semibold ${t.amount > 0 ? "text-green-light" : "text-paper"}`}>
                {t.amount > 0 ? "+" : "−"}₦{Math.abs(t.amount).toLocaleString("en-NG")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
