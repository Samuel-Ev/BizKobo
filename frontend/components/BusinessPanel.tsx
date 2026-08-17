"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Plus, Mic, Send, TrendingUp, TrendingDown,
  CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import { api, Business, BizEntry, IncomeStatement, VoiceParseResult } from "@/lib/api";

export default function BusinessPanel() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [active, setActive] = useState<Business | null>(null);
  const [entries, setEntries] = useState<BizEntry[]>([]);
  const [statement, setStatement] = useState<IncomeStatement | null>(null);
  const [ready, setReady] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("food");

  const [inputText, setInputText] = useState("");
  const [preview, setPreview] = useState<VoiceParseResult | null>(null);
  const [parsing, setParsing] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const loadBusinesses = useCallback(async () => {
    const res = await api.get<Business[]>("/business");
    setBusinesses(res.data);
    if (res.data.length > 0) setActive((prev) => prev || res.data[0]);
    setReady(true);
  }, []);

  const loadBusinessData = useCallback(async (businessId: string) => {
    const [entriesRes, statementRes] = await Promise.all([
      api.get<BizEntry[]>(`/business/${businessId}/entries`),
      api.get<IncomeStatement>(`/business/${businessId}/income-statement`),
    ]);
    setEntries(entriesRes.data);
    setStatement(statementRes.data);
  }, []);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    if (active) loadBusinessData(active.id);
  }, [active, loadBusinessData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await api.post<Business>("/business", { name: newName, category: newCategory });
    setBusinesses((prev) => [res.data, ...prev]);
    setActive(res.data);
    setShowCreate(false);
    setNewName("");
  }

  async function handlePreview() {
    if (!inputText.trim()) return;
    setParsing(true);
    setPreview(null);
    try {
      const res = await api.post<VoiceParseResult>("/voice/parse", { text: inputText });
      setPreview(res.data);
    } finally {
      setParsing(false);
    }
  }

  async function handleConfirm() {
    if (!active || !preview?.understood) return;
    await api.post(`/voice/log`, { text: inputText, business_id: active.id });
    setInputText("");
    setPreview(null);
    loadBusinessData(active.id);
  }

  function startListening() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input isn't supported in this browser — try Chrome, or just type instead.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-NG";
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  if (!ready) {
    return <div className="h-40 flex items-center justify-center text-slate text-sm">Loading...</div>;
  }

  if (businesses.length === 0 && !showCreate) {
    return (
      <div className="flex flex-col items-center text-center py-16 px-6 rounded-xl2 border border-dashed border-line/[0.09]">
        <div className="w-11 h-11 rounded-2xl bg-line/[0.035] flex items-center justify-center mb-4">
          <Briefcase size={20} className="text-copper-light" />
        </div>
        <h3 className="font-display font-semibold text-paper mb-1.5">Run a business?</h3>
        <p className="text-[13px] text-slate max-w-xs leading-relaxed mb-5">
          Track sales and expenses for your campus stall, market shop, or side hustle —
          right from a sentence.
        </p>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-copper hover:brightness-110 text-white font-semibold text-sm rounded-xl px-5 py-3 flex items-center gap-2"
        >
          <Plus size={16} /> Add your business
        </button>
      </div>
    );
  }

  if (showCreate) {
    return (
      <form onSubmit={handleCreate} className="rounded-xl2 border border-line/[0.07] bg-ink-2 p-5 space-y-4">
        <h3 className="font-display font-semibold text-paper mb-1">Add your business</h3>
        <div>
          <label className="text-[12.5px] font-medium text-slate mb-1.5 block">Business name</label>
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Sammy Rice Corner"
            className="w-full bg-ink-3 border border-line/[0.09] rounded-xl px-4 py-3 text-[14px] text-paper placeholder-slate focus:outline-none focus:border-copper-light/60"
          />
        </div>
        <div>
          <label className="text-[12.5px] font-medium text-slate mb-1.5 block">Category</label>
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full bg-ink-3 border border-line/[0.09] rounded-xl px-4 py-3 text-[14px] text-paper focus:outline-none focus:border-copper-light/60"
          >
            <option value="food">Food & drinks</option>
            <option value="laundry">Laundry</option>
            <option value="print">Printing & design</option>
            <option value="fashion">Fashion & tailoring</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-copper hover:brightness-110 text-white font-semibold text-sm rounded-xl py-3">
            Create
          </button>
          <button type="button" onClick={() => setShowCreate(false)} className="px-4 border border-line/[0.09] text-paper rounded-xl text-sm">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div>
      {businesses.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {businesses.map((b) => (
            <button
              key={b.id}
              onClick={() => setActive(b)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-[12.5px] font-medium border ${
                active?.id === b.id ? "bg-copper/15 border-copper-light/50 text-paper" : "border-line/[0.09] text-slate"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {statement && (
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <StatCard label="Sales" value={statement.total_sales} tone="green" />
          <StatCard label="Expenses" value={statement.total_expenses} tone="neutral" />
          <StatCard label="Net profit" value={statement.net_profit} tone="amber" />
        </div>
      )}

      {/* Voice/text entry */}
      <div className="rounded-xl2 border border-line/[0.07] bg-ink-2 p-4 mb-5">
        <div className="text-[12px] font-semibold text-slate mb-2.5">Log a sale or expense</div>
        <div className="flex gap-2">
          <input
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); setPreview(null); }}
            placeholder="Say or type: 'I sold rice for 25000'"
            className="flex-1 bg-ink-3 border border-line/[0.09] rounded-xl px-3.5 py-2.5 text-[13.5px] text-paper placeholder-slate focus:outline-none focus:border-copper-light/60"
          />
          <button
            type="button"
            onClick={startListening}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              listening ? "bg-amber/25 text-amber animate-pulse" : "bg-line/[0.04] text-slate"
            }`}
            title="Voice input (English/Pidgin, browser-based)"
          >
            <Mic size={16} />
          </button>
          <button
            type="button"
            onClick={handlePreview}
            disabled={parsing || !inputText.trim()}
            className="w-10 h-10 rounded-xl bg-copper hover:brightness-110 disabled:opacity-50 flex items-center justify-center shrink-0"
          >
            {parsing ? <Loader2 size={16} className="text-white animate-spin" /> : <Send size={15} className="text-white" />}
          </button>
        </div>
        <p className="text-[10.5px] text-slate mt-2 leading-relaxed">
          Voice input works in English/Pidgin via your browser. Yoruba, Hausa, and Igbo need a
          dedicated speech API — not wired up yet.
        </p>

        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-3 rounded-xl p-3.5 border ${
                preview.understood ? "bg-green/10 border-green/30" : "bg-amber/10 border-amber/30"
              }`}
            >
              <div className="flex items-start gap-2">
                {preview.understood ? (
                  <CheckCircle2 size={16} className="text-green-light shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="text-amber shrink-0 mt-0.5" />
                )}
                <p className="text-[12.5px] text-paper leading-relaxed">{preview.message}</p>
              </div>
              {preview.understood && (
                <button
                  onClick={handleConfirm}
                  className="mt-3 w-full bg-copper hover:brightness-110 text-white text-[13px] font-semibold rounded-lg py-2.5"
                >
                  Confirm & log it
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-[13px] font-semibold text-paper mb-3">Recent entries</div>
      <div className="rounded-xl2 border border-line/[0.07] bg-ink-2 divide-y divide-line/[0.07] overflow-hidden">
        {entries.length === 0 && (
          <div className="text-center py-8 text-[12.5px] text-slate">No entries yet — log your first sale above.</div>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              entry.type === "sale" ? "bg-green/20 text-green-light" : "bg-line/[0.045] text-paper"
            }`}>
              {entry.type === "sale" ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-paper truncate">{entry.item || entry.type}</div>
              <div className="text-[11px] text-slate mt-0.5">
                {new Date(entry.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
              </div>
            </div>
            <div className={`font-mono text-[13px] font-semibold tabular ${entry.type === "sale" ? "text-green-light" : "text-paper"}`}>
              {entry.type === "sale" ? "+" : "−"}₦{entry.amount.toLocaleString("en-NG")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "green" | "amber" | "neutral" }) {
  const color = tone === "green" ? "text-green-light" : tone === "amber" ? "text-amber" : "text-paper";
  return (
    <div className="rounded-xl bg-ink-2 border border-line/[0.07] px-3 py-3">
      <div className="text-[10px] text-slate uppercase tracking-wide font-semibold mb-1">{label}</div>
      <div className={`font-mono text-[13.5px] font-semibold tabular ${color}`}>
        ₦{value.toLocaleString("en-NG")}
      </div>
    </div>
  );
}
