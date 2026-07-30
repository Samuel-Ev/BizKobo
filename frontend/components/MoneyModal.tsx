"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowUpRight, Plus, GraduationCap, CheckCircle2 } from "lucide-react";
import { api, Fee } from "@/lib/api";

type Mode = "send" | "fund" | "fees" | null;

const ICONS = { send: ArrowUpRight, fund: Plus, fees: GraduationCap };
const TITLES = { send: "Send money", fund: "Fund wallet", fees: "Pay Fees" };

export default function MoneyModal({
  mode,
  onClose,
  onSuccess,
}: {
  mode: Mode;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [fees, setFees] = useState<Fee[]>([]);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (mode === "fees") {
      api.get<Fee[]>("/fees").then((res) => setFees(res.data)).catch(() => {});
    }
    if (mode) {
      setRecipientEmail("");
      setAmount("");
      setNote("");
      setSelectedFee(null);
      setError(null);
      setDone(false);
    }
  }, [mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "send") {
        await api.post("/wallet/send", { recipient_email: recipientEmail, amount: parseFloat(amount), note });
      } else if (mode === "fund") {
        await api.post("/wallet/fund", { amount: parseFloat(amount), source: "Bank transfer" });
      } else if (mode === "fees") {
        if (!selectedFee) throw new Error("Pick a fee to pay");
        await api.post("/fees/pay", { fee_id: selectedFee.id });
      }
      setDone(true);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const Icon = mode ? ICONS[mode] : Plus;

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end lg:items-center lg:justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-full lg:max-w-md bg-ink-2 border border-black/[0.09] rounded-t-[28px] lg:rounded-[24px] p-6 pb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-black/[0.045] flex items-center justify-center">
                  <Icon size={15} className="text-copper-light" />
                </div>
                <h2 className="font-display text-lg font-semibold text-paper">{mode && TITLES[mode]}</h2>
              </div>
              <button onClick={onClose} className="text-slate hover:text-paper p-1">
                <X size={20} />
              </button>
            </div>

            {done ? (
              <div className="flex flex-col items-center text-center py-6">
                <CheckCircle2 size={40} className="text-green-light mb-3" />
                <p className="text-paper font-medium mb-1">Done!</p>
                <p className="text-[12.5px] text-slate mb-6">Your wallet has been updated.</p>
                <button
                  onClick={onClose}
                  className="w-full bg-copper hover:brightness-110 text-white font-semibold text-sm rounded-2xl py-3.5"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "send" && (
                  <>
                    <Field label="Recipient email">
                      <input
                        type="email"
                        required
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="friend@nbu.edu.ng"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Amount (₦)">
                      <input
                        type="number"
                        required
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="3000"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Note (optional)">
                      <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="What's this for?"
                        className={inputClass}
                      />
                    </Field>
                  </>
                )}

                {mode === "fund" && (
                  <Field label="Amount (₦)">
                    <input
                      type="number"
                      required
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="10000"
                      className={inputClass}
                      autoFocus
                    />
                    <p className="text-[11px] text-slate mt-2 leading-relaxed">
                      Simulates a bank transfer landing in your wallet — in production this fires only
                      after Zenith confirms the real inbound transfer.
                    </p>
                  </Field>
                )}

                {mode === "fees" && (
                  <div className="space-y-2">
                    {fees.length === 0 && <p className="text-[13px] text-slate">Loading fees...</p>}
                    {fees.map((fee) => (
                      <button
                        type="button"
                        key={fee.id}
                        onClick={() => setSelectedFee(fee)}
                        className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                          selectedFee?.id === fee.id
                            ? "border-copper-light/60 bg-copper/10"
                            : "border-black/[0.09] bg-ink-3"
                        }`}
                      >
                        <div>
                          <div className="text-[13.5px] font-medium text-paper">{fee.name}</div>
                          <div className="text-[11px] text-slate capitalize">{fee.category}</div>
                        </div>
                        <div className="font-mono text-[13.5px] font-semibold text-paper">
                          ₦{fee.amount.toLocaleString("en-NG")}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="text-[12.5px] text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-copper hover:brightness-110 disabled:opacity-60 text-white font-semibold text-sm rounded-2xl py-3.5 mt-2"
                >
                  {loading ? "Processing..." : mode === "send" ? "Send" : mode === "fund" ? "Fund wallet" : "Pay fee"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const inputClass =
  "w-full bg-ink-3 border border-black/[0.09] rounded-xl px-4 py-3 text-[14px] text-paper placeholder-slate focus:outline-none focus:border-copper-light/60 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[12.5px] font-medium text-slate mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
