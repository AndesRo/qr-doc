export type DocumentType =
  | "padron"
  | "permiso_circulacion"
  | "revision_tecnica"
  | "emisiones"
  | "soap";

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  padron: "Certificado de Inscripción / Padrón",
  permiso_circulacion: "Permiso de Circulación",
  revision_tecnica: "Revisión Técnica",
  emisiones: "Certificado de Emisiones Contaminantes",
  soap: "Seguro Obligatorio SOAP",
};

// El padrón no vence; el resto sí.
export const DOCUMENT_TYPES_WITHOUT_EXPIRY: DocumentType[] = ["padron"];

export interface Vehicle {
  id: string;
  patente: string;
  propietario: string | null;
  mostrar_propietario: boolean;
  marca: string;
  modelo: string;
  anio: number | null;
  color: string | null;
  vin: string | null;
  numero_motor: string | null;
  activo: boolean;
  codigo_verificacion: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleDocument {
  id: string;
  vehicle_id: string;
  tipo: DocumentType;
  nombre: string;
  fecha_vencimiento: string | null; // ISO date, null si no aplica
  archivo_path: string | null; // path en supabase storage
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export type DocumentStatus = "vigente" | "vencido" | "no_disponible" | "registrado";

export type OverallStatus =
  | "verificado"
  | "documentacion_incompleta"
  | "documentacion_con_vencimientos";

export interface VehicleFormInput {
  patente: string;
  propietario: string;
  mostrar_propietario: boolean;
  marca: string;
  modelo: string;
  anio: string;
  color: string;
  vin: string;
  numero_motor: string;
  activo: boolean;
}

export interface DocumentFormInput {
  vehicle_id: string;
  tipo: DocumentType;
  nombre: string;
  fecha_vencimiento: string;
  activo: boolean;
  file?: File | null;
}
