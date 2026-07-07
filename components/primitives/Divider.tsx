import React from "react";
import { cn } from "../../lib/utils";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const Divider: React.FC<DividerProps> = ({ orientation = "horizontal", className, ...props }) => {
  return (
    <div
      role="none"
      className={cn(
        "bg-border shrink-0 transition-colors duration-150",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full self-stretch",
        className
      )}
      {...props}
    />
  );
};

export default Divider;
