---
name: premium-app-ui
description: >
  Build polished, premium mobile/web app UIs in the user's locked-in design system:
  WARM NEUTRALS (white · beige · black · brown), a bento-grid layout, premium
  frosted-"liquid glass" components, soft floating shadows, large titles, a floating
  glass tab bar, framer-motion spring animations, NumberFlow animated stats, and
  gesture interactions (swipe to complete/delete, a Focus-mode swipe deck) with
  confetti + haptics. Default to this for ANY "make it look cool / premium / clean /
  minimal / floaty / glassy / modern" request, any app restyle, or any new app
  screen/dashboard. The frontend dependency stack below is mandatory for all UI work.
---

# Premium App UI — the "Warm Bento" design system

The user's confirmed taste, chosen through side-by-side review. Default to this for
all UI work unless they ask otherwise.

## One-line aesthetic
Warm-neutral canvas (white / beige / black / brown) · bento tiles · premium frosted
glass · one warm accent · soft floating shadows · large titles · spring motion. Calm,
expensive, alive — not flashy.

## DO / DON'T
- DO: warm neutrals only (cream/beige/sand/espresso/ink), generous whitespace, big
  soft floating shadows, **premium frosted-glass** surfaces (glassmorphism 2.0 —
  restrained, readable), bento tiles, a dark focal "Up Next" card, animated numbers,
  spring physics, gesture interactions, a frosted floating tab bar.
- DON'T (the user explicitly rejected these): **neumorphism**, **claymorphism**,
  neon/glow color, rainbow/indigo-everywhere gradients, all-cool-gray palettes,
  confetti spam, washed-out same-color inputs, or one long stacked list of identical
  cards ("card soup").
- Glass must never hurt readability: blur + translucency for decoration, high
  contrast for text/primary actions (Apple "Liquid Glass" rule).

## Default frontend stack — ALWAYS use these
Standing dependency stack for ANY frontend/UI work. Reach for the library before
hand-rolling CSS/animations.

```bash
npm i react react-dom
npm i -D vite @vitejs/plugin-react typescript tailwindcss postcss autoprefixer
npm i framer-motion lucide-react @number-flow/react canvas-confetti
npm i @use-gesture/react @dnd-kit/core @dnd-kit/sortable   # when gestures/reorder needed
```
- **Vite + React + TS + Tailwind** (`base: './'` for subpath hosting).
- **framer-motion** (Motion) — springs, `layoutId`, `AnimatePresence`, `drag`,
  `useMotionValue`/`useTransform`. Use instead of hand-written CSS keyframes.
- **lucide-react** — icons. **@number-flow/react** — every stat/percentage animates.
- **canvas-confetti** — earned moments only. **@use-gesture/react** + **@dnd-kit** —
  swipe/drag/reorder. Optional flair on request: `@paper-design/shaders-react`,
  Aceternity/React Bits, `lottie-react`.
- Rule: if a polished library exists (motion, icons, numbers, gestures, charts), use it.

## Visual reference
The boards the user picked from live in `reference/` (view them when building):
`01-colors.png` (warm palettes) · `02-backgrounds.png` · `03-components-core.png` ·
`04-components-premium.png` (charts/inputs/cards) · `05-glass.png` (frosted glass kit) ·
`06-styles.png` (the 6 liked styles).

## Color system — warm neutrals
White · beige · black · brown and their pairings. Pick ONE palette per app; one warm
accent used sparingly. Each row = `bg / surface / text / accent`.

| Palette | bg | surface | text | accent |
|---|---|---|---|---|
| Cream & Ink (default) | `#F7F3EA` | `#FFFFFF` | `#1A1A18` | `#1A1A18` |
| Beige & Black | `#E9E1D3` | `#FBF8F2` | `#181818` | `#181818` |
| Brown & White | `#FFFFFF` | `#F4EBE0` | `#4A3525` | `#6B4F3A` |
| Espresso & Cream (dark) | `#2A211B` | `#3A2F27` | `#F0E7DC` | `#C9A27A` |
| Sand & Charcoal | `#ECE5D8` | `#FFFFFF` | `#2B2B2B` | `#8A7A63` |
| Warm White & Tan | `#FBFAF7` | `#FFFFFF` | `#1C1C1A` | `#B08968` |
| Noir & Beige (dark) | `#15120E` | `#211C16` | `#EDE6DA` | `#D8C4A8` |
| Greige Mono | `#E8E6E1` | `#FFFFFF` | `#222222` | `#3A3A38` |

- Default accent is the warm tone (ink / espresso / tan / brown). The original "Warm
  Bento" build used indigo `#4F46E5` — keep that ONLY if the user asks for the indigo
  look; otherwise prefer a warm accent.
- Tailwind tokens (Cream & Ink example):
```js
colors: {
  paper:'#F7F3EA', paper2:'#ECE5D6', card:'#FFFFFF',
  ink:'#1A1A18', sub:'#6E6E68', faint:'#A6A69E', line:'rgba(25,25,23,0.07)',
  accent:'#9C7A57', accentSoft:'rgba(156,122,87,0.12)',  // warm tan; swap per palette
  ok:'#5F9468', flame:'#C2683F',
}
```

## Backgrounds (the canvas) — the liked set
Use a warm, slightly-living canvas; add a faint film grain for depth. Favourites:
- **Sand gradient** — `linear-gradient(160deg,#F8EFE0,#F3E2CF 55%,#EBD3B8)`.
- **Espresso glow** (dark) — `radial-gradient(60% 45% at 50% 0%, rgba(201,162,122,.35), transparent 70%), #241C16`.
- **Noir spotlight** (dark) — `radial-gradient(65% 50% at 50% -6%, rgba(216,196,168,.28), transparent 70%), #13110D`.
- Also liked: **gradient wash** (cream→white), **spotlight** (radial light top), **dot
  grid** (`radial-gradient(#cdbfa6 1.5px,transparent 1.6px) 0 0/22px 22px`), **dark + glow**.
- **Film grain** overlay (always, very subtle): SVG `feTurbulence`,
  `opacity:.04; mix-blend-mode:multiply`.

## Core tokens
- Type: `-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, sans-serif`. Large
  titles `text-[32px] font-extrabold tracking-[-0.03em]`; section labels `13px uppercase
  tracking-wide sub`; body 15–17px. Serif option (Editorial/Mono looks): **Fraunces**.
- Radii: tile `24px`, card/group `16–20px`, pill `999px`, sheet `32px`.
- Shadows: `tile: 0 1px 2px rgba(40,30,15,.05), 0 6px 22px rgba(40,30,15,.06)` ·
  `pop: 0 10px 34px rgba(40,30,15,.14)`.
- Easings: spring `{stiffness:300,damping:26}`, smooth `cubic-bezier(.22,.61,.36,1)`,
  bouncy `cubic-bezier(.34,1.4,.5,1)`. Hairline `0.5px rgba(25,25,23,.08)`.
- Respect `prefers-reduced-motion` and iOS safe-area insets.

## Premium glass ("liquid glass") primitives
The user specifically wants premium glassy components. Recipes:
```css
/* light glass — over a warm/sand/gradient backdrop */
.glass{
  background:linear-gradient(160deg,rgba(255,255,255,.55),rgba(255,255,255,.32));
  backdrop-filter:blur(22px) saturate(1.5); -webkit-backdrop-filter:blur(22px) saturate(1.5);
  border:1px solid rgba(255,255,255,.7);
  box-shadow:0 12px 36px rgba(90,60,25,.16), inset 0 1px 0 rgba(255,255,255,.85);
  border-radius:20px;
}
/* dark glass — over espresso/noir */
.glass-dk{
  background:linear-gradient(160deg,rgba(40,30,20,.5),rgba(40,30,20,.32));
  backdrop-filter:blur(22px) saturate(1.4);
  border:1px solid rgba(255,255,255,.22);
  box-shadow:0 12px 36px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.35);
  color:#fff; border-radius:20px;
}
```
Glass reads best over a backdrop with color variation (sand gradient, soft warm blobs,
espresso/noir glow). Use glass for: hero/now cards, stat tiles, tab bar, segmented
control, search, toast, command palette, nav bar, FAB. Keep body text on solid/high
contrast.

## Component kit (build these; glass variants preferred for premium surfaces)
- **Core:** progress ring (SVG + NumberFlow center), activity rings, stat tile,
  animated counter, inset list row + circular check, **swipe row** (reveal actions),
  segmented control, pill buttons, FAB, chips/tags, bar chart, **focal "Up Next" card**
  (dark), toggle, **floating glass tab bar**, search, linear progress, stepper, slider,
  underline tabs, divider-with-label, empty state, toast, banner, quote/callout.
- **Data-viz:** area chart (SVG gradient fill), line+dots, radial gauge, donut,
  sparkline, **KPI grid**, comparison stat (▲ vs last), milestones, month calendar,
  **streak heatmap**, week strip, stat+trend.
- **Inputs:** OTP code, dropdown/select, date picker, tag input, filter bar, **command
  palette (⌘K, glass)**, compose/chat input.
- **Nav / structure:** pill nav, **glass nav bar**, **speed-dial FAB**, bottom sheet
  (with detents + drag handle), accordion, settings rows, breadcrumb, stepper wizard.
- **Premium glass cards:** smart "now" card, profile header, now-playing, **insight/AI
  card**, weather-style hero (big number), notification badge, dark-glass card.
- **Misc:** kanban card, leaderboard row, avatar group, rating, success state,
  inline alerts (info/success/warn), skeleton loader.

### Signature recipes
- **ProgressRing** — SVG circle, accent stroke on warm track, animate `strokeDashoffset`
  with a spring; center `<NumberFlow value={pct}/>%`.
- **Swipe row** — `motion.div drag="x" dragSnapToOrigin dragDirectionLock`; reveal
  `bg-ok` (complete) left / red (delete) right; act past ±96px; `haptic()`.
- **Bento grid** — `grid grid-cols-2 gap-3`, full-width tiles `col-span-2`; tile =
  `bg-card rounded-tile shadow-tile p-5`; stagger in with `staggerChildren:.06`.
- **Floating glass tab bar** — detached `.glass` pill; active = warm-ink lozenge that
  slides via shared `layoutId="tabpill"`.
- **Area chart** — inline SVG `<path>` with a `<linearGradient>` fill fading to 0 +
  a stroke line; animate the path/length.

## Layout patterns
Phone column `max-w-[500px]`; scrollable `<main>` + floating glass tab bar. Large iOS
title + greeting; quiet uppercase section labels. Hero tile with progress ring + a
subtle animated warm aura behind it. Inset grouped lists (rows in one container,
inset hairlines). Bottom sheets for add/edit.

## Motion & interaction
Everything springs; `active:scale-90`/`whileTap`. `haptic()` → `navigator.vibrate?.()`
on completes/adds/tab switches. `celebrate()` → canvas-confetti ONLY when earned
(day/goal cleared), warm colors `['#9C7A57','#C2683F','#5F9468','#1A1A18']`. Screen/tab
changes cross-fade via `AnimatePresence mode="wait"`. Optional: swipe-to-complete,
Focus-mode swipe deck, drag-reorder (`@dnd-kit`), pull-to-refresh.

## Style variants (all liked — pick per project)
1. **Warm Bento** — bento dashboard, dark Up-Next card, warm paper + ink (+ optional
   indigo). The default.
2. **Minimal Air** — ultra-minimal: one thin floating ring, max whitespace, floating
   pill nav.
3. **Float** — every element a separate floating soft-shadow card, airy gaps.
4. **Mono** — black on white, crisp, one ink accent.
5. **Mocha** — brown + cream, warm tan accent.
6. **Linen** — textured beige, cozy, soft.
(Dark warm — Espresso/Noir palettes — is welcome via the color table. Avoid
neumorphism & claymorphism.)

## Build checklist
1. Scaffold Vite+React+TS+Tailwind; add framer-motion, lucide-react,
   @number-flow/react, canvas-confetti (+ use-gesture/dnd-kit if gestures). `base:'./'`.
2. Put the chosen warm palette + tokens in `tailwind.config.js`; warm backdrop + grain
   + reduced-motion in CSS; add `.glass` / `.glass-dk` utilities.
3. Real state in a store (context + `localStorage`); no mock-only screens.
4. Build screens as bento with the Up-Next focal card, inset lists, floating glass tab
   bar, bottom-sheet add/edit, glass hero/stat cards.
5. Add swipe rows, Focus mode, haptics, earned confetti, NumberFlow stats.
6. Verify the production build in a headless browser (Playwright 390×844): load with
   zero console errors, test a swipe + a sheet before shipping.
7. Static hosting: build, place `index.html` + `assets/` at the served root; use a
   network-first service worker (no hashed-asset precache).
