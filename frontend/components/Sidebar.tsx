"use client";

import { Home, Briefcase, Users, User, LogOut } from "lucide-react";
import { University } from "@/lib/api";

const NAV = [
  { key: "home", label: "Home", icon: Home },
  { key: "business", label: "Business", icon: Briefcase },
  { key: "savings", label: "Savings", icon: Users },
  { key: "profile", label: "Profile", icon: User },
];

export default function Sidebar({
  active,
  onNavigate,
  university,
  userName,
  onLogout,
}: {
  active: string;
  onNavigate: (key: string) => void;
  university?: University;
  userName?: string;
  onLogout: () => void;
}) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-black/[0.07] bg-ink px-5 py-6">
      <div className="flex items-center gap-3 mb-10 px-1">
        <img src="/logo-mark.png" alt="BizKobo" className="w-9 h-9 rounded-xl object-contain bg-paper p-1.5" />
        <div>
          <div className="font-display font-semibold text-paper text-[15px] leading-tight">BizKobo</div>
          <div className="text-[11px] text-slate leading-tight">{university?.name || "Every kobo counts."}</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-black/[0.04] text-paper"
                  : "text-slate hover:text-paper hover:bg-black/[0.02]"
              }`}
            >
              <Icon
                size={18}
                strokeWidth={2}
                className={isActive ? "text-copper-light" : "text-slate group-hover:text-paper"}
              />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-black/[0.07] pt-4 mt-4">
        <div className="flex items-center gap-3 px-1 mb-3">
          <div className="w-8 h-8 rounded-full bg-ink-3 flex items-center justify-center text-xs font-semibold text-paper">
            {userName?.charAt(0) || "S"}
          </div>
          <div className="text-[13px] text-paper font-medium truncate">{userName || "Student"}</div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate hover:text-paper hover:bg-black/[0.02] w-full transition-colors"
        >
          <LogOut size={18} strokeWidth={2} />
          Log out
        </button>
      </div>
    </aside>
  );
}
