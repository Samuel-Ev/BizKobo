"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Send, User as UserIcon, Info } from "lucide-react";
import Topbar from "@/components/Topbar";
import { useDashboard } from "@/components/DashboardDataProvider";
import { matchFaq, FAQ } from "@/lib/faq";

interface Message {
  role: "user" | "bot";
  text: string;
}

export default function SupportPage() {
  const { user } = useDashboard();
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! I'm BizKobo's assistant. Ask me about your Trust Score, Urgent 2K, Ajo groups, business tracking, or anything else in the app." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function handleSend(text?: string) {
    const question = (text || input).trim();
    if (!question) return;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setTyping(true);

    await new Promise((r) => setTimeout(r, 500));
    const match = matchFaq(question);
    const answer = match
      ? match.answer
      : "I don't have a specific answer for that yet — I'm a rule-based helper, not a full AI model, so I only know the topics below. Tap one to see what I can help with.";
    setTyping(false);
    setMessages((prev) => [...prev, { role: "bot", text: answer }]);
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <Topbar userName={user.full_name} university={user.university} />

      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-green/10 text-green-light flex items-center justify-center shrink-0">
          <Bot size={22} />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold text-paper">AI Support</h1>
          <p className="text-[13px] text-slate mt-1 max-w-lg leading-relaxed">
            Quick answers about how BizKobo works.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 bg-copper/[0.08] border border-copper/25 rounded-xl p-3.5 mb-5">
        <Info size={14} className="text-copper-light shrink-0 mt-0.5" />
        <p className="text-[11.5px] text-paper leading-relaxed">
          Honest label: this is a rule-based FAQ matcher, not a generative AI model — it recognizes
          keywords from a fixed list of topics rather than truly understanding free-form questions.
        </p>
      </div>

      <div className="rounded-xl2 border border-line/[0.07] bg-ink-2 flex flex-col h-[420px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "bot" && (
                <div className="w-7 h-7 rounded-lg bg-green/10 text-green-light flex items-center justify-center shrink-0">
                  <Bot size={13} />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  m.role === "user" ? "bg-copper text-white" : "bg-ink-3 text-paper"
                }`}
              >
                {m.text}
              </div>
              {m.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-ink-3 text-paper flex items-center justify-center shrink-0">
                  <UserIcon size={13} />
                </div>
              )}
            </motion.div>
          ))}
          {typing && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green/10 text-green-light flex items-center justify-center shrink-0">
                <Bot size={13} />
              </div>
              <div className="bg-ink-3 rounded-2xl px-3.5 py-2.5 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                    className="w-1.5 h-1.5 rounded-full bg-slate"
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {FAQ.slice(0, 4).map((f) => (
              <button
                key={f.question}
                onClick={() => handleSend(f.question)}
                className="text-[11px] font-medium text-copper-light bg-copper/10 border border-copper/25 rounded-full px-2.5 py-1"
              >
                {f.question}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2 border-t border-line/[0.07] p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-ink-3 border border-line/[0.09] rounded-xl px-3.5 py-2.5 text-[13px] text-paper placeholder-slate focus:outline-none focus:border-copper-light/60"
          />
          <button type="submit" className="w-10 h-10 rounded-xl bg-copper hover:brightness-110 flex items-center justify-center shrink-0">
            <Send size={15} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
