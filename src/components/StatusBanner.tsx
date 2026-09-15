import { CheckCircle2, AlertTriangle, XCircle, Ban } from "lucide-react";
import { OVERALL_STATUS_CONFIG } from "@/lib/documentStatus";
import { cn } from "@/lib/utils";
import type { OverallStatus } from "@/types";

const ICONS: Record<string, typeof CheckCircle2> = {
  verificado: CheckCircle2,
  documentacion_incompleta: AlertTriangle,
  documentacion_con_vencimientos: XCircle,
  inactivo: Ban,
};

export function StatusBanner({ status }: { status: OverallStatus | "inactivo" }) {
  const config = OVERALL_STATUS_CONFIG[status];
  const Icon = ICONS[status];

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 font-semibold",
        config.className
      )}
    >
      <Icon className="h-6 w-6 shrink-0" />
      <span className="text-base">{config.label}</span>
    </div>
  );
}
