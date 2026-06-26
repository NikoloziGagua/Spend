# spent & saved (Ledger)

A premium, offline-first personal spending tracker. The frontend is a
**Vite + React + TypeScript** app in `app/` (source), built to static files
that are committed at the **repo root** and served by GitHub Pages.

## Design language — the `premium-app-ui` skill
The UI follows the locked-in **Quiet Ledger** look (the skill's "Minimal Air"
variant, with the user's overrides): near-white **dotted canvas + soft top
spotlight**, frosted **silver glass** surfaces, an editorial serif hero number,
a floating glass bottom-pill nav, monoline **lucide** icons (no emoji), and
spring motion. Full spec + reference boards live in
`.claude/skills/premium-app-ui/`. Use it for any UI work.

## Stack
- **Vite + React + TS + Tailwind** (`base: './'` for subpath hosting).
- **framer-motion** — motion, `layoutId` nav pill, drag (swipe rows), sheets.
- **lucide-react** — icons · **@number-flow/react** — animated amounts ·
  **@use-gesture/react** + **canvas-confetti** available for gestures / earned moments.
- State: React context + `localStorage` (keys `ledger.v2`, `ledger.budgets`,
  `ledger.recurring`, `ledger.settings`, `ledger.currency`, `ledger.theme`).

## Layout
```
app/                 # React source (Vite)
  src/
    components/       # Header, BottomNav, AddForm, TxnRow, sheets, Toast, ui
    views/            # Today, Budget, History, Stats, Settings
    lib/              # store, analytics, theme, format, effects, uiContext
    categories.tsx    # category list + lucide icon map
index.html, assets/  # BUILT output (committed, served by GitHub Pages)
manifest.webmanifest, sw.js, icon.svg, .nojekyll
```

## Develop
```bash
cd app && npm install && npm run dev      # http://localhost:5173
```

## Build & deploy (GitHub Pages serves repo root)
```bash
cd app && npm run build                   # type-checks, outputs app/dist/
# then copy the build to the repo root:
rm -f ../index.html && rm -rf ../assets
cp -r dist/. ..
```
The service worker is **network-first** (no hashed-asset precache), so a fresh
deploy never serves stale chunks.

## Verify before shipping
Build, then load the production output in a headless browser at 390×844 —
zero console errors; smoke-test a swipe (delete/edit) and a bottom sheet.
