import React from "react";
import { cn } from "../../lib/utils";

export interface IconWrapperProps {
  size?: "micro" | "standard" | "large";
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { strokeWidth?: number }>;
  className?: string;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({
  size = "standard",
  icon: IconComponent,
  className,
}) => {
  const sizeClasses = {
    micro: "w-4 h-4",      // 16px
    standard: "w-6 h-6",   // 24px
    large: "w-12 h-12",    // 48px
  };

  return (
    <span className="inline-flex items-center justify-center shrink-0" role="img" aria-hidden="true">
      <IconComponent
        className={cn("text-current", sizeClasses[size], className)}
        strokeWidth={1.5}
      />
    </span>
  );
};

export default IconWrapper;
