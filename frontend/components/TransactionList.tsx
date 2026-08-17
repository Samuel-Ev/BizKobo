"use client";

import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowUpRight,
  ArrowDownLeft,
  GraduationCap,
  UtensilsCrossed,
  Zap,
  Landmark,
  Receipt,
  BookOpen,
} from "lucide-react";
import { Transaction } from "@/lib/api";

const ICONS: Record<string, any> = {
  fund: ArrowDownToLine,
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  fee_payment: GraduationCap,
  vendor_payment: UtensilsCrossed,
  loan_disbursement: Zap,
  loan_repayment: Landmark,
  subscription_payment: BookOpen,
};

const TONE: Record<string, string> = {
  fund: "bg-green/20 text-green-light",
  receive: "bg-green/20 text-green-light",
  send: "bg-line/[0.045] text-paper",
  fee_payment: "bg-line/[0.045] text-paper",
  vendor_payment: "bg-line/[0.045] text-paper",
  loan_disbursement: "bg-amber/20 text-amber",
  loan_repayment: "bg-amber/20 text-amber",
  subscription_payment: "bg-copper/20 text-copper-light",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const time = d.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });
  if (isToday) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });
}

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 rounded-xl2 border border-dashed border-line/[0.09]">
        <Receipt size={24} className="text-slate mb-2" />
        <p className="text-sm text-slate">No transactions yet — fund your wallet to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl2 border border-line/[0.07] bg-ink-2 divide-y divide-line/[0.07] overflow-hidden">
      {transactions.map((t, i) => {
        const Icon = ICONS[t.type] || Receipt;
        const isPositive = t.amount > 0;
        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
            className="flex items-center gap-3 px-4 py-3"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TONE[t.type] || "bg-line/[0.045] text-paper"}`}>
              <Icon size={15} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-paper truncate">
                {t.counterparty || t.note || t.type.replace("_", " ")}
              </div>
              <div className="text-[11px] text-slate mt-0.5">{formatDate(t.created_at)}</div>
            </div>
            <div className={`font-mono text-[13px] font-semibold tabular ${isPositive ? "text-green-light" : "text-paper"}`}>
              {isPositive ? "+" : "−"}₦{Math.abs(t.amount).toLocaleString("en-NG")}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
