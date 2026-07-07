"use client";

import React from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { cn } from "../../lib/utils";

interface ParagraphTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: "large" | "regular" | "uiLabel" | "caption";
  children: React.ReactNode;
}

export const ParagraphText: React.FC<ParagraphTextProps> = ({ variant = "regular", className, children, style, ...props }) => {
  const { locale } = useLanguage();
  const isMarathi = locale === "mr";

  const paragraphTokens = {
    large: {
      enSize: "1.00rem", // 16px
      enLineHeight: "1.50",
      enLetterSpacing: "0.00em",
      weightClass: "font-normal",
    },
    regular: {
      enSize: "0.875rem", // 14px
      enLineHeight: "1.50",
      enLetterSpacing: "0.00em",
      weightClass: "font-normal",
    },
    uiLabel: {
      enSize: "0.875rem", // 14px
      enLineHeight: "1.30",
      enLetterSpacing: "0.01em",
      weightClass: "font-medium",
    },
    caption: {
      enSize: "0.75rem", // 12px
      enLineHeight: "1.40",
      enLetterSpacing: "0.01em",
      weightClass: "font-normal",
    },
  };

  const token = paragraphTokens[variant];

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
    <p
      className={cn(
        isMarathi ? "font-marathi" : "font-body",
        token.weightClass,
        "text-text-secondary transition-all duration-150 leading-relaxed",
        className
      )}
      style={fontStyle}
      {...props}
    >
      {children}
    </p>
  );
};

export default ParagraphText;
