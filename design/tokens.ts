import { colors } from "./colors";
import { spacing } from "./spacing";
import { radius } from "./radius";
import { typography } from "./typography";
import { motion } from "./motion";

export const tokens = {
  colors,
  spacing,
  radius,
  typography,
  motion,
  shadows: {
    light: {
      overlay: "0 4px 20px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02)",
      toast: "0 8px 32px rgba(0, 0, 0, 0.06)",
    },
    dark: {
      overlay: "0 4px 24px rgba(0, 0, 0, 0.4), 0 2px 12px rgba(0, 0, 0, 0.2)",
      toast: "0 8px 36px rgba(0, 0, 0, 0.5)",
    },
  },
  zIndex: {
    base: 0,
    raised: 10,
    overlay: 100,
    toast: 200,
  },
} as const;

export { colors, spacing, radius, typography, motion };
export default tokens;
export type DesignTokens = typeof tokens;
