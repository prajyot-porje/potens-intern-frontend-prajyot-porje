import React from "react";
import { cn } from "../../lib/utils";

interface MonoTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const MonoText: React.FC<MonoTextProps> = ({ className, children, style, ...props }) => {
  // Reference ID: Geist Mono, 14px (0.875rem), Weight 500, Line Height 1.20, Letter Spacing +0.05em
  const fontStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    lineHeight: "1.20",
    letterSpacing: "0.05em",
    ...style,
  };

  return (
    <span
      className={cn(
        "font-mono font-medium text-text-primary transition-all duration-150 uppercase",
        className
      )}
      style={fontStyle}
      {...props}
    >
      {children}
    </span>
  );
};

export default MonoText;
