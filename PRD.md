# Product Requirement Document (PRD) — Nagrik

## 1. Executive Summary & Product Overview
Nagrik is a premium, multilingual civic complaint reporting Progressive Web App (PWA) designed for Indian citizens to quickly and efficiently report local civic issues (such as potholes, overflowing garbage, water supply failures, broken streetlights, and public safety concerns). 

The application is engineered to be a lightweight, mobile-first utility that operates reliably under real-world connectivity constraints. It allows citizens to submit reports in under 60 seconds without requiring authentication or backend setup, utilizing local storage for persistence.

## 2. Key Success Metrics
To ensure the product meets high standards of performance, usability, and technical excellence, the implementation must satisfy the following measurable success metrics:
*   **Complaint Completion Time**: A user must be able to successfully submit a civic complaint in **under 60 seconds** from initial load.
*   **Lighthouse Performance**: Score must be **>= 95** on simulated mobile devices.
*   **Lighthouse Accessibility**: Score must be **>= 95** to guarantee compliance with inclusive design standards.
*   **Cumulative Layout Shift (CLS)**: Must be **< 0.05** to ensure visual stability during loading and interaction.
*   **Responsive Breakpoints**: The layout must be fully responsive, starting from **360px width onwards**, ensuring compatibility with entry-level mobile viewports.
*   **Installability**: The application must be a fully compliant, installable PWA passing all native installability criteria.
*   **Flow Continuity**: **Zero dead ends** in the user flow; navigation must support seamless recovery, back-button history, and error-handling paths.

## 3. UX Principles
The user experience of Nagrik is built on the following foundational principles to accommodate users in potentially stressful or hurried real-world environments:
*   **One-Handed Usage**: Primary interactive elements (such as category buttons, micro-interactions, and navigation controls) must be positioned within the natural sweep of a thumb to allow comfortable one-handed operation on mobile devices.
*   **Minimal Cognitive Load**: Design with high visual clarity, keeping forms minimal, options clear, and avoiding unnecessary distractions. Use clear iconography and translated labels to assist quick comprehension.
*   **Trust Before Delight**: Ensure the application feels stable, secure, and transparent. The interface must clearly indicate current status (e.g., offline queueing, local storage safety, speech recognition feedback) before displaying decorative animations.
*   **Typography-First Hierarchy**: Prioritize typographic sizing, weights, and high-contrast styling over heavy graphical decoration to structure the interface. This ensures readability under bright outdoor sunlight or low-light conditions.
*   **Large Touch Targets**: All interactive elements must maintain a minimum touch target size of **44x44 CSS pixels** to prevent mis-clicks, particularly when the user is walking or holding a phone with one hand.
*   **Progressive Disclosure**: Only show the information and controls necessary for the current step. Do not clutter the Category screen with Details inputs, and hide advanced voice feedback until the user activates voice input.

## 4. Target Audience
Civic residents standing directly at the site of a problem (e.g., a pothole, a downed wire, or an overflowing bin). Users are likely on mobile devices using mobile data (often throttled or unstable) rather than high-speed Wi-Fi. They may be multitasking, possibly holding items in one hand, and may prefer using voice input or reading Marathi rather than typing in English. The application must be accessible to non-technical users who may only use the app occasionally.

## 5. Languages & Internationalization (i18n)
*   **Supported Languages**: English (EN) and Marathi (MR), accessible via a global language toggle.
*   **Completeness**: Every label, button, input placeholder, validation message, and screen state must be translated. Partial or mixed-language states are not permitted.
*   **Architecture**: All strings must be externalized in a central translation dictionary rather than hardcoded in React components (see `lib/i18n.ts`). Language preference must persist across sessions.

## 6. Functional Specifications: The Three Screens
To keep the scope minimal and focused, the app consists of a three-screen workflow:

### Screen 1: Category Selection
*   **Category Grid/List**: A grid or list of the default civic issue categories.
*   **Selection & Navigation**: Single-select interaction. Tapping a category highlights it and automatically transitions the user to the Details screen.
*   **State Persistence**: Returning to this screen from the Details screen must preserve the previously selected category.
*   **Accessibility**: Interactive cards must be fully focusable and navigable via keyboard/switch-access.

### Screen 2: Details Form
*   **Description Text Field**: Free-text textarea for describing the issue.
    *   Maximum limit: **500 characters**.
    *   A character counter must be displayed as the character count approaches the limit.
    *   Must display a translated placeholder.
*   **Optional Image Upload**:
    *   Supports attaching exactly one photo via camera capture or gallery selection.
    *   Displayed as a preview thumbnail with the option to remove or retake the photo.
    *   **Data Model**: Compressed and saved as a Base64 data URL within the report object. No backend upload.
*   **Voice Input**:
    *   A prominent microphone button that activates voice dictation using the Web Speech API.
    *   Must dynamically detect API support. If the Web Speech API is unsupported by the browser, the button must be gracefully hidden or disabled without affecting the text input path.
*   **Validation**: Form submission must validate that the description is not empty. Empty submissions must show a clear, localized inline error message.

### Screen 3: Submission Confirmation
*   **Reference ID**: A unique, professional reference identifier (e.g., `RD-7X9K2`) formatted according to the specification.
*   **Summary Recap**: Displays a recap of the reported category and description.
*   **Next Steps**: A short localized message outlining what happens next.
*   **Offline Queue Notice**: If the offline-first stretch goal is active, this screen must display an honest queue status ("queued offline, will sync when online") rather than implying the report reached a live server.
*   **Micro-Interaction**: The confirmation checkmark must perform a signature SVG draw animation on load.

## 7. Default Categories & Reference ID Prefix Map
The application supports the following issue categories, each mapping to a unique prefix for Reference ID generation:
*   **Roads & Potholes**: Prefix `RD` (e.g., `RD-xxxxx`)
*   **Garbage & Sanitation**: Prefix `GB` (e.g., `GB-xxxxx`)
*   **Water Supply**: Prefix `WS` (e.g., `WS-xxxxx`)
*   **Streetlights**: Prefix `SL` (e.g., `SL-xxxxx`)
*   **Public Safety**: Prefix `PS` (e.g., `PS-xxxxx`)
*   **Other**: Prefix `OT` (e.g., `OT-xxxxx`)

## 8. Data Architecture (localStorage)
Nagrik stores all submissions locally in browser storage. The schema for a submission record is defined as:
```typescript
interface Submission {
  id: string;             // Reference ID (e.g., "RD-7X9K2")
  category: string;       // Unique category key (e.g., "roads")
  description: string;    // User-entered text
  photo: string | null;   // Compressed base64 data URL or null
  usedVoiceInput: boolean;// Track if Web Speech API was utilized
  createdAt: string;      // ISO timestamp
  status: "queued" | "submitted"; // Queued only when offline-first mode is active
  language: "en" | "mr";  // Language active at the time of submission
}
```
All reading and writing of submissions must be consolidated within a single module (e.g., `lib/storage.ts`) to prevent architectural fragmentation.

## 9. Reference ID Generation
The reference ID must look realistic and professional:
*   **Format**: `[Category Prefix]-[5 Alphanumeric Characters]` (e.g., `RD-B8D2K`).
*   **Case**: Uppercase alphanumeric characters.
*   **Generation**: Client-side utility function in `lib/reference-id.ts`.

## 10. Voice Input (Web Speech API)
*   **API**: standard `SpeechRecognition` or `webkitSpeechRecognition` fallback.
*   **Behavior**: Start/stop on tap. Visual cues must indicate when the application is actively listening (with a subtle supporting animation).
*   **Fallback**: In case of errors or lack of browser support, the microphone control is disabled/hidden, leaving the manual keyboard text area fully operational.

## 11. Progressive Web App (PWA) Specifications
*   **Web App Manifest (`public/manifest.json`)**:
    *   Must specify `name` ("Nagrik"), `short_name` ("Nagrik"), `start_url` ("./"), `display` ("standalone").
    *   Must include high-resolution icons (192x192 and 512x512 pixels).
    *   Colors must be mapped to CSS design tokens.
*   **Service Worker (`public/sw.js`)**:
    *   Precaches the application shell.
    *   Implements a Stale-While-Revalidate caching strategy for HTML/page routes.
    *   Implements a Cache-First strategy for hashed assets (JS/CSS) and fonts.
*   **Installability**: The application must meet standard Chromium install criteria (valid manifest, registered service worker, secure context or localhost).

## 12. Performance & Resilience
*   **Network Throttling**: The application must be tested and remain fully functional under simulated **Slow 3G** connection speeds.
*   **Asset Optimization**: Font weights and icons must be minimized to avoid blocking paint.
*   **Layout Stability**: Content must load with correct dimensions to prevent layout shifts.

## 13. Micro-Interactions & Animation Guidelines
*   **Signature Confirmation Moment**: Upon successful submission, the confirmation screen features a checkmark icon that animates its SVG stroke (`stroke-dashoffset`) in a smooth draw effect, followed by a staggered reveal of the Reference ID characters.
*   **Supporting Motion**: A subtle pulsate animation on the microphone button during recording is allowed.
*   **Performance & Accessibility**:
    *   Animate only `transform` and `opacity` to avoid layout thrashing.
    *   Respect the CSS media query `prefers-reduced-motion` by disabling or simplifying animations if the user has requested reduced motion.

## 14. Priority & Scope Tiers

### P0 (Required Baseline)
*   Fully functional 3-screen workflow (Category, Details, Confirmation).
*   Complete English/Marathi internationalization toggle.
*   Web Speech API voice transcription integration.
*   Compliant, installable PWA structure with service worker cache.
*   Optimized performance under Slow 3G network conditions.
*   Signature SVG confirmation animation.

### P1 (Target Goals)
*   **Offline Queueing (Stretch Goal)**: Enable form submissions while completely offline. Submissions are queued in local storage (`status: "queued"`) and automatically synchronized once network connection is restored, showing a visual sync indicator.
*   **Accessibility Compliance**: Maintain strict WCAG 2.2 AA standards (accessible color contrast, tab focus order, semantic headings, and descriptive alt text).

### P2 (Bonus Features)
*   **Local Status Tracker**: A client-side view of past reports allowing the user to track simulated report status (Submitted → Under Review → In Progress → Resolved) dynamically updated over time.

## 15. Out of Scope
To ensure delivery within constraints, the following features are strictly out of scope:
*   Backend database integration or API authentication.
*   User login, profile creation, or account management.
*   Real-world geolocation API or maps integration (location is inferred from report category/description).
*   Browser push notifications.
*   Third-party state management libraries.

## 16. Acceptance Criteria Checklist
*   [ ] The application contains exactly 3 screens: Category Selection, Details Form, Confirmation.
*   [ ] User interface is fully responsive from **360px width onwards**.
*   [ ] Full English/Marathi language toggle translates all text, labels, and placeholders.
*   [ ] Web Speech API transcription successfully enters text into the description field (where supported).
*   [ ] Submissions are saved to `localStorage` under a unified data model.
*   [ ] PWA install criteria are met; service worker precaches shell and caches static assets.
*   [ ] Confirmation screen plays the checkmark drawing SVG animation and staggers the Reference ID reveal.
*   [ ] Core performance and accessibility metrics (>= 95 Lighthouse, CLS < 0.05) are satisfied.
