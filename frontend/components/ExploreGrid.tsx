"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, GraduationCap, BookOpen, Table2, Bot, ChevronRight } from "lucide-react";

const ITEMS = [
  {
    href: "/dashboard/parent-control",
    icon: ShieldCheck,
    title: "Parent/Guardian Control",
    blurb: "Share a read-only view of spending with a parent or guardian.",
    tone: "green",
  },
  {
    href: "/dashboard/results",
    icon: GraduationCap,
    title: "WAEC / JAMB Results",
    blurb: "Check a sample result, or jump to the official portals.",
    tone: "copper",
  },
  {
    href: "/dashboard/past-questions",
    icon: BookOpen,
    title: "Past Questions",
    blurb: "Practice with past exam questions — subscription unlocks full access.",
    tone: "green",
  },
  {
    href: "/dashboard/spreadsheet",
    icon: Table2,
    title: "Spreadsheet & Records",
    blurb: "Log income and expenses in a familiar spreadsheet view.",
    tone: "copper",
  },
  {
    href: "/dashboard/support",
    icon: Bot,
    title: "AI Support",
    blurb: "Ask BizKobo's assistant about your account or the app.",
    tone: "green",
  },
];

const TONE_BG: Record<string, string> = {
  green: "bg-green/10 text-green-light",
  copper: "bg-copper/15 text-copper-light",
};

export default function ExploreGrid() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-[15px] font-semibold text-paper">Explore more</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ITEMS.map(({ href, icon: Icon, title, blurb, tone }, i) => (
          <motion.div
            key={href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <Link
              href={href}
              className="group flex items-start gap-3.5 rounded-xl2 border border-line/[0.07] bg-ink-2 p-4 hover:border-copper-light/40 transition-colors h-full"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TONE_BG[tone]}`}>
                <Icon size={18} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[13.5px] font-semibold text-paper">{title}</span>
                  <ChevronRight size={14} className="text-slate group-hover:text-copper-light group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                <p className="text-[11.5px] text-slate mt-0.5 leading-snug">{blurb}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
