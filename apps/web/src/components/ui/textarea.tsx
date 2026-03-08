import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none placeholder:text-muted focus:ring-2 focus:ring-accent",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
