import axios from "axios";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8811";

export const api = axios.create({ baseURL: API_BASE });

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    if (typeof window !== "undefined") localStorage.setItem("bizkobo_token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    if (typeof window !== "undefined") localStorage.removeItem("bizkobo_token");
  }
}

export function loadStoredToken() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("bizkobo_token");
  if (token) setAuthToken(token);
  return token;
}

export interface Wallet {
  balance: number;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  counterparty: string | null;
  note: string | null;
  created_at: string;
}

export interface TrustScore {
  score: number;
  max_score: number;
  tier: string;
  points_this_month: number;
  urgent_limit: number;
  breakdown: Record<string, number>;
}

export interface UrgentCheckResult {
  eligible: boolean;
  amount: number;
  trust_score: number;
  status: string;
  due_date: string | null;
  reason: string;
}

export interface University {
  name: string;
  slug: string;
  brand_color: string;
  logo_initial: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  student_id: string | null;
  university: University;
}

export interface Fee {
  id: string;
  name: string;
  amount: number;
  category: string;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  created_at: string;
}

export interface BizEntry {
  id: string;
  type: string;
  amount: number;
  item: string | null;
  note: string | null;
  created_at: string;
}

export interface IncomeStatement {
  total_sales: number;
  total_expenses: number;
  net_profit: number;
  entry_count: number;
}

export interface VoiceParseResult {
  understood: boolean;
  type: string | null;
  amount: number | null;
  item: string | null;
  raw_text: string;
  message: string;
}

export interface SavingsGroup {
  id: string;
  name: string;
  contribution_amount: number;
  frequency_days: number;
  member_count: number;
  current_cycle: number;
}

export interface LedgerRecord {
  id: string;
  date: string;
  description: string;
  category: string;
  type: string;
  amount: number;
}

export interface ParentLink {
  id: string;
  parent_name: string | null;
  parent_email: string | null;
  share_token: string;
  monthly_budget_limit: number | null;
}
