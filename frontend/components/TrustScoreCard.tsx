"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { TrustScore } from "@/lib/api";

const TIER_TO_COINS: Record<string, number> = {
  Starter: 1,
  Bronze: 2,
  Silver: 3,
  Gold: 5,
};

export default function TrustScoreCard({ data }: { data: TrustScore }) {
  const filledCoins = TIER_TO_COINS[data.tier] || 3;
  const nextTierGap =
    data.tier === "Gold" ? 0 : Math.max(0, [500, 650, 780][["Starter", "Bronze", "Silver"].indexOf(data.tier)] - data.score);

  return (
    <div className="rounded-xl2 border border-line/[0.07] bg-ink-2 p-4.5 lg:p-5 mb-7 flex items-center gap-5">
      <div className="relative w-14 h-[74px] shrink-0">
        {[0, 1, 2, 3, 4].map((i) => {
          const bottom = i * 11;
          const filled = i < filledCoins;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8, scale: 0.85 }}
              animate={{ opacity: filled ? 1 : 0.22, y: 0, scale: 1 }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
              className="absolute left-0 w-14 h-4 rounded-full flex items-center justify-center text-[9px] font-display font-bold text-white/60"
              style={{
                bottom,
                background: filled
                  ? "linear-gradient(180deg, #EFB63F, #D9A230 55%, #8A6118 100%)"
                  : "linear-gradient(180deg, #3A3F4C, #2A2E38)",
                boxShadow: "0 2px 3px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.3)",
                filter: filled ? "none" : "grayscale(0.5)",
              }}
            >
              ₦
            </motion.div>
          );
        })}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 mb-0.5">
          <span className="font-mono text-xl font-semibold text-paper tabular">{data.score}</span>
          <span className="text-xs text-slate">/ {data.max_score} · {data.tier} tier</span>
        </div>
        <div className="flex items-center gap-1 text-[11.5px] font-semibold text-green-light mb-2">
          <TrendingUp size={12} strokeWidth={2.5} />
          {data.points_this_month > 0 ? `+${data.points_this_month} pts this month` : "Steady this month"}
        </div>
        <p className="text-[11.5px] text-slate leading-snug">
          {nextTierGap > 0
            ? `${nextTierGap} pts to the next tier — higher limits, faster approvals.`
            : "You're at the top tier — maximum Urgent 2K limit unlocked."}
        </p>
      </div>
    </div>
  );
}
