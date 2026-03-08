import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <span className={cn("rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200", className)}>{children}</span>;
}
