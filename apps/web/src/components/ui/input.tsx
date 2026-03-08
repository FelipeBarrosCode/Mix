import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-xl border border-border bg-card px-4 text-base outline-none placeholder:text-muted focus:ring-2 focus:ring-accent",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
