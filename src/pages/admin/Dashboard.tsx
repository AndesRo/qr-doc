import { useEffect, useState } from "react";
import { Car, CheckCircle2, FileCheck2, FileX2, FileWarning } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getDocumentStatus } from "@/lib/documentStatus";
import { useSeo } from "@/lib/useSeo";
import type { VehicleDocument } from "@/types";

interface Stats {
  totalVehiculos: number;
  vehiculosActivos: number;
  documentosVigentes: number;
  documentosVencidos: number;
  documentosFaltantes: number;
}

const REQUIRED_TYPES_COUNT = 5;

export default function Dashboard() {
  useSeo({ title: "Dashboard · vehiculo-qr admin", noindex: true });
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { count: totalVehiculos } = await supabase.from("vehicles").select("*", { count: "exact", head: true });
      const { count: vehiculosActivos } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("activo", true);

      const { data: allVehicles } = await supabase.from("vehicles").select("id");
      const { data: allDocs, error: docsError } = await supabase
        .from("vehicle_documents")
        .select("id, vehicle_id, tipo, nombre, fecha_vencimiento, archivo_path, activo, created_at, updated_at")
        .eq("activo", true);

      if (docsError) {
        setError("No fue posible cargar las estadísticas.");
        return;
      }

      const docs = (allDocs ?? []) as VehicleDocument[];
      let vigentes = 0;
      let vencidos = 0;

      docs.forEach((d) => {
        const s = getDocumentStatus(d);
        if (s === "vigente" || s === "registrado") vigentes += 1;
        if (s === "vencido") vencidos += 1;
      });

      const totalVehiculosCount = allVehicles?.length ?? 0;
      const faltantes = Math.max(totalVehiculosCount * REQUIRED_TYPES_COUNT - docs.length, 0);

      setStats({
        totalVehiculos: totalVehiculos ?? 0,
        vehiculosActivos: vehiculosActivos ?? 0,
        documentosVigentes: vigentes,
        documentosVencidos: vencidos,
        documentosFaltantes: faltantes,
      });
    }
    load();
  }, []);

  if (error) {
    return <p className="text-sm text-bad-text">{error}</p>;
  }

  if (!stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Total vehículos", value: stats.totalVehiculos, icon: Car, tone: "text-brand" },
    { label: "Vehículos activos", value: stats.vehiculosActivos, icon: CheckCircle2, tone: "text-ok" },
    { label: "Documentos vigentes", value: stats.documentosVigentes, icon: FileCheck2, tone: "text-ok" },
    { label: "Documentos vencidos", value: stats.documentosVencidos, icon: FileX2, tone: "text-bad" },
    { label: "Documentos faltantes", value: stats.documentosFaltantes, icon: FileWarning, tone: "text-warn" },
  ];

  return (
    <div>
      <h1 className="mb-4 font-display text-xl font-bold text-slate-900">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label}>
            <CardContent>
              <Icon className={`mb-2 h-5 w-5 ${tone}`} />
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
