"use client";

import React from "react";
import { cn } from "../../lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full rounded-md border border-border bg-surface text-text-primary px-space-4 py-space-3 text-formInput transition-all duration-150 placeholder:text-text-tertiary",
          "min-h-[48px]", // Min touch target: 48px
          "focus:border-border-strong focus:outline-none focus:shadow-[0_0_0_2px_var(--bg),0_0_0_4px_var(--border-strong)]",
          "custom-focus",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export default Input;
