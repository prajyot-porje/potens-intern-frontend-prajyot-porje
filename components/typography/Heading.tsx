"use client";

import React from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { cn } from "../../lib/utils";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({ level, className, children, style, ...props }) => {
  const { locale } = useLanguage();
  const Tag = `h${level}` as const;

  const isMarathi = locale === "mr";

  // Design Tokens mappings
  const headingTokens = {
    1: {
      enSize: "var(--heading-1-size, 1.50rem)", // 24px on mobile
      enLineHeight: "1.20",
      enLetterSpacing: "-0.01em",
      weightClass: "font-semibold",
    },
    2: {
      enSize: "var(--heading-2-size, 1.25rem)", // 20px on mobile
      enLineHeight: "1.25",
      enLetterSpacing: "-0.005em",
      weightClass: "font-semibold",
    },
    3: {
      enSize: "var(--heading-3-size, 1.125rem)",
      enLineHeight: "1.30",
      enLetterSpacing: "0em",
      weightClass: "font-medium",
    },
    4: {
      enSize: "var(--heading-4-size, 1.00rem)",
      enLineHeight: "1.40",
      enLetterSpacing: "0em",
      weightClass: "font-medium",
    },
    5: {
      enSize: "var(--heading-5-size, 0.875rem)",
      enLineHeight: "1.40",
      enLetterSpacing: "0em",
      weightClass: "font-medium",
    },
    6: {
      enSize: "var(--heading-6-size, 0.75rem)",
      enLineHeight: "1.40",
      enLetterSpacing: "0em",
      weightClass: "font-medium",
    },
  };

  const token = headingTokens[level];

  // Dynamic overrides for Marathi (5% size reduction, 10% line-height bump, 0 letter-spacing)
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
        isMarathi ? "font-marathi" : "font-heading",
        token.weightClass,
        "text-text-primary transition-all duration-150",
        className
      )}
      style={fontStyle}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default Heading;
