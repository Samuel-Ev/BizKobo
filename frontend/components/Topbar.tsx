"use client";

import { University } from "@/lib/api";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Topbar({
  userName,
  university,
}: {
  userName?: string;
  university?: University;
}) {
  const firstName = userName?.split(" ")[0] || "there";
  return (
    <div className="flex items-center justify-between mb-6 lg:mb-8">
      <div>
        <div className="text-[12px] text-slate font-medium mb-0.5">{getGreeting()}</div>
        <div className="font-display text-xl lg:text-2xl font-semibold text-paper">{firstName}</div>
      </div>
      <div className="flex items-center gap-2 bg-ink-3 border border-black/[0.07] rounded-full pl-2 pr-3 py-1.5">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-display font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${university?.brand_color || "#EFB63F"}, #8A6118)` }}
        >
          {university?.logo_initial || "U"}
        </div>
        <span className="text-[11px] font-semibold text-slate">{university?.slug?.toUpperCase() || "Campus"}</span>
      </div>
    </div>
  );
}
