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
        "bg-text-primary text-bg border border-text-primary hover:bg-primary-hover"
      ),
      secondary: cn(
        "bg-transparent text-text-primary border border-border-strong hover:bg-surface-variant"
      ),
      success: cn(
        "bg-success text-white border border-success dark:text-bg hover:opacity-90"
      ),
      warning: cn(
        "bg-warning text-white border border-warning dark:text-bg hover:opacity-90"
      ),
      error: cn(
        "bg-error text-white border border-error dark:text-bg hover:opacity-90"
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
