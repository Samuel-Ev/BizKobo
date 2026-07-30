"""
Voice/text transaction parser — v1.

This is a transparent, rule-based parser, not a trained multilingual model.
It handles English and common Nigerian Pidgin phrasing for sales/expenses
("I sold rice for 25000", "I spent 1500 on transport", "bought fabric worth
8k"). It does NOT understand Yoruba, Hausa, or Igbo — that requires a
dedicated speech + NLU provider (e.g. Google Cloud Speech-to-Text with a
Nigerian-language model), which is a partnership/cost decision, not
something to fake with placeholder logic.

The parser is intentionally simple so its behavior is fully explainable —
important for a bookkeeping tool where a wrong guess means a wrong figure
on someone's income statement.
"""
import re

SALE_KEYWORDS = ["sold", "sell", "sale", "made", "earned"]
EXPENSE_KEYWORDS = ["spent", "bought", "buy", "paid", "purchase", "purchased"]


def _extract_amount(text: str) -> float | None:
    # Matches: 25000, 25,000, ₦25000, 25k, 8.5k
    match = re.search(r"₦?\s?([\d,]+(?:\.\d+)?)\s?(k)?", text, re.IGNORECASE)
    if not match:
        return None
    number_str = match.group(1).replace(",", "")
    try:
        amount = float(number_str)
    except ValueError:
        return None
    if match.group(2):  # "k" suffix = thousands
        amount *= 1000
    return amount


def _extract_item(text: str, keyword: str) -> str | None:
    # Case 1: "...on/for/worth/at <item>" — item comes AFTER the preposition,
    # which is how amount-first phrasing reads ("spent 1500 on transport").
    prep_match = re.search(r"\b(?:on|for|worth|at)\b\s+([a-zA-Z][a-zA-Z\s]*)", text, re.IGNORECASE)
    if prep_match:
        item = prep_match.group(1).strip().rstrip(".")
        if item:
            return item

    # Case 2: "<keyword> <item> for/worth/on/at <amount>" — item comes
    # BEFORE the preposition/amount ("sold rice for 25000").
    pattern = rf"{keyword}\s+(.+?)(?:\s+(?:for|worth|on|at)\s|\s?₦|\s?\d)"
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        item = match.group(1).strip()
        # Reject captures that are just digits/currency symbols — means we
        # matched the amount itself, not a real item.
        if item and not re.fullmatch(r"[\d₦,.\s]+", item):
            return item
    return None


def parse_transaction_text(text: str) -> dict:
    lowered = text.lower().strip()
    amount = _extract_amount(lowered)

    txn_type = None
    item = None
    for kw in SALE_KEYWORDS:
        if kw in lowered:
            txn_type = "sale"
            item = _extract_item(lowered, kw)
            break
    if txn_type is None:
        for kw in EXPENSE_KEYWORDS:
            if kw in lowered:
                txn_type = "expense"
                item = _extract_item(lowered, kw)
                break

    if txn_type is None or amount is None:
        return {
            "understood": False,
            "type": None,
            "amount": None,
            "item": None,
            "raw_text": text,
            "message": "Couldn't work out the amount and whether this was a sale or expense. "
                       "Try something like 'I sold rice for 25000' or 'spent 1500 on transport'.",
        }

    return {
        "understood": True,
        "type": txn_type,
        "amount": amount,
        "item": item,
        "raw_text": text,
        "message": f"Got it — logged as a{'n' if txn_type == 'expense' else ''} {txn_type} of ₦{amount:,.0f}"
                   + (f" for {item}" if item else "") + ".",
    }
