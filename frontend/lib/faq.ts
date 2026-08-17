export interface FaqEntry {
  keywords: string[];
  question: string;
  answer: string;
}

export const FAQ: FaqEntry[] = [
  {
    keywords: ["trust", "score"],
    question: "How is my Trust Score calculated?",
    answer: "Your Trust Score (300-850) is built from five things: savings consistency, repayment history, account activity, income signals, and spending discipline. It's fully transparent — check Home for your live breakdown.",
  },
  {
    keywords: ["urgent", "2k", "loan", "emergency"],
    question: "How does Urgent 2K work?",
    answer: "Urgent 2K checks your Trust Score against your recent activity and, if eligible, approves an emergency amount instantly — backed by our partner bank. Higher Trust Score tiers unlock higher limits.",
  },
  {
    keywords: ["ajo", "esusu", "savings", "group"],
    question: "How do Ajo/Esusu groups work?",
    answer: "Create or join a group, everyone contributes the same amount on the same schedule, and each cycle one member gets the full pooled payout — rotating until everyone's had a turn.",
  },
  {
    keywords: ["business", "sme", "sale", "expense"],
    question: "How do I track my business?",
    answer: "Head to Business, add your shop, then log sales/expenses by typing (or speaking) a sentence like 'sold rice for 25000' — it's parsed automatically into your income statement.",
  },
  {
    keywords: ["parent", "guardian", "monitor"],
    question: "How does parent monitoring work?",
    answer: "Generate a private link from the Parent/Guardian Control page. Whoever has that link can see your balance and spending — no login needed for them. You can regenerate it anytime to revoke access.",
  },
  {
    keywords: ["subscription", "past question", "pay"],
    question: "How does the Past Questions subscription work?",
    answer: "It's ₦500/month, paid straight from your wallet balance — no card required. Once active, every course's past questions unlock immediately.",
  },
  {
    keywords: ["waec", "jamb", "result"],
    question: "Can I check my real WAEC/JAMB result here?",
    answer: "Not directly — only WAEC and JAMB's own official portals hold real results. The Results page has a demo checker plus direct links to the real portals.",
  },
  {
    keywords: ["fee", "hostel", "dues"],
    question: "How do I pay school fees?",
    answer: "Use the Pay Fees quick action on Home — pick the fee (hostel, dues, etc.) and it's deducted from your wallet instantly.",
  },
];

export function matchFaq(input: string): FaqEntry | null {
  const lowered = input.toLowerCase();
  let best: { entry: FaqEntry; score: number } | null = null;

  for (const entry of FAQ) {
    const score = entry.keywords.filter((kw) => lowered.includes(kw)).length;
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }
  return best?.entry || null;
}
