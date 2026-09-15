import { DOCUMENT_TYPES_WITHOUT_EXPIRY, type DocumentStatus, type OverallStatus, type VehicleDocument } from "@/types";

/**
 * Calcula el estado de un documento según su fecha de vencimiento y disponibilidad.
 */
export function getDocumentStatus(doc: Pick<VehicleDocument, "tipo" | "fecha_vencimiento" | "archivo_path" | "activo">): DocumentStatus {
  if (!doc.activo || !doc.archivo_path) {
    return "no_disponible";
  }

  const sinVencimiento = DOCUMENT_TYPES_WITHOUT_EXPIRY.includes(doc.tipo);
  if (sinVencimiento || !doc.fecha_vencimiento) {
    return "registrado";
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = new Date(doc.fecha_vencimiento + "T00:00:00");

  return vencimiento >= hoy ? "vigente" : "vencido";
}

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  vigente: "VIGENTE",
  vencido: "VENCIDO",
  no_disponible: "NO DISPONIBLE",
  registrado: "REGISTRADO",
};

/**
 * Calcula el estado general del vehículo a partir de la lista de documentos requeridos.
 */
export function getOverallStatus(
  vehicleActive: boolean,
  requiredDocs: Pick<VehicleDocument, "tipo" | "fecha_vencimiento" | "archivo_path" | "activo">[],
  requiredTypesCount: number
): OverallStatus | "inactivo" {
  if (!vehicleActive) return "inactivo";

  if (requiredDocs.length < requiredTypesCount) {
    return "documentacion_incompleta";
  }

  const statuses = requiredDocs.map(getDocumentStatus);

  if (statuses.some((s) => s === "no_disponible")) {
    return "documentacion_incompleta";
  }

  if (statuses.some((s) => s === "vencido")) {
    return "documentacion_con_vencimientos";
  }

  return "verificado";
}

export const OVERALL_STATUS_CONFIG: Record<
  OverallStatus | "inactivo",
  { label: string; className: string }
> = {
  verificado: { label: "VEHÍCULO VERIFICADO", className: "bg-ok-bg text-ok-text border-ok/30" },
  documentacion_incompleta: {
    label: "DOCUMENTACIÓN INCOMPLETA",
    className: "bg-warn-bg text-warn-text border-warn/30",
  },
  documentacion_con_vencimientos: {
    label: "DOCUMENTACIÓN CON VENCIMIENTOS",
    className: "bg-bad-bg text-bad-text border-bad/30",
  },
  inactivo: { label: "VEHÍCULO NO ACTIVO", className: "bg-slate-200 text-slate-600 border-slate-300" },
};
