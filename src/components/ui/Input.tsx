import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:border-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15 disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("mb-1.5 block text-sm font-medium text-slate-700", className)} {...props} />
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 transition-colors focus-visible:border-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15 disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn("h-4 w-4 rounded border-slate-300 text-brand focus-visible:ring-4 focus-visible:ring-accent/15", className)}
      {...props}
    />
  )
);
Checkbox.displayName = "Checkbox";
