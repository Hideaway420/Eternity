# GEMINI.md — Antigravity Agent Configuration & Memory

Master reference for Google DeepMind Antigravity AI agent working on **Eternity Products**.

---

## 🚀 Project Overview

**Eternity Products** is a Nepal-based importer and distributor of professional hair styling tools, cosmetics, and salon equipment (Ikonic brand, imported from India).

### Key Links & Contact Details
- **Official Phone / Viber / WhatsApp**: `+977 9868089892` (WhatsApp: `https://wa.me/9779868089892`)
- **TikTok Shop**: `https://www.tiktok.com/@eternity.products?is_from_webapp=1&sender_device=pc`
- **GitHub Repository**: `https://github.com/Hideaway420/Eternity.git`
- **Live Vercel Site**: `https://eternity-black-nine.vercel.app`

---

## 🛠️ Stack & Architecture

- **App Framework**: Next.js 15 (App Router, Server & Client Components)
- **Styling**: Tailwind CSS + Custom Serene Opulence Tokens (`#FDFBF7` Ivory, `#D4AF37` Gold, `#1E2224` Dark Slate)
- **Database Layer**: Drizzle ORM + `@libsql/client` (SQLite / LibSQL)
- **Internationalization**: Dual Language Switcher (`src/lib/i18n.ts`) for English (`en`) & Nepali (`np`)
- **Seeded Data**: 173 verified products from `data/products_seed.csv`

---

## 🔑 Invariant Rules

1. **Integer Paisa Math**: Store money in integer paisa (`price_npr * 100`). Format output using `formatNpr()`.
2. **Confidential Margin Vault**: Never expose `cost_npr` or gross margin percentages to non-owner roles or public API routes.
3. **Open-Box COD**: Default payment is Cash on Delivery with open-box inspection guarantee across Nepal.
4. **Vercel Resiliency**: Database initialization gracefully falls back to `file::memory:` or fallback mock data when `TURSO_DATABASE_URL` is unconfigured to prevent 500 EROFS errors.
