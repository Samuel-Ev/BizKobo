"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Plus, GraduationCap, Zap } from "lucide-react";

const ACTIONS = [
  { key: "send", label: "Send", icon: ArrowUpRight, tone: "neutral" },
  { key: "fund", label: "Fund", icon: Plus, tone: "green" },
  { key: "fees", label: "Pay Fees", icon: GraduationCap, tone: "neutral" },
  { key: "urgent", label: "Urgent 2K", icon: Zap, tone: "amber" },
] as const;

const TONE_STYLES: Record<string, string> = {
  neutral: "bg-line/[0.04]",
  green: "bg-green/20",
  amber: "bg-amber/20",
};

export default function QuickActions({ onAction }: { onAction: (key: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2.5 mb-7">
      {ACTIONS.map(({ key, label, icon: Icon, tone }, i) => (
        <motion.button
          key={key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.05 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onAction(key)}
          className={`flex flex-col items-center gap-2 rounded-2xl border py-3.5 px-1.5 ${
            key === "urgent"
              ? "border-amber/35 bg-gradient-to-b from-amber/[0.14] to-amber/[0.02]"
              : "border-line/[0.07] bg-ink-2"
          }`}
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${TONE_STYLES[tone]}`}>
            <Icon size={17} strokeWidth={2} className="text-paper" />
          </div>
          <span className="text-[10.5px] font-medium text-paper text-center leading-tight">{label}</span>
        </motion.button>
      ))}
    </div>
  );
}
