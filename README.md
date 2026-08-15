# Eternity Products — Business & Commerce System

Product research, margin economics, growth system and a complete website build specification for **Eternity Products**, a Nepal-based importer and distributor of professional hair styling tools, cosmetics and salon equipment.

Built August 2026.

---

## The headline finding

The business has two product lines with completely different economics:

| | Traffic line | Profit line |
|---|---|---|
| Products | Straighteners, dryers, curlers, stylers | Barber chairs, shampoo stations, spa beds, trolleys |
| Daraz Nepal presence | Heavy — every price visible | **None** |
| Margin | 25–30% | ~50% |
| Gross profit per unit | NPR ~2,900 | NPR ~94,000 |

**One six-chair salon fit-out ≈ NPR 563,000 gross profit. Matching it on straighteners takes 193 units.**

Both lines come from the same supplier — Ikonic makes the chairs as well as the straighteners. The styling tools are the marketing channel; the salon equipment is the business.

---

## Files

| File | What it is | Who it is for |
|---|---|---|
| **`Eternity_Product_Research_Master.xlsx`** | 197 products, live margin formulas, import economics, inventory planner | You. Contains confidential cost data |
| **`Eternity_Growth_and_Content_Dashboard.xlsx`** | 90-day content calendar, hooks, Nepal marketing psychology, funnel, B2B engine | You and whoever makes content |
| **`Eternity_Brand_and_Launch_Strategy.pdf`** | 18-page strategy document | Shareable — partners, suppliers, bank |
| **`Eternity_Brand_and_Launch_Strategy.md`** | Markdown source of the PDF | Editing |
| **`Eternity_Study_Presentation.pptx`** | 13-slide summary deck | Presenting to partners or suppliers |
| **`ANTIGRAVITY_BUILD_PROMPT.md`** | Complete website + backend build spec | Gemini Antigravity |
| **`data/products_seed.csv`** | 196 products with verified pricing | Seeds the website database |
| **`Design/`** | 9 design concepts (tokens, HTML, screenshots) | Pick one before the build starts |
| **`CLAUDE.md`** | Working rules for AI agents in this folder | Claude, Antigravity, any agent |

---

## Start here

**1. Open `Eternity_Product_Research_Master.xlsx` → `START HERE` sheet.**
It explains what is verified, what is estimated, and what needs your input. Read it before trusting any number.

**2. Fix the one thing that changes everything.**
Every cost figure is *derived* from your stated margin bands, not from your invoices. On the `Product Master` sheet, replace column **M (Margin %)** with your real supplier terms. The whole workbook recalculates.

**3. Check three numbers on `Unit Economics`.**

| Cell | What to check |
|---|---|
| Distributor discount (tools) | Currently 25%, derived from your own margin claim. Is it right? |
| Distributor discount (furniture) | Currently 45%. The sheet shows you need ~47% to hit your stated 50% |
| Customs duty rate | A placeholder. Get the real figure per HS line from your clearing agent |

**4. Load your salon accounts.**
`Salon Community CRM` sheet. You already have these relationships — they are currently in your phone, not in a system. This sheet also seeds the community module in the website.

---

## What was verified, and what was not

Every price in these files was read from a live page or computed from one. Each row carries a confidence tag:

| Tag | Meaning |
|---|---|
| `VERIFIED` | India list price from the official Ikonic catalogue **and** Nepal price from a live Daraz page |
| `LIKELY-MATCH` | Name-matched to a Daraz listing but not exact — open the link and confirm before pricing |
| `NO-NEPAL-LISTING` | Real Ikonic product with no Daraz Nepal equivalent. This is the opportunity, not a gap |
| `INDIA-TRADE-PRICE` | Real India trade price found (hydrafacial). No Nepal equivalent at any grade |
| `CONFIRM-BRAND` | Real catalogue and real prices, but confirm it is your brand before ordering |
| `NEEDS-SUPPLIER-INPUT` | Brand with no public catalogue — send the supplier price list |

**Still needed from you:**

- **Which "Silk Hair" is yours** — no Indian brand trades under exactly that name. Silky India (`silkyhairindia.com`) is the closest fit and its 23 salon-professional SKUs are already priced in the workbook. Confirm and they go live
- **Qween lipstick** — zero Daraz Nepal presence (searching "qween" returns unrelated products)
- **Your hydrafacial supplier quote** — India trade price is INR 8,000–30,000 by grade and three rows are now costed. Replace with your real FOB
- **Exact customs duty rates** for your HS codes — from your clearing agent
- **Real supplier invoices** — to replace every derived cost figure

These are listed as gaps rather than filled with guesses, because a wrong number you trust is worse than a blank you can fill.

---

## Regenerating the outputs

The build scripts live in the session scratchpad, not this folder. To rebuild:

**Strategy PDF** — edit the `.md`, then re-render with headless Chrome:

```bash
python make_pdf.py
```

**Seed CSV** — after editing prices or margins in the workbook:

```bash
python make_seed.py
```

**Verify the workbooks** — evaluates the Unit Economics formula chain and asserts the Product Master invariants:

```bash
python check_workbooks.py
```

Requires `openpyxl` (installed). The PDF path uses Chrome's `--print-to-pdf`; the deck uses `pptxgenjs`. No other dependencies.

---

## Confidentiality

**`Eternity_Product_Research_Master.xlsx` contains your buying costs and discount authority.**

The `Margin Vault INTERNAL` sheet has a red tab and a do-not-share banner. Anyone holding this workbook can calculate what you pay and negotiate against it.

Safe to share: the **PDF** and the **presentation**. Both show margin bands and outcomes, never supplier costs.

Do not send the workbooks to salon customers, or to staff who negotiate prices.

---

## Next step

Hand `ANTIGRAVITY_BUILD_PROMPT.md` to Gemini Antigravity. It is self-contained — schema, routes, admin, B2B portal, community broadcast, and a ten-phase build order where each phase ships something usable.

Phase 1 is the catalogue and product pages, seeded from `data/products_seed.csv`.
