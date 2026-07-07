export const motion = {
  easings: {
    productive: "cubic-bezier(0.22, 1, 0.36, 1)",
    signature: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  durations: {
    micro: 0.15,       // 150ms for toggles, micro scale interactions
    transition: 0.25,  // 250ms for page-to-page navigation, sliding panels
    signature: 0.45,   // 450ms for success checkmark draw
    cycle: 1.0,        // 1000ms loop for simple loading pulses
    breath: 1.5,       // 1500ms loop for listening pulse
  },
} as const;

export type EasingCurve = keyof typeof motion.easings;
export type MotionDuration = keyof typeof motion.durations;
