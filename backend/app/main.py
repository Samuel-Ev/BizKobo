from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth, wallet, transactions, trust, urgent, fees, sme, voice, savings, parent, subscriptions, ledger

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BizKobo API", version="0.1.0")

import os

# For local dev: any localhost port. For deployment: set CORS_ALLOW_ORIGIN_REGEX
# in your environment (e.g. Render/Railway) to match your Vercel frontend URL,
# for example: r"https://bizkobo.*\.vercel\.app"
# This is deliberately permissive for the demo phase — tighten before handling
# real money or real user data.
CORS_ORIGIN_REGEX = os.getenv(
    "CORS_ALLOW_ORIGIN_REGEX",
    r"http://(localhost|127\.0\.0\.1):\d+|https://.*\.vercel\.app",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(wallet.router)
app.include_router(transactions.router)
app.include_router(trust.router)
app.include_router(urgent.router)
app.include_router(fees.router)
app.include_router(sme.router)
app.include_router(voice.router)
app.include_router(savings.router)
app.include_router(parent.router)
app.include_router(subscriptions.router)
app.include_router(ledger.router)


@app.get("/")
def root():
    return {"status": "BizKobo API running"}
