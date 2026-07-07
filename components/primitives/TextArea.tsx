"use client";

import React from "react";
import { cn } from "../../lib/utils";

export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "w-full rounded-md border border-border bg-surface text-text-primary px-space-4 py-space-3 text-formInput transition-colors duration-150 placeholder:text-text-tertiary resize-none",
          "focus:border-border-strong focus:outline-none focus:ring-0 focus-visible:border-border-strong",
          "custom-focus",
          "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
          className
        )}
        {...props}
      />
    );
  }
);

TextArea.displayName = "TextArea";
export default TextArea;
