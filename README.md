# BizKobo — NBU

A campus fintech app: wallet, spending history, an explainable Trust Score,
and Urgent 2K — an emergency micro-loan feature underwritten by BizKobo's
scoring and disbursed through a partner bank (modeled here as **Zenith Bank**).

Built multi-tenant from day one: every user, transaction, and loan is scoped
to a `university_id`. Adding a second school later means adding one
`University` row and a brand color/logo — not a rebuild.

---

## Architecture

```
bizkobo/
├── backend/     FastAPI + SQLAlchemy + SQLite (dev) — the ledger, auth, and Trust Score engine
└── frontend/    Next.js 14 + Tailwind + Framer Motion + lucide-react — the app UI
```

**How money actually moves (the pooled-ledger model):**
Zenith Bank holds one pooled settlement account. BizKobo's database is the
ledger that tracks each student's share of that pool. When Student A pays
Student B inside the app, no money moves at the bank — only the ledger
entries change. Money only touches the bank rails at the edges: when a
student funds their wallet (inbound transfer) or withdraws (outbound
transfer). This is the same model Opay, Kuda, and PalmPay run on.

**Urgent 2K, honestly:** BizKobo never lends its own money. It computes a
Trust Score from real transaction history (savings consistency, repayment
history, account activity, income signals, spending discipline — all visible
in the `/trust-score` endpoint's `breakdown` field) and recommends approval.
In this build, the "partner approval" is simulated locally so the demo is
self-contained; wiring it to Zenith's real lending API is a drop-in
replacement for one function in `backend/app/routers/urgent.py`.

---

## Running it locally (Windows/PowerShell, matching your usual setup)

### 1. Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# create the database and demo account
python -m app.seed

# run the API
uvicorn app.main:app --reload --port 8811
```

API now running at `http://localhost:8811`. Interactive docs at
`http://localhost:8811/docs`.

**Demo login:** `demo@nbu.edu.ng` / `password123`

### 2. Frontend

```powershell
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

App now running at `http://localhost:3000`. Sign in with the demo account —
it's pre-filled on the login screen.

---

## What's real vs. what's a placeholder

**Real and working (verified end-to-end this session):**
- Auth (register/login, JWT, bcrypt password hashing)
- Wallet balance, fund, send-to-another-student — real ledger updates
- **Send / Fund / Pay Fees** — all three wired to real endpoints with working forms
- Transaction history
- Trust Score — computed from actual transaction data, not randomized
- Urgent 2K — real eligibility logic, real loan records, real repayment flow
- **SME bookkeeping** — students running a campus business (food, laundry, print,
  fashion) can log sales/expenses by typing or voice ("I sold rice for 25000") and
  get a real auto-computed income statement. The text parser is rule-based and
  transparent (see `backend/app/voice_parser.py`) — English/Pidgin only.
- **Ajo/Esusu group savings** — create/join groups, contribute each cycle, real
  rotation-based payout logic (tested with 2 members across a full cycle)
- **Parents' financial monitoring** — a student generates a share link; a parent
  opens it with no login and sees balance, budget-vs-spend, recent transactions
- Multi-tenant data model (ready for a second university)

**Placeholder / next steps:**
- **AI voice assistant, multilingual** — Yoruba/Hausa/Igbo speech recognition
  needs a dedicated paid API (e.g. Google Cloud Speech-to-Text with a Nigerian
  language model). What's built now is real but scoped to English/Pidgin via
  the browser's built-in speech recognition — a genuine partnership/cost
  decision needed before expanding language coverage.
- **Credit Ready Passport** — the data (Trust Score, transaction history, SME
  income statements) all exists; the shareable investor/bank-facing report
  format hasn't been built yet.
- **Offline mode** — not implemented. Needs local storage + sync architecture,
  a real design decision, not a quick add-on.
- Zenith Bank integration — currently simulated locally; needs their real
  lending API once the partnership is confirmed
- Production database — swap `DATABASE_URL` to Postgres for anything beyond
  a pilot (SQLite is fine for local dev and a small pilot cohort)
- Real KYC/compliance flow — worth a conversation with a lawyer before this
  touches real money, given CBN/FCCPC digital lending rules

---

## Next build priorities (suggested order)

1. Credit Ready Passport — turn existing Trust Score + income statement data
   into a shareable PDF/report for banks and investors (data's all there)
2. Admin/university-onboarding flow — so adding NBU's next partner school
   doesn't require touching code
3. Decide on a speech-to-text provider for Yoruba/Hausa/Igbo (cost + partner
   decision, not an engineering one)
4. Real Zenith Bank API integration for Urgent 2K disbursement and wallet
   funding webhooks
\\\

deactivate
Remove-Item -Recurse -Force venv
py -3.13 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt