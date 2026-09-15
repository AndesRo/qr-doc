import { useEffect, useState, type FormEvent } from "react";
import { Plus, FileText, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Checkbox } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSeo } from "@/lib/useSeo";
import { formatDate } from "@/lib/utils";
import { formatPatenteDisplay } from "@/lib/patente";
import { getDocumentStatus, DOCUMENT_STATUS_LABELS } from "@/lib/documentStatus";
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPES_WITHOUT_EXPIRY,
  type DocumentType,
  type Vehicle,
  type VehicleDocument,
} from "@/types";

const TONE_BY_STATUS = { vigente: "ok", registrado: "ok", vencido: "bad", no_disponible: "warn" } as const;

export default function DocumentsList() {
  useSeo({ title: "Documentos · vehiculo-qr admin", noindex: true });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function loadAll() {
    setLoading(true);
    const [vehiclesRes, docsRes] = await Promise.all([
      supabase.from("vehicles").select("*").order("patente"),
      supabase.from("vehicle_documents").select("*").order("created_at", { ascending: false }),
    ]);
    if (vehiclesRes.error || docsRes.error) {
      setError("No fue posible cargar los documentos.");
      setLoading(false);
      return;
    }
    setVehicles((vehiclesRes.data ?? []) as Vehicle[]);
    setDocuments((docsRes.data ?? []) as VehicleDocument[]);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleDelete(doc: VehicleDocument) {
    if (!confirm("¿Eliminar este documento? Esta acción no se puede deshacer.")) return;
    if (doc.archivo_path) {
      await supabase.storage.from("vehicle-documents").remove([doc.archivo_path]);
    }
    await supabase.from("vehicle_documents").delete().eq("id", doc.id);
    loadAll();
  }

  const vehiclesById = new Map(vehicles.map((v) => [v.id, v]));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-slate-900">Documentos</h1>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> Nuevo documento
        </Button>
      </div>

      {error && <p className="text-sm text-bad-text">{error}</p>}

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      )}

      {!loading && documents.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl bg-white p-10 text-center shadow-card">
          <FileText className="mb-3 h-8 w-8 text-slate-300" />
          <p className="font-medium text-slate-700">Aún no hay documentos cargados</p>
        </div>
      )}

      {!loading && documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc) => {
            const vehicle = vehiclesById.get(doc.vehicle_id);
            const status = getDocumentStatus(doc);
            return (
              <Card key={doc.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{DOCUMENT_TYPE_LABELS[doc.tipo]}</p>
                    <p className="text-sm text-slate-500">
                      {vehicle ? formatPatenteDisplay(vehicle.patente) : "Vehículo no encontrado"}
                      {doc.fecha_vencimiento && ` · Vence ${formatDate(doc.fecha_vencimiento)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={TONE_BY_STATUS[status]}>{DOCUMENT_STATUS_LABELS[status]}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(doc)}>
                      <Trash2 className="h-4 w-4 text-bad" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showForm && (
        <DocumentFormModal
          vehicles={vehicles}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            loadAll();
          }}
        />
      )}
    </div>
  );
}

function DocumentFormModal({
  vehicles,
  onClose,
  onSaved,
}: {
  vehicles: Vehicle[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [tipo, setTipo] = useState<DocumentType>("padron");
  const [nombre, setNombre] = useState(DOCUMENT_TYPE_LABELS.padron);
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [activo, setActivo] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sinVencimiento = DOCUMENT_TYPES_WITHOUT_EXPIRY.includes(tipo);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!vehicleId) {
      setError("Selecciona un vehículo.");
      return;
    }
    if (!sinVencimiento && !fechaVencimiento) {
      setError("Este tipo de documento requiere fecha de vencimiento.");
      return;
    }

    setSaving(true);
    let archivoPath: string | null = null;

    if (file) {
      const path = `${vehicleId}/${tipo}-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("vehicle-documents").upload(path, file, {
        contentType: file.type || "application/pdf",
      });
      if (uploadError) {
        setError("No fue posible subir el archivo. Intenta nuevamente.");
        setSaving(false);
        return;
      }
      archivoPath = path;
    }

    const { error: insertError } = await supabase.from("vehicle_documents").insert({
      vehicle_id: vehicleId,
      tipo,
      nombre: nombre || DOCUMENT_TYPE_LABELS[tipo],
      fecha_vencimiento: sinVencimiento ? null : fechaVencimiento,
      archivo_path: archivoPath,
      activo,
    });

    setSaving(false);

    if (insertError) {
      setError("No fue posible guardar el documento. Intenta nuevamente.");
      return;
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Nuevo documento</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="vehicle">Vehículo</Label>
            <Select id="vehicle" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required>
              <option value="" disabled>
                Selecciona un vehículo
              </option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {formatPatenteDisplay(v.patente)} · {v.marca} {v.modelo}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="tipo">Tipo de documento</Label>
            <Select
              id="tipo"
              value={tipo}
              onChange={(e) => {
                const nuevoTipo = e.target.value as DocumentType;
                setTipo(nuevoTipo);
                setNombre(DOCUMENT_TYPE_LABELS[nuevoTipo]);
              }}
            >
              {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>

          {!sinVencimiento && (
            <div>
              <Label htmlFor="fecha">Fecha de vencimiento</Label>
              <Input
                id="fecha"
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="archivo">Archivo PDF</Label>
            <input
              id="archivo"
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <Checkbox checked={activo} onChange={(e) => setActivo(e.target.checked)} />
            Documento activo
          </label>

          {error && <p className="text-sm text-bad-text">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
