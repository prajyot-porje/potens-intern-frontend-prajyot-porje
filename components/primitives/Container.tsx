import React from "react";
import { cn } from "../../lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "w-full max-w-120 sm:max-w-[640px] md:max-w-[720px] mx-auto px-space-4 md:px-space-6 flex flex-col flex-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
