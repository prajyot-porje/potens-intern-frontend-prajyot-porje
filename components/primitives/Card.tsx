"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { cn } from "../../lib/utils";

export interface CardProps extends HTMLMotionProps<"div"> {
  interactive?: boolean;
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ interactive = false, className, children, ...props }, ref) => {
    const isReduced = useReducedMotion();

    const baseStyles = cn(
      "bg-surface rounded-lg border border-border transition-colors duration-150 p-space-4 text-text-primary",
      interactive && "cursor-pointer hover:bg-surface-variant focus-visible:bg-surface-variant custom-focus"
    );

    if (interactive) {
      return (
        <motion.div
          ref={ref}
          className={cn(baseStyles, className)}
          role="button"
          tabIndex={0}
          whileTap={isReduced ? undefined : { scale: 0.99 }}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(baseStyles, className)}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
export default Card;
