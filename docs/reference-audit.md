# Reference audit — `sowieso.wero-wallet.eu/nl-en/merchant`

## Source
- HTML: `reference/site-dump/sowieso.wero-wallet.eu/nl-en/merchant.html` (~7,200 lines, Nuxt 3 SSR output)
- CSS bundles: `_nuxt/entry.DkMMUkE-.css`, `_nuxt/index.CVN-O-Lc.css`, `_nuxt/PageTransitionSection.rcLL0Ye_.css`
- JS bundles: `_nuxt/{Cd_iCvQE,CjN6uTji,Cwtstkjp,De_CX4X5,g2wV7CKQ}.js`
- Fonts: 4 `GT-Walsheim-wero` weights (Regular / Medium / Bold / Black, `.woff2`)
- Images: 3 video posters, 3 footer SVGs, `sticker-phase-1-en.png`, `play-btn.png`, `plyr-icons.svg`, 76 PSP partner PNGs
- Videos: hosted on `sowieso-wero-assets.s3.eu-central-1.amazonaws.com/videos/*.mp4` (not in dump)
- 8 screenshots in `reference/screenshots/`

## Section map

| # | Section | Key class prefix |
| - | ------- | ---------------- |
| 1 | Animated gradient background | `.app__background` (data-v-1b91a326) |
| 2 | Fixed header (iD | wero logo) | `header` (data-v-b157d41c) |
| 3 | Scroll progress bar | `.scroll-progress` (data-v-49b643f8) |
| 4 | Hero: hands + "iDEAL IS BECOMING WERO" | `.hero`, `.hero__title` (data-v-cedc57e4) |
| 5 | Airplanes: "WAY TO PAY" + paper planes | `.airplanes__*` (data-v-e4852512) |
| 6 | Puzzle: "THE NEW EUROPEAN PAYMENT SYSTEM" | `.puzzle-section` (data-v-3e608ce6) |
| 7 | Two phase cards (green / pink) | `.cards-block` (data-v-cc690e54) |
| 8 | FAQ (3 Q&A blocks w/ videos) | `.faq-section` (data-v-41ebc710) |
| 9 | Page transition hands → iDEAL → yellow | `.page-transition` (data-v-53222088) |
| 10 | PSP partners grid (76 logos) | `.partners-section` (data-v-85e0afa4) |
| 11 | Footer (PSP tile, iDEAL/Wero tiles, FAQ tile, socials, `sowieso.` wordmark) | `footer` (data-v-68ae3a8a) |
| 12 | Fixed bottom pill nav + FAQ button + CO cookies + chat | various |

## Design tokens

- **Ink:** `#1d1c1c` (all text, borders, drop shadows)
- **Surface:** `#ffffff`
- **Gradient A (hero → FAQ):** `linear-gradient(121deg, #ff158a -20.66%, #fff48d 65.83%)`, 10s `ease` infinite
- **Gradient B (transition → footer):** yellow `#ffe87a → #ffd94a`
- **Highlight bg:** green `~#7effc5`, cyan `~#8bd8ff`
- **Card tints:** phase 01 green, phase 02 pink/purple, PSP tile purple/pink, FAQ tile pink/purple
- **Radii:** 5px (cards), 50% (icon badges), 999px (pills)
- **Drop shadow:** `0 6px 0 0 #1d1c1c` (cards), `0 4px 0 0 #1d1c1c` (pills, icon badges)
- **Max canvas:** 1920px wide, 16-column grid (`--max-columns: 16; --max-width: 1920`)
- **Typography:** `GT Walsheim wero` Black (display titles), Bold/Medium (body/eyebrow). All fluid via `clamp()` scaling between 375px and 1920px.
  - Hero title clamps `4.875rem → 16.25rem`, letter-spacing `-3.666px → -12.22px`
  - Section title clamps `1.8rem → 3.75rem`
  - Body clamps `1rem → 1.25rem`

## Motion notes

- Animated background gradient: `@keyframes gradient` 0/25/50/75/100% background-position 50/50, 0/0, 50/50, 100/100, 50/50.
- Scroll-triggered reveals use `data-reveal` / `.block-reveal` / `.icon-reveal` — opacity 0 + y 20–30px → 1/0.
- Hero title is line-split (`.hero__title span { display:block; opacity:0; translateY(30–40px) }`).
- Airplane transforms are scroll-linked (`will-change: transform`, `transform: translate(100%)` baseline).
- Sticker appears with `transform: scale(0)` → 1.
- Phase cards start at `margin-top: -30vh / -85vh` and slide in with parallax.
- FAQ answer videos (`<video autoplay loop muted playsinline>`) stream from S3.
- Page-enter uses `filter: blur(1rem); opacity:0` → clear, duration 0.4s.
- Original site uses GSAP ScrollTrigger + Lenis (inferred from `data-lenis-prevent` attributes and scroll JS in bundles).

## Responsiveness

- Breakpoints: 375, 768, 1024, 1440, 1920.
- Hero stays 100svh; title uses `clamp()` fluid scale.
- Phase cards stack full-width < 1024px.
- Partner grid reflows via auto-fill minmax.
- Bottom nav/FAQ floating button hides FAQ on <1024px.

## Gaps / approximations

- Paper-plane, hands, puzzle, lock, piggy-bank, clock art assets are Lottie JSON in the Nuxt bundles — not decoded into the dump. Reproduction uses hand-drawn SVG approximations.
- `sticker-phase-1-en.png` is preserved exactly.
- FAQ video MP4s are streamed from the original S3 origin (requires network).
- GSAP scroll choreography is approximated with Framer Motion `useScroll` / `useTransform`.
