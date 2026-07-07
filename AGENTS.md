# AGENTS.md

Instructions and guidelines for AI agents working on this repository.

Refer to [PRD.md](file:///c:/Users/porje/Coding/Projects/potens-assignment/PRD.md) for requirements and [DESIGN.md](file:///c:/Users/porje/Coding/Projects/potens-assignment/DESIGN.md) for design system specs.

---

## Technical Stack
- **Framework & Core**: Next.js 15 (App Router), TypeScript
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Typography**: 
  - Grift (Primary English Display)
  - Hind (Primary Marathi Display/Body)
  - Instrument Sans (Secondary Display/Body)
  - Geist Mono (Numerals & Reference IDs)
- **State Management**: No external state libraries. Vanilla React state/hooks combined with a single localStorage module.

---

## Folder Structure
```text
app/
  (flow)/
    category/
    details/
    confirmation/

components/
  primitives/
  forms/
  feedback/
  motion/
  layout/
  typography/
  icons/

design/
  tokens.ts
  colors.ts
  spacing.ts
  radius.ts
  typography.ts
  motion.ts

content/
  en.json
  mr.json

hooks/
  useLanguage.ts
  useSpeech.ts
  useLocalStorage.ts

lib/
  storage/
  speech/
  i18n/
  pwa/
  utils/

public/
  manifest.json
  sw.js
  icons/

styles/
  globals.css
```

---

## Coding Conventions
- **Zero Hardcoding**: 
  - Never hardcode strings. All copy must resolve through translation files (`en.json`, `mr.json`).
  - Never hardcode colors, spacing, or radius. Use design tokens defined under `design/`.
- **Component Architecture**: 
  - Never create duplicate components.
  - Prefer composition over rigid component configurations.
- **Architectural Principles**:
  - **Mobile First**: Design and optimize for narrow viewports first. Check desktop scalability only after mobile is robust.
  - **Accessibility First**: Meet WCAG guidelines, enforce proper semantic structure, and maintain clear focus states.
  - **Performance First**: Optimize for throttled "Slow 3G" networks. Keep the bundle size lightweight.
  - **Animation Discipline**: Apply animations only when meaningful. Animate `transform` and `opacity` exclusively, and respect `prefers-reduced-motion`.
  - **No Unapproved Dependencies**: Never introduce UI or state libraries without explicit approval.

---

## PWA Setup
- Do not use `next-pwa` (unmaintained).
- **Baseline**: Implement a hand-written service worker (`sw.js`) that precaches the shell, uses stale-while-revalidate for HTML, and cache-first for hashed assets and fonts.
- **Manifest**: Define a valid `manifest.json` referencing required 192x192 and 512x512 icons, `display: standalone`, and styling tokens matching `DESIGN.md`.
- **Offline Sync (Stretch Goal)**: If attempting offline-first queue sync, integrate Serwist (`@serwist/next`, `@serwist/precaching`, `@serwist/sw`, `idb`) specifically for its IndexedDB sync capabilities.

---

## Skill Usage
Ensure developer/agent tools are initialized:
```bash
npx skills add emilkowalski/skills
npx impeccable install
npx skills add Leonxlnx/taste-skill --skill "design-taste-frontend"
```
- Use `soft-skill` when polishing UI/aesthetics.
- Use `emil-design-eng` and `review-animations` when building/reviewing transitions.
- Run Impeccable's `/detect` to scan the UI before committing.
- Use `output-skill` to safely manage partial progress as limits approach.

---

## Build Sequence
1. **Design System Integration**: Map color, typography, spacing, radius, and motion tokens as CSS variables/Tailwind configurations.
2. **Static Build**: Develop all three screens (Category, Details, Confirmation) for both English/Marathi and light/dark modes.
3. **Motion Layer**: Implement the signature micro-interaction and state transition animations.
4. **Functional Layer**: Wire form logic, speech-to-text input, localStorage storage, service worker, and web app manifest.
5. **Performance Pass**: Run Lighthouse audits, profile under throttled Slow 3G network conditions, and ensure clean font/assets loading.
6. **Resilience & Stretch Goals**: Implement offline queue sync, satisfy WCAG guidelines, and handle service worker installation states.
7. **Documentation & Review**: Finalize README, clean up git history, compile AI use log, and record submission video.
