#!/bin/bash
# Used as the Start Command on Render (or any host that gives you a shell).
# Render's free tier wipes the filesystem on every redeploy, so we reseed
# the demo data automatically each time rather than assuming the db persists.
set -e
python -m app.seed
uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8811}"
