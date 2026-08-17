"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Copy, Check, ExternalLink, RefreshCw, AlertTriangle,
  Bell, Eye, Wallet as WalletIcon,
} from "lucide-react";
import Topbar from "@/components/Topbar";
import { api, ParentLink } from "@/lib/api";
import { useDashboard } from "@/components/DashboardDataProvider";

export default function ParentControlPage() {
  const { user, transactions } = useDashboard();
  const [link, setLink] = useState<ParentLink | null>(null);
  const [ready, setReady] = useState(false);
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regenConfirm, setRegenConfirm] = useState(false);
  const [alertsOn, setAlertsOn] = useState(true);

  useEffect(() => {
    api
      .get<ParentLink>("/parent/my-link")
      .then((res) => {
        setLink(res.data);
        setParentName(res.data.parent_name || "");
        setParentEmail(res.data.parent_email || "");
        setBudgetLimit(res.data.monthly_budget_limit?.toString() || "");
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const monthlySpend = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return transactions
      .filter((t) => t.amount < 0 && new Date(t.created_at).getTime() >= thirtyDaysAgo)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  const limit = link?.monthly_budget_limit || 0;
  const pct = limit > 0 ? Math.min(100, (monthlySpend / limit) * 100) : 0;
  const overBudget = limit > 0 && monthlySpend > limit;

  function shareUrl(token: string) {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/parent/${token}`;
  }

  function copyLink() {
    if (!link) return;
    navigator.clipboard.writeText(shareUrl(link.share_token));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post<ParentLink>("/parent/link", {
        parent_name: parentName || null,
        parent_email: parentEmail || null,
        monthly_budget_limit: budgetLimit ? parseFloat(budgetLimit) : null,
      });
      setLink(res.data);
    } finally {
      setSaving(false);
    }
  }

  async function handleRegenerate() {
    const res = await api.post<ParentLink>("/parent/regenerate-link");
    setLink(res.data);
    setRegenConfirm(false);
  }

  if (!user || !ready) return null;

  return (
    <div className="max-w-3xl">
      <Topbar userName={user.full_name} university={user.university} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4 mb-7"
      >
        <div className="w-12 h-12 rounded-2xl bg-green/10 text-green-light flex items-center justify-center shrink-0">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold text-paper">Parent / Guardian Control</h1>
          <p className="text-[13px] text-slate mt-1 max-w-lg leading-relaxed">
            Give a parent or guardian a private, read-only window into your spending — no separate
            login for them. They see your balance, budget status, and recent transactions through
            one link.
          </p>
        </div>
      </motion.div>

      {/* Status banner */}
      {link && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-6 text-[12.5px] font-medium text-green-light bg-green/10 border border-green/25 rounded-full px-3.5 py-1.5 w-fit"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-light" />
          Monitoring active{link.parent_name ? ` — shared with ${link.parent_name}` : ""}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Setup / edit form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl2 border border-line/[0.07] bg-ink-2 p-5"
        >
          <h3 className="font-display font-semibold text-paper text-[14px] mb-4">
            {link ? "Edit details" : "Set up monitoring"}
          </h3>
          <form onSubmit={handleSave} className="space-y-3">
            <Field label="Parent/guardian name">
              <input
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Mrs Ev."
                className={inputClass}
              />
            </Field>
            <Field label="Parent email (optional)">
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="parent@example.com"
                className={inputClass}
              />
            </Field>
            <Field label="Monthly budget limit (₦)">
              <input
                type="number"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                placeholder="20000"
                className={inputClass}
              />
            </Field>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-copper hover:brightness-110 disabled:opacity-60 text-white font-semibold text-sm rounded-xl py-3 mt-1"
            >
              {saving ? "Saving..." : link ? "Save changes" : "Generate link"}
            </button>
          </form>
        </motion.div>

        {/* Right column: link + budget preview + settings */}
        <div className="space-y-5">
          {link && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl2 border border-line/[0.07] bg-ink-2 p-5"
            >
              <h3 className="font-display font-semibold text-paper text-[14px] mb-3">Share link</h3>
              <div className="flex items-center gap-2 bg-ink-3 border border-line/[0.09] rounded-xl px-3.5 py-3 mb-3">
                <span className="text-[12px] text-slate truncate flex-1">{shareUrl(link.share_token)}</span>
                <button onClick={copyLink} className="shrink-0 text-copper-light">
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>
              <div className="flex gap-2">
                <a
                  href={shareUrl(link.share_token)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 border border-line/[0.09] text-paper text-[12.5px] font-semibold rounded-lg py-2.5"
                >
                  <Eye size={13} /> Preview as parent
                </a>
                <button
                  onClick={() => setRegenConfirm(true)}
                  className="flex items-center justify-center gap-1.5 border border-line/[0.09] text-slate hover:text-paper text-[12.5px] font-semibold rounded-lg px-3"
                >
                  <RefreshCw size={13} />
                </button>
              </div>

              <AnimatePresence>
                {regenConfirm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="bg-amber/10 border border-amber/25 rounded-xl p-3.5">
                      <div className="flex items-start gap-2 mb-2.5">
                        <AlertTriangle size={14} className="text-amber shrink-0 mt-0.5" />
                        <p className="text-[12px] text-paper leading-relaxed">
                          This invalidates the current link — anyone using the old one loses access
                          immediately.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleRegenerate}
                          className="flex-1 bg-amber text-white text-[12px] font-semibold rounded-lg py-2"
                        >
                          Regenerate link
                        </button>
                        <button
                          onClick={() => setRegenConfirm(false)}
                          className="px-3 text-[12px] text-slate"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {link?.monthly_budget_limit ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl2 border border-line/[0.07] bg-ink-2 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-paper text-[14px] flex items-center gap-1.5">
                  <WalletIcon size={14} className="text-copper-light" /> This month
                </h3>
                {overBudget ? (
                  <span className="text-[11px] font-semibold text-amber">Over budget</span>
                ) : (
                  <span className="text-[11px] font-semibold text-green-light">On track</span>
                )}
              </div>
              <div className="h-2 rounded-full bg-line/[0.07] overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full ${overBudget ? "bg-amber" : "bg-green-light"}`}
                />
              </div>
              <div className="flex justify-between text-[11.5px] text-slate">
                <span>₦{monthlySpend.toLocaleString("en-NG")} spent</span>
                <span>of ₦{limit.toLocaleString("en-NG")} limit</span>
              </div>
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl2 border border-line/[0.07] bg-ink-2 p-5"
          >
            <h3 className="font-display font-semibold text-paper text-[14px] mb-3 flex items-center gap-1.5">
              <Bell size={14} className="text-copper-light" /> Notifications
            </h3>
            <button
              onClick={() => setAlertsOn((v) => !v)}
              className="w-full flex items-center justify-between"
            >
              <span className="text-[12.5px] text-slate">Alert on over-budget spending</span>
              <span
                className={`w-10 h-5.5 rounded-full p-0.5 flex transition-colors ${alertsOn ? "bg-green" : "bg-line/[0.15]"}`}
                style={{ height: 22 }}
              >
                <motion.span
                  animate={{ x: alertsOn ? 18 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-4.5 h-4.5 rounded-full bg-white shadow"
                  style={{ width: 18, height: 18 }}
                />
              </span>
            </button>
            <p className="text-[10.5px] text-slate mt-2">
              Demo setting — email/SMS delivery isn't wired up yet, this just previews the toggle.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full bg-ink-3 border border-line/[0.09] rounded-xl px-3.5 py-2.5 text-[13px] text-paper placeholder-slate focus:outline-none focus:border-copper-light/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11.5px] font-medium text-slate mb-1 block">{label}</label>
      {children}
    </div>
  );
}
