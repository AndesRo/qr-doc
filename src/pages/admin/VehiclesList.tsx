import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, QrCode, Car, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPatenteDisplay } from "@/lib/patente";
import { useSeo } from "@/lib/useSeo";
import type { Vehicle } from "@/types";

const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;

export default function VehiclesList() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useSeo({ title: "Vehículos · vehiculo-qr admin", noindex: true });

  useEffect(() => {
    async function load() {
      const { data, error: fetchError } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });
      if (fetchError) {
        setError("No fue posible cargar los vehículos.");
        return;
      }
      setVehicles((data ?? []) as Vehicle[]);
    }
    load();
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-slate-900">Vehículos</h1>
        <Link to="/admin/vehiculos/nuevo">
          <Button size="sm">
            <Plus className="h-4 w-4" /> Nuevo vehículo
          </Button>
        </Link>
      </div>

      {error && <p className="text-sm text-bad-text">{error}</p>}

      {!vehicles && !error && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      )}

      {vehicles && vehicles.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl bg-white p-10 text-center shadow-card">
          <Car className="mb-3 h-8 w-8 text-slate-300" />
          <p className="font-medium text-slate-700">Aún no hay vehículos registrados</p>
          <p className="mt-1 text-sm text-slate-500">Crea el primer vehículo para comenzar a generar su QR.</p>
          <Link to="/admin/vehiculos/nuevo" className="mt-4">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Nuevo vehículo
            </Button>
          </Link>
        </div>
      )}

      {vehicles && vehicles.length > 0 && (
        <>
          {/* Tarjetas — prioridad móvil */}
          <div className="space-y-2 sm:hidden">
            {vehicles.map((v) => (
              <div key={v.id} className="rounded-2xl bg-white p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="plate text-lg font-bold text-brand">{formatPatenteDisplay(v.patente)}</span>
                  <Badge tone={v.activo ? "ok" : "neutral"}>{v.activo ? "ACTIVO" : "INACTIVO"}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {v.marca} {v.modelo} {v.anio ? `(${v.anio})` : ""}
                </p>
                <div className="mt-3 flex gap-2">
                  <a href={`${SITE_URL}/v/${v.patente}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="h-4 w-4" /> Ver público
                    </Button>
                  </a>
                  <Link to={`/admin/qr/${v.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <QrCode className="h-4 w-4" /> QR
                    </Button>
                  </Link>
                  <Link to={`/admin/vehiculos/${v.id}`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla — escritorio */}
          <div className="hidden overflow-hidden rounded-2xl bg-white shadow-card sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Patente</th>
                    <th className="px-4 py-3">Marca / Modelo</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-mono font-semibold text-brand">
                        {formatPatenteDisplay(v.patente)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {v.marca} {v.modelo} {v.anio ? `(${v.anio})` : ""}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={v.activo ? "ok" : "neutral"}>{v.activo ? "ACTIVO" : "INACTIVO"}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <a href={`${SITE_URL}/v/${v.patente}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" title="Ver documentos sin escanear">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                          <Link to={`/admin/qr/${v.id}`}>
                            <Button variant="ghost" size="sm" title="Ver QR">
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/admin/vehiculos/${v.id}`}>
                            <Button variant="ghost" size="sm" title="Editar">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
