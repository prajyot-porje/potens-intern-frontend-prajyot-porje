"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

export interface CardProps extends HTMLMotionProps<"div"> {
  interactive?: boolean;
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ interactive = false, className, children, ...props }, ref) => {

    const baseStyles = cn(
      "bg-surface rounded-lg border border-border p-space-4 text-text-primary",
      "transition-[background-color,border-color,transform,box-shadow] duration-150 ease-out",
      interactive && "cursor-pointer custom-focus motion-safe:active:scale-[0.98] interactive-card"
    );

    if (interactive) {
      return (
        <motion.div
          ref={ref}
          className={cn(baseStyles, className)}
          role="button"
          tabIndex={0}
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
