---
name: Nagrik
description: Ultra-premium, neutral-only civic reporting PWA. Calm, restrained, typography-led.
version: alpha
colors:
  bg-light: "#FAFAFA"
  surface-light: "#FFFFFF"
  surface-variant-light: "#F2F2F4"
  border-light: "#E4E4E8"
  border-strong-light: "#D1D1D8"
  text-primary-light: "#1A1A1F"
  text-secondary-light: "#5A5A66"
  text-tertiary-light: "#8C8C99"
  bg-dark: "#0A0A0C"
  surface-dark: "#151519"
  surface-variant-dark: "#1E1E23"
  border-dark: "#2A2A31"
  border-strong-dark: "#3F3F48"
  text-primary-dark: "#F2F2F4"
  text-secondary-dark: "#A8A8B3"
  text-tertiary-dark: "#7C7C88"
  error-light: "#C4453A"
  error-dark: "#E8776D"
  warning-light: "#B8862E"
  warning-dark: "#D9A94F"
  success-light: "#3F7A5C"
  success-dark: "#6BAE8A"
typography:
  display:
    fontFamily: Grift
    fontWeight: 700
  heading:
    fontFamily: Grift
    fontWeight: 600
  body:
    fontFamily: Instrument Sans
    fontWeight: 400
  ui-labels:
    fontFamily: Instrument Sans
    fontWeight: 500
  forms:
    fontFamily: Instrument Sans
    fontWeight: 400
  marathi:
    fontFamily: Hind
    fontWeight: 400
  reference-ids:
    fontFamily: Geist Mono
    fontWeight: 500
rounded:
  sm: 8px
  md: 12px
  lg: 20px
  full: 9999px
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  6: 24px
  8: 32px
  12: 48px
  16: 64px
shadows:
  overlay-light: "0 4px 20px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02)"
  overlay-dark: "0 4px 24px rgba(0, 0, 0, 0.4), 0 2px 12px rgba(0, 0, 0, 0.2)"
  toast-light: "0 8px 32px rgba(0, 0, 0, 0.06)"
  toast-dark: "0 8px 36px rgba(0, 0, 0, 0.5)"
---

## Overview
Calm and expensive, not loud and clever. Neutral-only palette across light and dark, no brand accent color anywhere, ever. The one place color appears with intent is the small semantic set below (error, warning, success), used only functionally, never decoratively. Typography, not color, carries the personality here: Grift for the Latin/English display and heading elements, Hind for Marathi translation, Instrument Sans for body text, UI labels, and form fields, and Geist Mono wherever a reference ID or number needs to look precise rather than typed. Pick one theme as the primary design target and finish it before adapting the other, don't build both halfway at once.

## Colors
Two 8-step neutral ramps, one per theme (not one ramp simply inverted), plus three muted semantic colors tuned separately for contrast in each theme. No accent color exists in this system, full stop. If a future screen ever needed something like an approve/hold action, semantic colors are the only place that logic would live, they still wouldn't become a general-purpose accent.

## Texture & Visual Surfaces
Visual interest is built through physical constraints and tactile finishes, not decorative colors. Premium texture is defined by:
- **Subtle Surface Gradients:** Surfaces like primary buttons or card states use extremely shallow vertical gradients (e.g. from `#FFFFFF` to `#F9F9FB` in light mode) to mimic natural ambient light.
- **Micro-borders:** 1px borders using `border-light` or `border-dark` define all boundaries. In dark mode, sub-pixel borders act as highlighted structural ridges to anchor UI cards.
- **Glassmorphism Scrims:** Use `backdrop-filter: blur(16px)` with a high-transparency overlay (`rgba(255, 255, 255, 0.7)` for light, `rgba(21, 21, 25, 0.8)` for dark) on headers, category pickers, and sticky bottom trays to establish spatial depth.
- **Surface Contrast:** Active inputs and interactive fields should shift background shade slightly (e.g. from `surface` to `surface-variant`) instead of displaying heavy color fills.

## Elevation System & Shadows
Borders and subtle surface-shifts do most of the "separation" work a shadow would normally do. Shadows are strictly reserved for temporary floating overlays, alerts, or elements indicating active processing.
- **No Shadow (Resting State):** Buttons, inputs, and cards rest flat against the background. Their bounds are defined solely by borders and background offsets.
- **Soft Ambient Occlusion:** When elevation is required, we use multi-layer, low-opacity, highly diffused shadows. Never use a single, dark, harsh drop shadow.
- **Elevation Layers:**
  - *Layer 0 (Flat):* Background and basic layout grids.
  - *Layer 1 (Raised / Hover):* Primary buttons, active cards. Subtle lift via transition.
  - *Layer 2 (Overlays / Toasts):* Floating notification toast, category selector sheet, voice-listening indicator. Uses `shadows.overlay` or `shadows.toast` combined with a sub-pixel border.
- **Dark Mode Elevation:** In dark mode, light does not cast dark shadows. Instead of opacity-based black shadows, elevation is communicated by increasing the brightness of the surface itself (moving from `surface-dark` to `surface-variant-dark`) and adding a subtle, lighter border edge highlight.

## Typography & Hierarchy
Typography defines our entire layout structure. We rely on distinct font choices, clean weights, and careful tracking rather than scale explosion to convey importance.

### Font System
- **Display & Headings:** **Grift** (English / Latin digits). High-impact, architectural serif-like structural forms. Always tracked tight.
- **Body, UI Labels & Forms:** **Instrument Sans** (English / Latin). Elegant, modern geometric sans-serif that reads beautifully in compact lists and form fields.
- **Devanagari (Marathi):** **Hind** (Marathi Display, Headings, and Body). A clean, stable, open-counter typeface designed specifically for Marathi Devanagari text, matched in visual weight.
- **Reference IDs & Numerals:** **Geist Mono** (Technical codes and mono indicators). High-legibility monospaced digits to prevent visual jitter.

### Typography Hierarchy Table
| Token | Font Family | Size (px / rem) | Weight | Line Height | Letter Spacing | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Large** | Grift | 48px / 3.00rem | 700 | 1.10 | -0.02em | Hero text, confirmation checkmark |
| **Display Medium** | Grift | 36px / 2.25rem | 700 | 1.15 | -0.015em | Screen titles, key stats |
| **Heading 1** | Grift | 24px / 1.50rem | 600 | 1.20 | -0.01em | Section titles, category header |
| **Heading 2** | Grift | 20px / 1.25rem | 600 | 1.25 | -0.005em | Group headers, card labels |
| **Body Large** | Instrument Sans | 16px / 1.00rem | 400 | 1.50 | 0.00em | Primary description text |
| **Body Regular** | Instrument Sans | 14px / 0.875rem | 400 | 1.50 | 0.00em | Subheadings, instructions |
| **UI Label** | Instrument Sans | 14px / 0.875rem | 500 | 1.30 | +0.01em | Buttons, navigation links, tabs |
| **Form Input** | Instrument Sans | 16px / 1.00rem | 400 | 1.40 | 0.00em | User input text, placeholders |
| **Caption / Small**| Instrument Sans | 12px / 0.75rem | 400 | 1.40 | +0.01em | Character counters, minor hints |
| **Reference ID** | Geist Mono | 14px / 0.875rem | 500 | 1.20 | +0.05em | Submission IDs, tabular values |

### Marathi (Hind) Scaling Rules
Devanagari characters inherently have higher vertical extensions than Latin glyphs. When rendering Marathi:
- Scale down the `font-size` by roughly 5% if mixed inline with English to ensure alignment.
- Increase the `line-height` by roughly 10% (e.g. changing 1.50 to 1.65) to prevent ascenders and descenders from clipping.
- Do not apply tracking (letter-spacing) to Hind text, as Devanagari character clusters must remain connected.

Before committing Grift to the build: confirm its license covers web font embedding specifically, not just print or branding use, and note it does not need to cover Marathi at all, Hind carries that entirely. Self-host as WOFF2, subset to the Latin glyphs actually used, preload only the weights actually in use.

## Spacing & Spacing Philosophy
Our spacing scale is built strictly on a **4px / 8px baseline grid**. Clean, generous spacing communicates premium design and provides breathing room, ensuring the interface feels calm even when reporting an urgent issue.

- **Proportionality:** Spacing should scale logically. Elements that are conceptually closer together must use smaller spacing tokens, while structural layout transitions use the upper limits of the scale.
- **Negative Space as Content:** White space is not empty space; it is a functional separator that guides the eye. Do not fill empty screen real estate with unnecessary decorative borders or dividers.
- **Spacing Token Map:**
  - `space-1` (4px): Micro alignments, icon-to-label spacing, label-to-input gap.
  - `space-2` (8px): Form input margins, list item spacing, close button offsets.
  - `space-3` (12px): Inside padding for small buttons, inline tag margins.
  - `space-4` (16px): Main body margins, standard card inner padding, input box padding.
  - `space-6` (24px): Gutter between grid categories, space between distinct form fields.
  - `space-8` (32px): Margins between sections, title-to-description gaps.
  - `space-12` (48px): Header to main layout separation.
  - `space-16` (64px): Top/bottom page margins, signature checkmark clearance.

## Grid System
- **Mobile-First Layout:** The design system is optimized for a single-column, 4-column-grid mobile viewport.
- **Maximum Constraint:** Max-width of the layout is capped at `480px` to maintain a unified, phone-in-browser experience even on wide screen resolutions. It must center horizontally.
- **Grid Gutter:** Columns are separated by a strict `space-6` (24px) gutter.
- **Screen Margins:** Padding on the outer left/right edges of the screen is locked to `space-4` (16px) on mobile viewports, expanding to `space-6` (24px) on tablet viewports.

## Touch Target Rules
- **Minimum Interactive Size:** Every touch target must be at least `48px x 48px` to support quick, error-free tapping, even when the user is walking or reporting outdoors.
- **Tap Spacing:** Interactive elements (such as buttons or category tiles) must maintain a minimum distance of `space-2` (8px) from each other to prevent accidental double-activation.
- **Virtual Margins:** For smaller elements (like close buttons or switch toggles) that look smaller than 48px, expand their interactive bounding box using transparent CSS padding rather than sizing the visual element up.

## Component Density
- **Density Level:** NAGRIK uses a **Low-to-Medium density** visual model.
- **Vertical Rhythm:** Space out elements vertically using a consistent progression of `space-4` (16px) and `space-6` (24px).
- **Text Wrap:** Paragraphs should have generous line heights (1.5x) and should never contain more than 60 characters per line to maintain structural reading comfort.

## Focus States
- **Custom Focus Ring:** Default browser-provided outlines (such as the default blue chrome ring) are completely disabled. Focus states are customized to match the neutral system.
- **Contrast & Visibility:** When focused, interactive inputs and buttons must show a clear, visible boundary:
  - *Light Mode:* A 2px solid `border-strong-light` with a 2px outer outline styled as a neutral shadow.
  - *Dark Mode:* A 2px solid `border-strong-dark` with a 2px outer outline.
- **Accessibility:** Ensure the focus ring contrast meets the WCAG 2.2 AA requirement (at least 3:1 contrast ratio against the surrounding background).

## Accessibility Rules
- **Contrast Ratios:** Primary body text and headings must exceed `4.5:1` contrast against the page background. Secondary label colors must exceed `3:1` for large text, and semantic highlights must remain accessible.
- **Semantic HTML Structure:** Use only one `<h1>` per page. Ensure screen readers can traverse the application in logical tab order.
- **ARIA Announcements:** Implement dynamic `aria-live="polite"` regions for elements that update dynamically (e.g., character countdowns, voice typing text buffer updates, queue-to-submitted sync indicators).
- **Flexible Scaling:** All typography tokens must be defined using `rem` relative sizing to ensure the interface layout adapts if the user alters the browser font scale.
- **Motion Controls:** Respect the `prefers-reduced-motion` media query universally. Fall back to instant states or simple opacity fades (transitioning only `opacity`) when motion is disabled.

## Iconography System
- **Visual Style:** Monolinear, 1.5px stroke width, vector icons with rounded cap and join joints. Never use filled icons or heavy visual stickers.
- **Aesthetic:** Neutral and descriptive. Icons must match the calm, clean aesthetic of the UI—avoid playful curves or cartoonish details.
- **Size Envelopes:**
  - *Micro:* `16px` for tag badges, warning indicators.
  - *Standard:* `24px` for category items, input helpers, theme toggles, mic states.
  - *Large:* `48px` or greater, reserved exclusively for the signature checkmark on the confirmation screen.
- **Symmetry:** All icon sets must be centered inside a square bounding box. Label descriptions should align perfectly on the 4px baseline grid.

## Motion Philosophy & Principles
Motion should feel **Calm, Purposeful, and Confident**. Never playful, bouncy, or elastic. Transitions are meant to explain spatial hierarchy and guide focus, not to entertain.
- **Calmness:** Keep ease curves smooth. Avoid sudden snapping or hyper-fast acceleration.
- **Confidence:** Ease curves should feel deliberate. Avoid bouncy spring animations.
- **Strict Constraints:**
  - Animate only `transform` and `opacity`. Never animate layout-disrupting properties like `height`, `width`, or `margin`.
  - Respect `prefers-reduced-motion` everywhere.

### Motion Easing & Durations
- **Productive Curve:** `cubic-bezier(0.22, 1, 0.36, 1)` (smooth, controlled deceleration). Used for standard transitions.
- **Signature Curve:** `cubic-bezier(0.34, 1.56, 0.64, 1)` (slight, elegant overshoot). Reserved for the final confirmation reveal.
- **Micro Duration:** `150ms` (toggles, button presses, interactive states).
- **Transition Duration:** `250ms` (routing, panel swaps, category card navigation).
- **Signature Duration:** `450ms` (drawing the checkmark on the confirmation screen).

## Motion Categories
To ensure motion is implemented consistently, we define six distinct categories:

### 1. Screen Transition
When transitioning between screens (Category → Details → Confirmation), panels should slide horizontally and fade.
- **Behavior:** The incoming screen slides from the right (`transform: translateX(12px)`) while fading in, and the outgoing screen slides slightly to the left while fading out.
- **Duration:** `250ms` using the **Productive Curve**.
- **History Navigation:** Back-navigation slides in reverse (incoming screen slides from the left, outgoing screen slides to the right) to preserve spatial orientation.

### 2. Micro Interaction
Small state feedback loops on interactive elements.
- **Button Hover/Focus:** Focus/hover causes a very slight opacity fade on the text and border, or changes the background tone to `surface-variant`.
- **Button Press (Active):** A minute down-scale (`transform: scale(0.98)`) to mimic a physical button click.
- **Duration:** `150ms` using the **Productive Curve**.

### 3. Loading
When waiting for local file compression or simulated sync checks, the interface displays progress quietly.
- **Behavior:** A thin 2px neutral line at the top of the header that animates its horizontal scale (`transform: scaleX(...)`) from left to right, or a slow opacity pulse (ranging between `0.4` and `0.7`) on skeleton text elements. Never use spinning loops or colorful spinners.
- **Cycle Duration:** `1000ms` continuous loop.

### 4. Voice Recording
When the Speech-to-Text mechanism is listening.
- **Behavior:** A slow, pulsing radial glow surrounding the circular mic button. The scale transitions smoothly between `1.0` and `1.08`, matched with a subtle opacity pulse (between `1.0` and `0.6`). The rhythm must remain slow and steady, emulating calm breathing.
- **Cycle Duration:** `1500ms` breathing pulse.

### 5. Confirmation
The signature moment of the user journey, marking a successful submission.
- **Svg Path Draw:** The checkmark SVG outline draws itself via `stroke-dashoffset`.
- **Reference ID Stagger:** Right after the checkmark finishes drawing, the alphanumeric characters of the reference ID fade and slide up (`translateY(4px)`) in a staggered sequence (each character delayed by `40ms`).
- **Checkmark Duration:** `450ms` using the **Signature Curve**.
- **Character Reveal Duration:** `150ms` per character.

### 6. Theme Switching
Transitioning between Light Mode and Dark Mode.
- **Behavior:** A smooth, global fade of the background and surface colors to avoid visual shock.
- **Duration:** `300ms` linear or productive ease.

## Components
- **Buttons:** radius `md`, generous horizontal padding, primary uses full-strength text-on-surface contrast with no accent fill, secondary is border-only.
- **Cards / category tiles:** radius `lg`, 1px `border`, no shadow at rest, a very subtle background shift on hover/press rather than a shadow-on-hover trick, which reads cheap.
- **Inputs:** radius `md`, 1px `border` at rest, `border-strong` on focus, a visible focus ring styled to the neutral system, never the default blue browser ring.
- **Confirmation checkmark:** the one component allowed real personality, see Motion above.

## Do's and don'ts
- Do keep every screen honest in both themes and both languages before calling it done. Don't fully build the English light-mode version and race to backfill the other three combinations at the end.
- Do use the semantic colors only for error, warning, and success states.
- Don't introduce a brand accent color under any circumstance, including "just for the loading spinner" or "just for the mic while listening." Restraint is the brief.
- Don't add a second display typeface. Grift, Hind, Instrument Sans, and Geist Mono are the whole system.
- Don't animate more than one thing at a time competing for attention. The confirmation moment is the one exception.
- Don't allow any element to wiggle, bounce, or slide outside of the horizontal routing flow.
- Don't use heavy shadows to cover up poor spacing or alignment.

## Tool notes
Antigravity / Claude Code / Cursor: read AGENTS.md first for stack and conventions, this file governs visual tokens only. When generating a component, derive every color and font choice from the tokens above, never introduce a new hex value or font family inline. Run Impeccable's `/detect` before considering any screen finished.
