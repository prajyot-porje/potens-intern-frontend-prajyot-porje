import React from "react";
import { cn } from "../../lib/utils";

export interface PageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-bg text-text-primary flex flex-col transition-colors duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default PageWrapper;
