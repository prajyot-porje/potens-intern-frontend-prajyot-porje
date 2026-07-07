"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", fullWidth = false, className, children, ...props }, ref) => {

    const baseStyles = cn(
      "inline-flex items-center justify-center rounded-md font-medium text-uiLabel cursor-pointer select-none",
      "transition-[color,background-color,border-color,transform] duration-150 ease-out",
      "min-h-[48px] min-w-[48px] px-space-6 py-space-3", // Min touch target: 48x48px
      "custom-focus motion-safe:active:scale-[0.97]",
      fullWidth ? "w-full" : "w-auto"
    );

    const variantStyles = {
      primary: cn(
        // High-contrast text-on-surface, no color accents
        // Light: Black bg, Off-White text. Dark: Off-White bg, Black text.
        "bg-[#1A1A1F] text-[#FAFAFA] border border-[#1A1A1F]",
        "dark:bg-[#F2F2F4] dark:text-[#0A0A0C] dark:border-[#F2F2F4]",
        // Shallow hover gradients
        "hover:bg-[#24242B] dark:hover:bg-[#E2E2E6]"
      ),
      secondary: cn(
        // Transparent surface, border-only
        "bg-transparent text-text-primary border border-border-strong",
        "hover:bg-surface-variant"
      ),
      success: cn(
        // Clean semantic green
        "bg-[#3F7A5C] text-white border border-[#3F7A5C]",
        "dark:bg-[#6BAE8A] dark:text-[#0A0A0C] dark:border-[#6BAE8A]",
        "hover:opacity-90"
      ),
      warning: cn(
        // Clean semantic amber/gold
        "bg-[#B8862E] text-white border border-[#B8862E]",
        "dark:bg-[#D9A94F] dark:text-[#0A0A0C] dark:border-[#D9A94F]",
        "hover:opacity-90"
      ),
      error: cn(
        // Clean semantic red
        "bg-[#C4453A] text-white border border-[#C4453A]",
        "dark:bg-[#E8776D] dark:text-[#0A0A0C] dark:border-[#E8776D]",
        "hover:opacity-90"
      ),
    };

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export default Button;
