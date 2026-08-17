"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Lock, CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import Topbar from "@/components/Topbar";
import { api } from "@/lib/api";
import { useDashboard } from "@/components/DashboardDataProvider";

const PRICE = 500;

const COURSES = [
  {
    subject: "Introduction to Software Engineering",
    questions: [
      { q: "Define the software development life cycle (SDLC) and list its stages.", a: "SDLC is the structured process teams follow to plan, build, test, and maintain software. Stages: requirements gathering, design, implementation, testing, deployment, maintenance." },
      { q: "Explain the difference between Waterfall and Agile methodologies.", a: "Waterfall is linear and sequential — each phase completes before the next starts. Agile is iterative, delivering working software in short cycles (sprints) with continuous feedback." },
    ],
  },
  {
    subject: "Data Structures & Algorithms",
    questions: [
      { q: "What is the time complexity of binary search, and why?", a: "O(log n) — each comparison halves the search space, so the number of steps grows logarithmically with input size." },
      { q: "Differentiate between a stack and a queue.", a: "A stack is LIFO (Last In, First Out) — think a pile of plates. A queue is FIFO (First In, First Out) — think a checkout line." },
    ],
  },
  {
    subject: "Financial Accounting I",
    questions: [
      { q: "State the accounting equation.", a: "Assets = Liabilities + Owner's Equity. Every transaction keeps this equation balanced." },
      { q: "Distinguish between capital and revenue expenditure.", a: "Capital expenditure buys long-term assets (e.g. equipment). Revenue expenditure covers day-to-day running costs (e.g. rent, wages)." },
    ],
  },
];

export default function PastQuestionsPage() {
  const { user, wallet, reload } = useDashboard();
  const [active, setActive] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSubject, setOpenSubject] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/subscriptions/status", { params: { product: "past_questions" } })
      .then((res) => {
        setActive(res.data.active);
        setExpiresAt(res.data.expires_at);
      })
      .finally(() => setReady(true));
  }, []);

  async function handleSubscribe() {
    setError(null);
    setSubscribing(true);
    try {
      const res = await api.post("/subscriptions/subscribe", { product: "past_questions", amount: PRICE });
      setActive(res.data.active);
      setExpiresAt(res.data.expires_at);
      reload();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Couldn't process subscription.");
    } finally {
      setSubscribing(false);
    }
  }

  if (!user || !ready) return null;

  return (
    <div className="max-w-2xl">
      <Topbar userName={user.full_name} university={user.university} />

      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-green/10 text-green-light flex items-center justify-center shrink-0">
          <BookOpen size={22} />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold text-paper">Past Questions</h1>
          <p className="text-[13px] text-slate mt-1 max-w-lg leading-relaxed">
            Practice with real past exam questions and worked answers, organized by course.
          </p>
        </div>
      </div>

      {!active ? (
        <div className="rounded-xl2 border border-copper/25 bg-copper/[0.06] p-6 text-center">
          <Lock size={22} className="text-copper-light mx-auto mb-3" />
          <h3 className="font-display font-semibold text-paper mb-1.5">Unlock full access</h3>
          <p className="text-[13px] text-slate max-w-sm mx-auto mb-5 leading-relaxed">
            ₦{PRICE.toLocaleString("en-NG")}/month for unlimited past questions across every course.
            Paid straight from your BizKobo wallet — no card needed.
          </p>
          {error && <p className="text-[12px] text-red-600 dark:text-red-400 mb-3">{error}</p>}
          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="bg-copper hover:brightness-110 disabled:opacity-60 text-white font-semibold text-sm rounded-xl px-6 py-3 inline-flex items-center gap-2"
          >
            {subscribing && <Loader2 size={15} className="animate-spin" />}
            {subscribing ? "Processing..." : `Subscribe — ₦${PRICE.toLocaleString("en-NG")}/month`}
          </button>
          <p className="text-[11px] text-slate mt-3">
            Wallet balance: ₦{wallet?.balance.toLocaleString("en-NG") || 0}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-5 text-[12.5px] font-medium text-green-light bg-green/10 border border-green/25 rounded-full px-3.5 py-1.5 w-fit">
            <CheckCircle2 size={13} />
            Premium active
            {expiresAt && ` · renews ${new Date(expiresAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}`}
          </div>

          <div className="space-y-3">
            {COURSES.map(({ subject, questions }) => {
              const isOpen = openSubject === subject;
              return (
                <div key={subject} className="rounded-xl2 border border-line/[0.07] bg-ink-2 overflow-hidden">
                  <button
                    onClick={() => setOpenSubject(isOpen ? null : subject)}
                    className="w-full flex items-center justify-between px-4 py-3.5"
                  >
                    <span className="text-[13.5px] font-semibold text-paper text-left">{subject}</span>
                    <ChevronDown size={16} className={`text-slate transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3 border-t border-line/[0.06] pt-3">
                          {questions.map((item, i) => (
                            <div key={i} className="text-[12.5px]">
                              <p className="font-medium text-paper mb-1">Q{i + 1}. {item.q}</p>
                              <p className="text-slate leading-relaxed">{item.a}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
