"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, Circle, Landmark, Zap } from "lucide-react";
import { api, UrgentCheckResult } from "@/lib/api";

const STEPS = [
  "Reading spending consistency",
  "Checking savings streak",
  "Reviewing repayment history",
  "Sending recommendation to Zenith Bank",
];

export default function UrgentModal({
  open,
  onClose,
  onApproved,
}: {
  open: boolean;
  onClose: () => void;
  onApproved: (result: UrgentCheckResult) => void;
}) {
  const [stepIndex, setStepIndex] = useState(-1);
  const [result, setResult] = useState<UrgentCheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runCheck() {
    setChecking(true);
    setError(null);
    setResult(null);

    for (let i = 0; i < STEPS.length; i++) {
      setStepIndex(i);
      await new Promise((r) => setTimeout(r, 550));
    }

    try {
      const res = await api.post<UrgentCheckResult>("/urgent2k/check", null, {
        params: { requested_amount: 2000 },
      });
      setResult(res.data);
      if (res.data.eligible) onApproved(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Something went wrong. Try again.");
    } finally {
      setChecking(false);
    }
  }

  function handleClose() {
    setStepIndex(-1);
    setResult(null);
    setError(null);
    setChecking(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end lg:items-center lg:justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-full lg:max-w-md bg-ink-2 border border-black/[0.09] lg:border rounded-t-[28px] lg:rounded-[24px] p-6 pb-8"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber/20 flex items-center justify-center">
                  <Zap size={15} className="text-amber" />
                </div>
                <h2 className="font-display text-lg font-semibold text-paper">Urgent 2K</h2>
              </div>
              <button onClick={handleClose} className="text-slate hover:text-paper p-1">
                <X size={20} />
              </button>
            </div>
            <p className="text-[12.5px] text-slate mb-6 leading-relaxed">
              {result
                ? result.eligible
                  ? "You're eligible. Funds are on their way to your wallet."
                  : "Here's what we found."
                : "Small help, right when you need it. We'll check your eligibility instantly — no paperwork."}
            </p>

            {(checking || stepIndex >= 0) && !result && (
              <div className="mb-2">
                {STEPS.map((label, i) => {
                  const done = i < stepIndex || (!checking && i <= stepIndex);
                  const active = i === stepIndex && checking;
                  return (
                    <div
                      key={label}
                      className={`flex items-center gap-2.5 py-2 text-[13px] transition-opacity ${
                        done || active ? "opacity-100" : "opacity-35"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 size={17} className="text-green-light shrink-0" />
                      ) : (
                        <Circle
                          size={17}
                          className={`shrink-0 ${active ? "text-copper-light animate-pulse" : "text-slate-dark"}`}
                        />
                      )}
                      <span className={done || active ? "text-paper" : "text-slate"}>{label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-[12.5px] text-red-700 mb-2">
                {error}
              </div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-4 border ${
                  result.eligible
                    ? "bg-green/10 border-green/30"
                    : "bg-black/[0.03] border-black/[0.09]"
                }`}
              >
                {result.eligible ? (
                  <>
                    <div className="font-mono text-2xl font-semibold text-paper mb-1">
                      ₦{result.amount.toLocaleString("en-NG")} approved
                    </div>
                    <div className="text-[12px] font-semibold text-green-light mb-1">
                      Zenith Bank approved instantly
                    </div>
                    <div className="text-[11.5px] text-slate mb-3">
                      {result.due_date &&
                        `Repay by ${new Date(result.due_date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })} · auto-deducted from wallet on due date`}
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-[10.5px] text-slate bg-black/[0.03] border border-black/[0.07] rounded-full px-2.5 py-1">
                      <Landmark size={11} />
                      Funds held & disbursed by Zenith Bank
                    </div>
                  </>
                ) : (
                  <div className="text-[13px] text-paper leading-relaxed">{result.reason}</div>
                )}
              </motion.div>
            )}

            {!result && (
              <button
                onClick={runCheck}
                disabled={checking}
                className="w-full bg-copper hover:brightness-110 disabled:opacity-50 text-white font-semibold text-sm rounded-2xl py-3.5 mt-5 transition-all"
              >
                {checking ? "Checking..." : "Check eligibility"}
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-full border border-black/[0.09] text-paper font-medium text-sm rounded-2xl py-3.5 mt-2.5"
            >
              {result ? "Done" : "Not now"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
