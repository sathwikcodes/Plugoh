# Runtime observations

Based on the static dump + screenshots (live-site Playwright access requires the target to be reachable at runtime, which was confirmed for screenshot comparison but is not a hard dependency for reproduction).

## Header
- Fixed, centered, always visible. Logo does not shrink on scroll (same size throughout).
- Language pill (NL / EN) is fixed top-right; "EN" is the active pill (filled yellow).
- Chat bubble icon sits next to language pill.

## Scroll-progress
- 4px ink bar at top, scaleX tied linearly to document scroll.

## Hero
- Hands illustration centers between "iDEAL IS", "BECOMING", "WERO" lines (thumbs touching).
- Sticker "NOW IN PHASE 1" rotates slowly (observed in the CSS as animation + tilt).
- Scroll CTA pill floats bottom-center, visible until the user scrolls past ~1 viewport.

## Airplanes
- First paper plane (pink/orange) enters bottom-left, exits top-right.
- Second plane (green/pink) enters from the right on the following scroll segment.
- The checkmark sits inline in the heading and animates width 0 → full once in view.

## Puzzle
- Green isometric puzzle floats right on desktop; body text has a fixed max-width ~680px.
- On mobile the puzzle drops above the text.

## Phase cards
- Card 1 (green clock) and card 2 (pink credit cards) present with offset / parallax as you scroll.
- The numbered badge ("1" / "2") sits pinned to the top-left corner of each card with the 0–6px drop shadow.

## FAQ
- Three Q&A tiles in a vertical stack, each with eyebrow → title → illustration → "We have the answer" CTA.
- Clicking the CTA reveals (in a card with the same 1px ink / 6px shadow treatment) a looping muted video.
- Highlight spans use rounded filled backgrounds (green/cyan).

## Page transition
- After the FAQ, hands re-enter from the sides, meeting in the middle with a giant "iDEAL" wordmark through the gap, as the background washes to yellow.

## Partners
- Yellow background. 76 PNG logos in a responsive grid with 1px ink border + 6px shadow tiles.
- Large uppercase title "ALWAYS AVAILABLE WITH OUR PSP PARTNERS".

## Footer
- Two-column grid on desktop: left = PSP tile (purple/pink) + iDEAL/Wero tiles; right = FAQ tile (pink/purple) + social-icon column.
- Giant "sowieso." wordmark centered, disclaimer below.
- Bottom nav pill and floating FAQ button remain fixed throughout.

## Notes for reproduction
- GSAP ScrollTrigger timing is approximated with Framer Motion `useScroll({ offset })`.
- The live site uses Lenis smooth scroll (we keep browser-native smooth scroll for fidelity cost vs benefit).
- Matomo + Cookiebot trackers in the source are intentionally omitted (not part of the visual reproduction).
