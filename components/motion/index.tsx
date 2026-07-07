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

/**
 * Signature success checkmark draw animation.
 * Animated checkmark SVG outline draws itself via stroke-dashoffset.
 * Fallbacks to standard fast fade if reduced motion is preferred.
 */
export const CheckmarkDraw: React.FC = () => {
  const isReduced = useReducedMotion();

  const circleVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1.02,
      opacity: 1,
      transition: {
        duration: isReduced ? 0.2 : 0.45,
        ease: (isReduced ? "linear" : easeProductive) as "linear" | [number, number, number, number],
      },
    },
  };

  const checkVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: {
        delay: isReduced ? 0.05 : 0.2, // starts mid-way through circle draw
        duration: isReduced ? 0.2 : 0.3,
        ease: (isReduced ? "linear" : easeSignature) as "linear" | [number, number, number, number],
      },
    },
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
      className="w-16 h-16 text-success shrink-0"
    >
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        variants={circleVariants}
        initial="initial"
        animate="animate"
      />
      <motion.path
        d="M16 26l7 7 14-14"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={checkVariants}
        initial="initial"
        animate="animate"
      />
    </svg>
  );
};

interface StaggeredRefIdProps {
  id: string;
}

/**
 * Technical Reference ID stagger reveal.
 * Characters fade and slide up in sequence after the checkmark finishes.
 * Fallbacks to simple mono text if reduced motion is preferred.
 */
export const StaggeredRefId: React.FC<StaggeredRefIdProps> = ({ id }) => {
  const isReduced = useReducedMotion();

  if (isReduced) {
    return <span className="font-mono">{id}</span>;
  }

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.04, // 40ms delay per character
        delayChildren: 0.5,   // starts right after checkmark draws (~500ms)
      },
    },
  };

  const charVariants = {
    initial: { opacity: 0, y: 4 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.15, // 150ms per character
        ease: easeProductive,
      },
    },
  };

  return (
    <motion.span
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="inline-flex font-mono"
    >
      {id.split("").map((char, index) => (
        <motion.span key={index} variants={charVariants} className="inline-block">
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
};
