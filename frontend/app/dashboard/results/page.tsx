"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Search, Loader2, CheckCircle2, ExternalLink, Info,
} from "lucide-react";
import Topbar from "@/components/Topbar";
import { useDashboard } from "@/components/DashboardDataProvider";

type ExamType = "waec" | "jamb";

const WAEC_SUBJECTS = [
  ["English Language", "B2"], ["Mathematics", "A1"], ["Civic Education", "B3"],
  ["Physics", "B2"], ["Chemistry", "A1"], ["Biology", "B2"], ["Further Mathematics", "C4"],
];

function generateJambScore(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 1000;
  return 180 + (hash % 121); // 180-300 range
}

export default function ResultsPage() {
  const { user } = useDashboard();
  const [examType, setExamType] = useState<ExamType>("waec");
  const [regNumber, setRegNumber] = useState("");
  const [pin, setPin] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ type: ExamType; regNumber: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!regNumber.trim() || !pin.trim()) {
      setError("Enter both your registration number and PIN.");
      return;
    }
    setError(null);
    setChecking(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1400));
    setChecking(false);
    setResult({ type: examType, regNumber });
  }

  if (!user) return null;

  const jambScore = result ? generateJambScore(result.regNumber) : 0;

  return (
    <div className="max-w-2xl">
      <Topbar userName={user.full_name} university={user.university} />

      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-copper/15 text-copper-light flex items-center justify-center shrink-0">
          <GraduationCap size={22} />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold text-paper">WAEC / JAMB Results</h1>
          <p className="text-[13px] text-slate mt-1 max-w-lg leading-relaxed">
            Check a sample result below, or jump straight to the official portals.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 bg-copper/[0.08] border border-copper/25 rounded-xl p-3.5 mb-6">
        <Info size={15} className="text-copper-light shrink-0 mt-0.5" />
        <p className="text-[11.5px] text-paper leading-relaxed">
          Real results only come from WAEC's and JAMB's own scratch-card PIN systems — BizKobo has
          no access to their databases. What's below is a <strong>demo checker</strong> with sample
          data, so you can see how it would feel. Use the links to check your real result.
        </p>
      </div>

      <div className="flex gap-2 mb-5">
        <a
          href="https://www.waecdirect.org"
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 border border-line/[0.09] bg-ink-2 text-paper text-[12.5px] font-semibold rounded-xl py-3"
        >
          Official WAEC portal <ExternalLink size={13} />
        </a>
        <a
          href="https://www.jamb.gov.ng"
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 border border-line/[0.09] bg-ink-2 text-paper text-[12.5px] font-semibold rounded-xl py-3"
        >
          Official JAMB portal <ExternalLink size={13} />
        </a>
      </div>

      <div className="rounded-xl2 border border-line/[0.07] bg-ink-2 p-5">
        <div className="flex gap-2 mb-4">
          {(["waec", "jamb"] as ExamType[]).map((t) => (
            <button
              key={t}
              onClick={() => { setExamType(t); setResult(null); }}
              className={`px-4 py-2 rounded-full text-[12.5px] font-semibold border ${
                examType === t ? "bg-copper/15 border-copper-light/50 text-paper" : "border-line/[0.09] text-slate"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleCheck} className="space-y-3">
          <div>
            <label className="text-[11.5px] font-medium text-slate mb-1 block">
              {examType === "waec" ? "Examination number" : "JAMB registration number"}
            </label>
            <input
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder={examType === "waec" ? "e.g. 4251112034" : "e.g. 202410023456AB"}
              className="w-full bg-ink-3 border border-line/[0.09] rounded-xl px-3.5 py-2.5 text-[13px] text-paper placeholder-slate focus:outline-none focus:border-copper-light/60"
            />
          </div>
          <div>
            <label className="text-[11.5px] font-medium text-slate mb-1 block">Scratch card PIN</label>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="XXXXXXXXXXXX"
              className="w-full bg-ink-3 border border-line/[0.09] rounded-xl px-3.5 py-2.5 text-[13px] text-paper placeholder-slate focus:outline-none focus:border-copper-light/60"
            />
          </div>

          {error && <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={checking}
            className="w-full bg-copper hover:brightness-110 disabled:opacity-60 text-white font-semibold text-sm rounded-xl py-3 flex items-center justify-center gap-2"
          >
            {checking ? <Loader2 size={16} className="animate-spin" /> : <Search size={15} />}
            {checking ? "Checking..." : "Check result (demo)"}
          </button>
        </form>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-xl border border-green/25 bg-green/[0.06] p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={15} className="text-green-light" />
                <span className="text-[12.5px] font-semibold text-paper">
                  Sample {result.type.toUpperCase()} result — {result.regNumber}
                </span>
              </div>

              {result.type === "waec" ? (
                <div className="divide-y divide-line/[0.06]">
                  {WAEC_SUBJECTS.map(([subject, grade]) => (
                    <div key={subject} className="flex items-center justify-between py-1.5 text-[12.5px]">
                      <span className="text-slate">{subject}</span>
                      <span className="font-mono font-semibold text-paper">{grade}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3">
                  <div className="font-mono text-4xl font-semibold text-paper tabular">{jambScore}</div>
                  <div className="text-[11.5px] text-slate mt-1">out of 400</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
