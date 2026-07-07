"use client";

import React from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { motion as motionTokens } from "../../design/motion";

// Re-export AnimatePresence wrapper for cleaner imports
export const AnimatePresenceWrapper = AnimatePresence;

// Define variants that respect the design tokens
export const easeProductive: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const easeSignature: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

export const durationTokens = {
  micro: motionTokens.durations.micro,
  transition: motionTokens.durations.transition,
  signature: motionTokens.durations.signature,
};

/**
 * Standard Fade In Variants
 */
export const fadeInVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: durationTokens.transition,
      ease: easeProductive,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durationTokens.transition,
      ease: easeProductive,
    },
  },
};

/**
 * Slide In Up Variants (used for modals, sheets, and lists)
 */
export const slideInUpVariants = {
  initial: (reduced: boolean) => ({
    opacity: 0,
    y: reduced ? 0 : 12,
  }),
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durationTokens.transition,
      ease: easeProductive,
    },
  },
  exit: (reduced: boolean) => ({
    opacity: 0,
    y: reduced ? 0 : 8,
    transition: {
      duration: durationTokens.transition,
      ease: easeProductive,
    },
  }),
};

/**
 * Horizontal Slide Transition for screen navigation
 * (Category -> Details -> Confirmation)
 * Custom parameter determines the direction of the slide.
 */
export const slideInHorizontalVariants = {
  initial: (custom: { direction: "forward" | "backward"; reduced: boolean }) => ({
    opacity: 0,
    x: custom.reduced ? 0 : custom.direction === "forward" ? 16 : -16,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durationTokens.transition,
      ease: easeProductive,
    },
  },
  exit: (custom: { direction: "forward" | "backward"; reduced: boolean }) => ({
    opacity: 0,
    x: custom.reduced ? 0 : custom.direction === "forward" ? -12 : 12,
    transition: {
      duration: durationTokens.transition,
      ease: easeProductive,
    },
  }),
};

/**
 * Scale In Variants (used for buttons, checkmarks, card pop-ins)
 */
export const scaleInVariants = {
  initial: (reduced: boolean) => ({
    opacity: 0,
    scale: reduced ? 1 : 0.95,
  }),
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durationTokens.transition,
      ease: easeProductive,
    },
  },
  exit: (reduced: boolean) => ({
    opacity: 0,
    scale: reduced ? 1 : 0.95,
    transition: {
      duration: durationTokens.transition,
      ease: easeProductive,
    },
  }),
};

interface ReducedMotionWrapperProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variantType?: "fade" | "slideUp" | "slideHorizontal" | "scale";
  direction?: "forward" | "backward";
}

/**
 * A wrapper component that automatically injects variants and custom values
 * based on browser reduced motion preferences.
 */
export const ReducedMotionWrapper: React.FC<ReducedMotionWrapperProps> = ({
  children,
  variantType = "fade",
  direction = "forward",
  className,
  ...props
}) => {
  const isReduced = useReducedMotion();

  const getVariants = () => {
    switch (variantType) {
      case "slideUp":
        return slideInUpVariants;
      case "slideHorizontal":
        return slideInHorizontalVariants;
      case "scale":
        return scaleInVariants;
      case "fade":
      default:
        return fadeInVariants;
    }
  };

  const customVal =
    variantType === "slideHorizontal"
      ? { direction, reduced: isReduced }
      : isReduced;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      custom={customVal}
      variants={getVariants()}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
