import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/Logo";
import { useSeo } from "@/lib/useSeo";
import { PlateDisplay } from "@/components/PlateDisplay";
import { StatusBanner } from "@/components/StatusBanner";
import { DocumentTypeCard } from "@/components/DocumentCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { NotFoundState } from "@/pages/NotFound";
import { formatDate } from "@/lib/utils";
import { getOverallStatus } from "@/lib/documentStatus";
import { normalizePatente } from "@/lib/patente";
import type { DocumentType, Vehicle, VehicleDocument } from "@/types";

const REQUIRED_DOC_TYPES: DocumentType[] = [
  "padron",
  "permiso_circulacion",
  "revision_tecnica",
  "emisiones",
  "soap",
];

export default function PublicVehicle() {
  const { patente } = useParams<{ patente: string }>();

  useSeo({
    title: patente ? `${patente.toUpperCase()} · Documentos del vehículo · vehiculo-qr` : "vehiculo-qr",
    description:
      "Estado de la documentación del vehículo: padrón, permiso de circulación, revisión técnica, emisiones y SOAP.",
  });
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!patente) return;
      setLoading(true);
      setNotFound(false);

      const normalized = normalizePatente(patente);
      const { data: vehicleData, error: vehicleError } = await supabase
        .from("vehicles")
        .select(
          "id, patente, propietario, mostrar_propietario, marca, modelo, anio, color, vin, numero_motor, activo, codigo_verificacion, created_at, updated_at"
        )
        .eq("patente", normalized)
        .eq("activo", true)
        .maybeSingle();

      if (!active) return;

      if (vehicleError || !vehicleData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data: docsData } = await supabase
        .from("vehicle_documents")
        .select("id, vehicle_id, tipo, nombre, fecha_vencimiento, archivo_path, activo, created_at, updated_at")
        .eq("vehicle_id", vehicleData.id)
        .eq("activo", true);

      if (!active) return;
      setVehicle(vehicleData as Vehicle);
      setDocuments((docsData ?? []) as VehicleDocument[]);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [patente]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface px-4 py-8">
        <div className="mx-auto max-w-md space-y-4">
          <Skeleton className="h-10 w-40 mx-auto" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (notFound || !vehicle) {
    return (
      <div className="min-h-screen bg-surface">
        <NotFoundState
          title="Patente no encontrada"
          message="No encontramos un vehículo activo asociado a esta patente. Verifica el código QR o la dirección ingresada."
        />
      </div>
    );
  }

  const docsByType = new Map(documents.map((d) => [d.tipo, d]));
  const requiredDocsPresent = REQUIRED_DOC_TYPES.map((t) => docsByType.get(t)).filter(
    (d): d is VehicleDocument => Boolean(d)
  );
  const overallStatus = getOverallStatus(vehicle.activo, requiredDocsPresent, REQUIRED_DOC_TYPES.length);

  return (
    <div className="min-h-screen bg-surface px-4 py-6">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-center gap-2 text-brand">
          <Logo className="h-6 w-6" />
          <span className="font-display text-sm font-semibold">vehiculo-qr</span>
        </div>

        <div className="mb-4 flex justify-center">
          <PlateDisplay patente={vehicle.patente} />
        </div>

        <div className="mb-4">
          <StatusBanner status={overallStatus} />
        </div>

        <div className="mb-5 rounded-2xl bg-white p-4 shadow-card">
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-400">Información del vehículo</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-slate-500">Marca</dt>
            <dd className="text-right font-medium text-slate-900">{vehicle.marca || "—"}</dd>
            <dt className="text-slate-500">Modelo</dt>
            <dd className="text-right font-medium text-slate-900">{vehicle.modelo || "—"}</dd>
            <dt className="text-slate-500">Año</dt>
            <dd className="text-right font-medium text-slate-900">{vehicle.anio ?? "—"}</dd>
            <dt className="text-slate-500">Color</dt>
            <dd className="text-right font-medium text-slate-900">{vehicle.color || "—"}</dd>
            {vehicle.vin && (
              <>
                <dt className="text-slate-500">VIN</dt>
                <dd className="text-right font-mono text-xs font-medium text-slate-900">{vehicle.vin}</dd>
              </>
            )}
            {vehicle.numero_motor && (
              <>
                <dt className="text-slate-500">N° Motor</dt>
                <dd className="text-right font-mono text-xs font-medium text-slate-900">{vehicle.numero_motor}</dd>
              </>
            )}
            {vehicle.mostrar_propietario && vehicle.propietario && (
              <>
                <dt className="text-slate-500">Propietario</dt>
                <dd className="text-right font-medium text-slate-900">{vehicle.propietario}</dd>
              </>
            )}
          </dl>
        </div>

        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-400">Documentos</h2>
        <div className="space-y-3">
          {REQUIRED_DOC_TYPES.map((tipo) => (
            <DocumentTypeCard key={tipo} tipo={tipo} document={docsByType.get(tipo) ?? null} />
          ))}
        </div>

        <div className="mt-6 space-y-1 text-center text-xs text-slate-400">
          <p>Última actualización: {formatDate(vehicle.updated_at?.slice(0, 10))}</p>
          <p>Código de verificación: {vehicle.codigo_verificacion}</p>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
          Esta plataforma es informativa y no reemplaza la verificación oficial de Carabineros de
          Chile ni de los organismos competentes.
        </p>
      </div>
    </div>
  );
}
