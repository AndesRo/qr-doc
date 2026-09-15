import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand text-white shadow-sm hover:bg-brand-light active:bg-brand-dark",
  accent: "bg-accent text-white shadow-sm hover:bg-accent-light active:bg-accent-dark",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300",
  outline: "border border-slate-300 bg-white text-slate-700 hover:border-brand/40 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 active:bg-slate-200",
  danger: "bg-bad text-white shadow-sm hover:bg-red-700 active:bg-red-800",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
