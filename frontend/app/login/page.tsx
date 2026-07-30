"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wallet, Zap, TrendingUp, ArrowRight, GraduationCap } from "lucide-react";
import { api, setAuthToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@nbu.edu.ng");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      setAuthToken(res.data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Couldn't sign in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Illustration panel — desktop only, bold brand-green panel for contrast */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12"
        style={{ background: "linear-gradient(160deg, #1E6B45 0%, #163F2C 70%, #0F2318 100%)" }}
      >
        <div
          className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(239,182,63,0.28), transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -right-20 w-[380px] h-[380px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)" }}
        />

        <div className="relative z-10 max-w-sm">
          <div className="flex items-center gap-2.5 mb-10">
            <img src="/logo-mark.png" alt="BizKobo" className="w-9 h-9 rounded-xl object-contain bg-white p-1.5" />
            <span className="font-display font-semibold text-white text-lg">BizKobo</span>
          </div>

          <h1 className="font-display text-3xl font-semibold text-white leading-tight mb-4">
            Every kobo counts — bookkeeping, savings, and credit, built for how Nigeria actually trades.
          </h1>
          <p className="text-white/70 text-[15px] leading-relaxed mb-9">
            From NBU's campus wallet to market stalls and side hustles — track spending, build your
            Trust Score, and get emergency micro-credit when you need it — backed by Zenith Bank.
          </p>

          <div className="space-y-3">
            {[
              { icon: Wallet, text: "Instant transfers between students" },
              { icon: TrendingUp, text: "Trust Score built from real habits" },
              { icon: Zap, text: "Urgent 2K — emergency funds in seconds" },
            ].map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.12] flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-copper-light" />
                </div>
                <span className="text-[13.5px] text-white">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center bg-ink px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <img src="/logo-mark.png" alt="BizKobo" className="w-9 h-9 rounded-xl object-contain bg-paper p-1.5" />
            <span className="font-display font-semibold text-paper text-lg">BizKobo</span>
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <GraduationCap size={16} className="text-copper-light" />
            <span className="text-[11px] font-semibold text-copper-light uppercase tracking-wide">NBU Campus</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-paper mb-1">Welcome back</h2>
          <p className="text-slate text-sm mb-7">Sign in to your BizKobo wallet.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[12.5px] font-medium text-slate mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-ink-2 border border-black/[0.09] rounded-xl px-4 py-3 text-[14px] text-paper placeholder-slate focus:outline-none focus:border-copper-light/60 transition-colors"
                placeholder="you@nbu.edu.ng"
              />
            </div>
            <div>
              <label className="text-[12.5px] font-medium text-slate mb-1.5 block">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ink-2 border border-black/[0.09] rounded-xl px-4 py-3 text-[14px] text-paper placeholder-slate focus:outline-none focus:border-copper-light/60 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-[12.5px] text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-copper hover:brightness-110 disabled:opacity-60 text-white font-semibold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all mt-2"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-[11.5px] text-slate mt-6 text-center">
            Demo account pre-filled — just hit Sign in.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
