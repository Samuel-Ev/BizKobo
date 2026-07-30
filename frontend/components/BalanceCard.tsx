"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function BalanceCard({
  balance,
  trustScore,
  urgentLimit,
}: {
  balance: number;
  trustScore: number;
  urgentLimit: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.9, 0.25, 1] }}
      className="relative overflow-hidden rounded-xl2 p-5 lg:p-6 mb-5 shadow-lg shadow-green/10"
      style={{
        background: "linear-gradient(150deg, #1E6B45 0%, #163F2C 75%, #123018 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute -top-16 -right-16 w-52 h-52 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(239,182,63,0.28), transparent 70%)" }}
      />
      <div className="text-[12px] text-white/60 font-medium mb-2 relative">Wallet balance</div>
      <div className="font-mono font-semibold text-white text-3xl lg:text-4xl tabular relative">
        <span className="text-white/50 text-xl lg:text-2xl mr-1">₦</span>
        {balance.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      <div className="flex gap-3 mt-5 relative">
        <div className="flex-1 bg-white/[0.08] border border-white/[0.12] rounded-2xl px-3.5 py-2.5">
          <div className="text-[10px] text-white/55 uppercase tracking-wide font-semibold mb-1">Trust Score</div>
          <div className="font-mono text-sm font-semibold text-copper-light">{trustScore} / 850</div>
        </div>
        <div className="flex-1 bg-white/[0.08] border border-white/[0.12] rounded-2xl px-3.5 py-2.5">
          <div className="text-[10px] text-white/55 uppercase tracking-wide font-semibold mb-1 flex items-center gap-1">
            <Zap size={10} className="text-copper-light" /> Urgent limit
          </div>
          <div className="font-mono text-sm font-semibold text-white">
            ₦{urgentLimit.toLocaleString("en-NG")}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
