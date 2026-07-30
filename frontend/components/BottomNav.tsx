"use client";

import { Home, Briefcase, Users, User } from "lucide-react";
import { motion } from "framer-motion";

const NAV = [
  { key: "home", label: "Home", icon: Home },
  { key: "business", label: "Business", icon: Briefcase },
  { key: "savings", label: "Savings", icon: Users },
  { key: "profile", label: "Profile", icon: User },
];

export default function BottomNav({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate: (key: string) => void;
}) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-ink/95 backdrop-blur-xl border-t border-black/[0.07] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around px-2 pt-2 pb-2">
        {NAV.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className="relative flex flex-col items-center gap-1 px-4 py-1.5 min-w-[64px]"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomnav-active"
                  className="absolute -top-2 w-1 h-1 rounded-full bg-copper-light"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={2}
                className={isActive ? "text-copper-light" : "text-slate"}
              />
              <span className={`text-[10px] font-medium ${isActive ? "text-copper-light" : "text-slate"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
