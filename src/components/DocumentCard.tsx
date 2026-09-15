import { FileText, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { getDocumentStatus, DOCUMENT_STATUS_LABELS } from "@/lib/documentStatus";
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPES_WITHOUT_EXPIRY, type VehicleDocument } from "@/types";
import { supabase } from "@/lib/supabase";

const TONE_BY_STATUS = {
  vigente: "ok",
  registrado: "ok",
  vencido: "bad",
  no_disponible: "warn",
} as const;

export function DocumentTypeCard({
  tipo,
  document,
}: {
  tipo: VehicleDocument["tipo"];
  document: VehicleDocument | null;
}) {
  const [loading, setLoading] = useState(false);
  const status = document
    ? getDocumentStatus(document)
    : "no_disponible";
  const sinVencimiento = DOCUMENT_TYPES_WITHOUT_EXPIRY.includes(tipo);

  async function handleView() {
    if (!document?.archivo_path) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from("vehicle-documents")
        .createSignedUrl(document.archivo_path, 60);
      if (error || !data?.signedUrl) {
        alert("No fue posible generar el enlace del documento. Intenta nuevamente.");
        return;
      }
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <div>
              <p className="font-display font-semibold leading-tight text-slate-900">{DOCUMENT_TYPE_LABELS[tipo]}</p>
              {document?.nombre && document.nombre !== DOCUMENT_TYPE_LABELS[tipo] && (
                <p className="text-xs text-slate-500">{document.nombre}</p>
              )}
            </div>
          </div>
          <Badge tone={TONE_BY_STATUS[status]}>{DOCUMENT_STATUS_LABELS[status]}</Badge>
        </div>

        {!sinVencimiento && document?.fecha_vencimiento && (
          <p className="text-sm text-slate-600">
            Vence: <span className="font-medium text-slate-800">{formatDate(document.fecha_vencimiento)}</span>
          </p>
        )}

        {status === "no_disponible" ? (
          <p className="text-sm text-slate-500">Este documento aún no ha sido cargado por el propietario.</p>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={handleView} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            Ver documento
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
