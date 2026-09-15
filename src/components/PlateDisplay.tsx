import { formatPatenteDisplay } from "@/lib/patente";
import { cn } from "@/lib/utils";

export function PlateDisplay({ patente, className }: { patente: string; className?: string }) {
  return (
    <div
      className={cn(
        "plate inline-flex items-center justify-center rounded-xl border-2 border-brand bg-white px-5 py-2.5 text-2xl font-bold text-brand shadow-sm",
        className
      )}
    >
      {formatPatenteDisplay(patente)}
    </div>
  );
}
