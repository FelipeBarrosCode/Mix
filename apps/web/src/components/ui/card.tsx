import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <section className={cn("rounded-2xl border border-border bg-card p-4 shadow-sm", className)}>{children}</section>;
}
