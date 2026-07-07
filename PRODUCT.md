# Product

## Register

product

## Users
Civic residents standing directly at the site of a problem (e.g., a pothole, a downed wire, or an overflowing bin) in Indian cities. They are likely using mobile devices outdoors with throttled or unstable connection speeds, possibly holding items in one hand, requiring one-handed accessibility and zero unnecessary cognitive load.

## Product Purpose
Nagrik is an ultra-premium, neutral-only civic complaint reporting Progressive Web App (PWA) that allows citizens to report local civic issues in under 60 seconds without requiring authentication or backend setup, utilizing local storage for client-side persistence and queuing reports when offline.

## Brand Personality
- Restrained (zero brand accent color, neutral-only colors, extremely clean aesthetic)
- Trustworthy (clear indicators of system state, network status, and local data persistence)
- Precise (architectural serif-like typography for display, high-legibility monospaced digits)

## Anti-references
- "AI SaaS template" style: Banned centered heroes with purple/blue gradients, identical cards, generic glassmorphic cards on everything, emojis in headings/buttons.
- Playful / cartoonish aesthetics: No bounce/elastic animations, no cartoon icons, no saturated stock photos.
- Cluttered forms: Banned input labels inside placeholders, double-wrapped CTA buttons, duplicate call-to-action intent.

## Design Principles
1. **Calm Utility**: The layout and styling must be extremely clean and typography-led, conveying authority and focus.
2. **Resilient Architecture**: Designed for instant response and offline tolerance, maintaining usability even on slow or absent network connections.
3. **One-Handed Usability**: Critical touch points (buttons, card select) are easy to hit with the thumb, ensuring smooth outdoors operation.
4. **Absolute Restraint**: Color is reserved strictly for semantic states (success, warning, error), never used for decoration.

## Accessibility & Inclusion
- WCAG 2.2 AA compliant.
- Minimum 48x48px touch targets for interactive elements, separated by at least 8px.
- Enforced dark/light color contrast ratios (>= 4.5:1 for body, >= 3:1 for large display text).
- Explicit HTML/aria-live indicators for screen reader compatibility.
- Built-in reduced-motion hooks that replace translations/scales with instant swaps or opacity fades.
