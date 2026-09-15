import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "ok" | "bad" | "warn" | "neutral";

const toneClasses: Record<Tone, string> = {
  ok: "bg-ok-bg text-ok-text",
  bad: "bg-bad-bg text-bad-text",
  warn: "bg-warn-bg text-warn-text",
  neutral: "bg-slate-100 text-slate-600",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
