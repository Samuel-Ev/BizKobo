"use client";

import Link from "next/link";
import { ShieldCheck, ChevronRight } from "lucide-react";
import Topbar from "@/components/Topbar";
import { useDashboard } from "@/components/DashboardDataProvider";

export default function ProfilePage() {
  const { user, trust } = useDashboard();
  if (!user || !trust) return null;

  return (
    <>
      <Topbar userName={user.full_name} university={user.university} />
      <div className="max-w-xl">
        <div className="rounded-xl2 border border-line/[0.07] bg-ink-2 p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-ink-3 flex items-center justify-center text-base font-semibold text-paper">
              {user.full_name.charAt(0)}
            </div>
            <div>
              <div className="font-display font-semibold text-paper">{user.full_name}</div>
              <div className="text-[12.5px] text-slate">{user.email}</div>
            </div>
          </div>
          <div className="space-y-3 text-[13px]">
            <Row label="Student ID" value={user.student_id || "—"} />
            <Row label="University" value={user.university.name} />
            <Row label="Member tier" value={`${trust.tier} · Trust Score ${trust.score}`} />
          </div>
        </div>

        <Link
          href="/dashboard/parent-control"
          className="group flex items-center gap-3.5 rounded-xl2 border border-line/[0.07] bg-ink-2 p-4 mt-4 hover:border-copper-light/40 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-green/10 text-green-light flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[13.5px] font-semibold text-paper">Parent / Guardian Control</span>
              <ChevronRight size={14} className="text-slate group-hover:text-copper-light group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11.5px] text-slate mt-0.5">Manage what a parent or guardian can see.</p>
          </div>
        </Link>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-line/[0.06] last:border-0">
      <span className="text-slate">{label}</span>
      <span className="text-paper font-medium">{value}</span>
    </div>
  );
}
