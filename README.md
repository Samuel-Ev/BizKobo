# BizKobo

An AI-powered financial platform for Nigerian students, SMEs, and informal
traders — combining a campus/community wallet, bookkeeping, group savings,
and emergency micro-credit in one app.

Built multi-tenant from day one: every user, transaction, and loan is scoped
to an institution/community. Onboarding a new partner school or market means
adding one configuration row and a brand color/logo — not a rebuild.

---

## Architecture

```
bizkobo/
├── backend/     FastAPI + SQLAlchemy + SQLite — ledger, auth, and Trust Score engine
└── frontend/    Next.js 14 + Tailwind + Framer Motion + lucide-react — the app UI
```

**How money moves (pooled-ledger model):**
A partner bank holds one pooled settlement account. BizKobo's database is the
ledger that tracks each user's share of that pool. When one user pays
another inside the app, no money moves at the bank — only the ledger entries
change. Money only touches real banking rails at the edges: funding a wallet
or withdrawing from it. This is the same model used by major Nigerian
mobile-money platforms.

**Urgent 2K (emergency micro-credit):**
BizKobo never lends its own money. It computes a Trust Score from real
transaction history — savings consistency, repayment history, account
activity, income signals, and spending discipline (all visible in the
`/trust-score` endpoint's breakdown) — and recommends approval to a partner
lender.

---

## Features

- **Wallet** — send, fund, and pay fees, with full transaction history
- **Trust Score** — a transparent, explainable score built from real account
  activity, not a black box
- **Urgent 2K** — emergency micro-credit with instant eligibility checks
- **SME bookkeeping** — log sales and expenses by typing or speaking a
  sentence ("I sold rice for 25000"), with an auto-computed income statement
- **Ajo/Esusu group savings** — create or join a rotating savings group, with
  automatic payout rotation each cycle
- **Parent/Guardian Control** — generate a private, read-only link so a
  parent or guardian can monitor spending and budget status without a
  separate login
- **Spreadsheet & Records** — manual record-keeping for cash sales or
  spending outside the wallet
- **Past Questions** — a subscription-gated library of exam past questions
- **WAEC/JAMB Results** — a results-checker experience, with direct links to
  the official WAEC and JAMB portals
- **AI Support** — an in-app assistant for common questions about the app
- **Dark/light mode**, fully responsive desktop and mobile layouts

---

## Running it locally

### 1. Backend

```powershell
cd backend
py -3.13 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# create the database and seed sample data
python -m app.seed

# run the API
uvicorn app.main:app --reload --port 8811
```

API now running at `http://localhost:8811`. Interactive docs at
`http://localhost:8811/docs`.

> Note: use Python 3.13 — newer versions may not yet have prebuilt wheels
> for all dependencies.

A sample account is created automatically by the seed script — check
`backend/app/seed.py` for its login details.

### 2. Frontend

```powershell
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

App now running at `http://localhost:3000`.

---

## Deployment

- **Backend** deploys well to Render (or any host supporting Python web
  services). Set `JWT_SECRET` to a strong random value, and `DATABASE_URL`
  to a Postgres connection string for anything beyond local testing.
- **Frontend** deploys well to Vercel. Set `NEXT_PUBLIC_API_URL` to your
  deployed backend's URL.

---

## Roadmap

- Credit Ready Passport — a shareable financial-health report for banks and
  investors, built from existing Trust Score and income statement data
- Multilingual voice input (Yoruba, Hausa, Igbo) via a dedicated
  speech-to-text provider
- Real payment gateway integration (Paystack/Flutterwave)
- Production-grade database and infrastructure for scale