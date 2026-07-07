# Nagrik (नागरिक) — Multilingual Civic Complaint PWA

Nagrik is a mobile-first, accent-free, typography-focused civic reporting Progressive Web Application (PWA) built for Indian citizens. Designed to operate under real-world Slow 3G network conditions, it enables users to submit report tickets (potholes, garbage, water issues, etc.) in under 60 seconds with offline queue support and localized Web Speech dictation.

---

## 1. Project Screenshots

### Core Application Flow
The application layout uses a restrained, high-contrast visual system tailored for mobile viewports.

| 1. Category Selection | 2. Report Details Form | 3. Submission & Live Tracking |
| :---: | :---: | :---: |
| ![Category Selection Screen](/public/screen_category.png) | ![Report Details Screen](/public/screen_details.png) | ![Confirmation Screen](/public/screen_confirmation.png) |

---

## 2. Verified Lighthouse Audit
Nagrik achieves a **perfect 100/100 sweep** across all audited categories on emulated mobile viewports.

![Lighthouse Audit Scores](/public/lighthouse_report.png)

---

## 3. Design Decisions & System Specs

Nagrik is designed to feel serious, calm, and functional, resembling utility-focused government registries.

- **Zero-Accent Palette**: Styled strictly in neutrals (pure grays, whites, and blacks). Visual hierarchy is achieved entirely through layout contrast, sub-pixel borders, and typographic weights rather than decorative coloring.
- **Typography System**:
  - **Primary Display**: **Grift** (custom serif). High visual impact for titles.
  - **Devanagari (Marathi)**: **Hind**. Scaled dynamically to 95% font-size and 110% line-height to prevent vertical ascender clipping and balance visually with Grift.
  - **Primary Body/Forms**: **Instrument Sans**. High legibility sans-serif.
  - **Reference IDs & Numbers**: **Geist Mono** for visual tabular stability.
- **State-Synced URL Routing**: Transitions use URL query parameters (`?step=category`, `?step=details`, `?step=confirmation`) instead of standard subdirectory route shifts. This prevents Next.js layout resets, avoids network round-trips under Slow 3G, and preserves hardware/browser back-button navigation.
- **Tacit Micro-Interactions**: Interactions are engineered to feel functional:
  - **Checkmark Draw**: The confirmation checkmark draws itself dynamically on load using an SVG path animation with customized ease-out overshoot.
  - **Tabular ID Reveal**: The Reference ID characters fade in sequentially with a staggered micro-delay.
  - **Hover Translations**: UI elements slide subtly or translate on mouse hover (restricted strictly to pointer-fine fine-pointing devices).
- **Reduced Motion Support**: Employs a custom `ReducedMotionWrapper`. If the user's OS has `prefers-reduced-motion` active, all layout slides, scaling transitions, and checkmark drawing fall back instantly to immediate opacity changes.

---

## 4. PWA & Offline Sync Strategy

- **Service Worker (`public/sw.js`)**: A hand-written service worker that implements:
  - **Precaching**: Immediately caches the shell skeleton and essential static resources.
  - **Cache-First**: Applied to hashed client-side webpack chunks (`/_next/static/`) and local subset web fonts (`/fonts/`).
  - **Stale-While-Revalidate**: Applied to HTML page paths to serve cached content instantly while updating the cache in the background.
- **Offline Submission Queue**: If a user submits a report when `navigator.onLine` is false, Nagrik intercepts the save, flags the entry status as `queued`, and persists it in `localStorage`. 
- **Auto-Sync**: A window-level online restorer listener immediately fires when the network recovers, syncing all queued entries to `submitted` status and dispatching global custom event triggers to update active UI elements in real-time.
- **Install Prompt Banner**: A customized install prompt that handles `beforeinstallprompt` events and integrates smoothly with iOS and Android notch/safe-area spacing.

---

## 5. Run Instructions

Ensure your node modules are installed first:
```bash
npm install
```

### Development Server
Runs the dev server with hot module replacement (HMR) and automatically unregisters cached service workers to avoid development-caching issues:
```bash
npm run dev
```

### Production Build
Builds the optimized production client and runs the production server:
```bash
npm run build
npm run start
```

### Code Standards Check
Verify code format rules and syntax standards:
```bash
npm run lint
```

---

## 6. Known Limitations

- **Web Speech API Browser Matrix**: Fully supported in Chromium-based mobile browsers (Chrome for Android). Falls back gracefully to textarea typing on Safari/iOS.
- **Storage Quota**: LocalStorage has a strict 5MB quota. Captured photos are dynamically downscaled to `800px` max-width and compressed to JPEG `0.7` quality (under 100KB) to prevent storage exhaustion.
- **Simulated Tracker**: The Status Tracker timeline is client-side only (Submitted -> Under Review) and does not fetch live database updates.

---

## 7. What We Would Build Next

1. **Database Adapter Layer**: Swap out the client-side `localStorage` facade inside `lib/storage/index.ts` with API/fetch requests linking to PostgreSQL or MongoDB endpoints, keeping the presentation layer completely decoupled.
2. **Background Sync API**: Integrate the native Service Worker `SyncManager` API to run background sync jobs even when the browser tab is closed.
3. **Session Authentication**: Add a JWT auth layer to authenticate civic users and personalize the status tracker board.

---

## 8. Git Workflow Approach

All phases of implementation were developed incrementally:
1. **Local Iteration**: Each phase was built locally, tested, and polished to resolve errors.
2. **Branch Management**: Incremental progress was pushed to the `dev` branch.
3. **Verification**: Pushed updates were reviewed on live environment wrappers.
4. **Main Integration**: Pull Requests (PRs) were raised from `dev` and merged into the `main` branch (production release) once fully verified.

---

## 9. AI Usage Log

This project was built using AI pair-programming and planning assistants. We believe in complete transparency and record our tool usages as follows:

| Assistant / Tool | Approx. Message Count | Usage Description |
| :--- | :---: | :--- |
| **Claude (Anthropic)** | ~5 messages | Used during the initial planning phase to write the Product Requirements Document (`PRD.md`), design spec definitions (`DESIGN.md`), and guidelines (`AGENTS.md`). |
| **ChatGPT (OpenAI)** | ~13 messages | Used to review the markdown design parameters, architect the decoupled routing system (`ARCHITECTURE.md`), and divide the project implementation into 10 structured phases. |
| **Antigravity (Gemini/Claude)** | ~75 messages - Divided into 13 phases | Handled execution of Phase 0 to Phase 12. Segmented across 13 isolated, task-focused conversations (averaging 5–6 messages per phase) for modular implementation, local testing, and branch verification. |

---
*Nagrik is confidential and developed in Pune, India for Potens IT Services and Consultancy Pvt. Ltd. hiring process.*
