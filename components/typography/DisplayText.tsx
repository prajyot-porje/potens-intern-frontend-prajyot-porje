"use client";

import React from "react";
import { useLanguage } from "../../lib/i18n";
import { cn } from "../../lib/utils";

interface DisplayTextProps extends React.HTMLAttributes<HTMLElement> {
  size?: "medium" | "large";
  as?: "h1" | "h2" | "h3" | "span" | "div";
  children: React.ReactNode;
}

export const DisplayText: React.FC<DisplayTextProps> = ({ size = "medium", as: Tag = "span", className, children, style, ...props }) => {
  const { locale } = useLanguage();
  const isMarathi = locale === "mr";

  const displayTokens = {
    large: {
      enSize: "var(--display-large-size, 3.00rem)", // 48px on mobile
      enLineHeight: "1.10",
      enLetterSpacing: "-0.02em",
    },
    medium: {
      enSize: "var(--display-medium-size, 2.25rem)", // 36px on mobile
      enLineHeight: "1.15",
      enLetterSpacing: "-0.015em",
    },
  };

  const token = displayTokens[size];

  const fontStyle: React.CSSProperties = isMarathi
    ? {
        fontSize: `calc(${token.enSize} * 0.95)`,
        lineHeight: String(Number(token.enLineHeight) * 1.10),
        letterSpacing: "0em",
        ...style,
      }
    : {
        fontSize: token.enSize,
        lineHeight: token.enLineHeight,
        letterSpacing: token.enLetterSpacing,
        ...style,
      };

  return (
    <Tag
      className={cn(
        isMarathi ? "font-marathi font-bold" : "font-display font-bold",
        "text-text-primary tracking-tight transition-all duration-150 block",
        className
      )}
      style={fontStyle}
      {...(props as React.HTMLAttributes<HTMLElement>)}
    >
      {children}
    </Tag>
  );
};

export default DisplayText;
