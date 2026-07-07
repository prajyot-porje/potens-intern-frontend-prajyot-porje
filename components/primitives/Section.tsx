import React from "react";
import { cn } from "../../lib/utils";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "space-4" | "space-6" | "space-8" | "space-12";
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  spacing = "space-6",
  className,
  children,
  ...props
}) => {
  const spacingClasses = {
    "space-4": "py-space-4 sm:py-space-6",
    "space-6": "py-space-6 sm:py-space-8",
    "space-8": "py-space-8 sm:py-space-12",
    "space-12": "py-space-12 sm:py-space-16",
  };

  return (
    <section className={cn(spacingClasses[spacing], className)} {...props}>
      {children}
    </section>
  );
};

export default Section;
