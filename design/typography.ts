export const typography = {
  fonts: {
    display: "var(--font-display)",
    heading: "var(--font-heading)",
    body: "var(--font-body)",
    marathi: "var(--font-marathi)",
    mono: "var(--font-mono)",
  },
  tokens: {
    displayLarge: {
      fontSize: "3.00rem", // 48px
      fontWeight: "700",
      lineHeight: "1.10",
      letterSpacing: "-0.02em",
    },
    displayMedium: {
      fontSize: "2.25rem", // 36px
      fontWeight: "700",
      lineHeight: "1.15",
      letterSpacing: "-0.015em",
    },
    h1: {
      fontSize: "1.50rem", // 24px
      fontWeight: "600",
      lineHeight: "1.20",
      letterSpacing: "-0.01em",
    },
    h2: {
      fontSize: "1.25rem", // 20px
      fontWeight: "600",
      lineHeight: "1.25",
      letterSpacing: "-0.005em",
    },
    bodyLarge: {
      fontSize: "1.00rem", // 16px
      fontWeight: "400",
      lineHeight: "1.50",
      letterSpacing: "0.00em",
    },
    bodyRegular: {
      fontSize: "0.875rem", // 14px
      fontWeight: "400",
      lineHeight: "1.50",
      letterSpacing: "0.00em",
    },
    uiLabel: {
      fontSize: "0.875rem", // 14px
      fontWeight: "500",
      lineHeight: "1.30",
      letterSpacing: "+0.01em",
    },
    formInput: {
      fontSize: "1.00rem", // 16px
      fontWeight: "400",
      lineHeight: "1.40",
      letterSpacing: "0.00em",
    },
    caption: {
      fontSize: "0.75rem", // 12px
      fontWeight: "400",
      lineHeight: "1.40",
      letterSpacing: "+0.01em",
    },
    referenceId: {
      fontSize: "0.875rem", // 14px
      fontWeight: "500",
      lineHeight: "1.20",
      letterSpacing: "+0.05em",
    },
  },
  // Marathi scaling adjustments as specified in DESIGN.md
  marathiAdjustment: {
    fontSizeScale: 0.95, // Scale down size by 5%
    lineHeightScale: 1.10, // Scale up line height by 10%
    letterSpacing: "0.00em", // No letter spacing
  },
} as const;

export type TypographyToken = keyof typeof typography.tokens;
export type FontType = keyof typeof typography.fonts;
