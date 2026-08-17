"use client";

import { useEffect, useState } from "react";
import { Users2, Copy, Check } from "lucide-react";
import { api, ParentLink } from "@/lib/api";

export default function ParentLinkCard() {
  const [link, setLink] = useState<ParentLink | null>(null);
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api
      .get<ParentLink>("/parent/my-link")
      .then((res) => setLink(res.data))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const res = await api.post<ParentLink>("/parent/link", {
      parent_name: parentName || null,
      parent_email: parentEmail || null,
      monthly_budget_limit: budgetLimit ? parseFloat(budgetLimit) : null,
    });
    setLink(res.data);
  }

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

  if (!ready) return null;

  return (
    <div className="rounded-xl2 border border-line/[0.07] bg-ink-2 p-5 mt-4">
      <div className="flex items-center gap-2 mb-1">
        <Users2 size={16} className="text-copper-light" />
        <h3 className="font-display font-semibold text-paper text-[14px]">Parent monitoring</h3>
      </div>
      <p className="text-[12px] text-slate mb-4 leading-relaxed">
        Give a parent or guardian a read-only link to see your balance, recent spending, and
        whether you're within budget — no separate login needed for them.
      </p>

      {link ? (
        <div>
          <div className="flex items-center gap-2 bg-ink-3 border border-line/[0.09] rounded-xl px-3.5 py-3 mb-2">
            <span className="text-[12px] text-slate truncate flex-1">{shareUrl(link.share_token)}</span>
            <button onClick={copyLink} className="shrink-0 text-copper-light">
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
          <p className="text-[11px] text-slate">
            Anyone with this link can view your spending — share it privately, only with your
            parent/guardian.
          </p>
        </div>
      ) : (
        <form onSubmit={handleGenerate} className="space-y-2.5">
          <input
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="Parent/guardian name (optional)"
            className="w-full bg-ink-3 border border-line/[0.09] rounded-xl px-3.5 py-2.5 text-[13px] text-paper placeholder-slate focus:outline-none focus:border-copper-light/60"
          />
          <input
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            placeholder="Parent email (optional)"
            className="w-full bg-ink-3 border border-line/[0.09] rounded-xl px-3.5 py-2.5 text-[13px] text-paper placeholder-slate focus:outline-none focus:border-copper-light/60"
          />
          <input
            type="number"
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(e.target.value)}
            placeholder="Monthly budget limit, ₦ (optional)"
            className="w-full bg-ink-3 border border-line/[0.09] rounded-xl px-3.5 py-2.5 text-[13px] text-paper placeholder-slate focus:outline-none focus:border-copper-light/60"
          />
          <button type="submit" className="w-full bg-copper hover:brightness-110 text-white font-semibold text-sm rounded-xl py-3">
            Generate link
          </button>
        </form>
      )}
    </div>
  );
}
