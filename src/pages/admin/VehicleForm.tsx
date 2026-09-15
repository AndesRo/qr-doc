import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input, Label, Checkbox } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { isValidPatente, normalizePatente } from "@/lib/patente";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSeo } from "@/lib/useSeo";

interface FormState {
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

const emptyForm: FormState = {
  patente: "",
  propietario: "",
  mostrar_propietario: false,
  marca: "",
  modelo: "",
  anio: "",
  color: "",
  vin: "",
  numero_motor: "",
  activo: true,
};

export default function VehicleForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  useSeo({ title: isEditing ? "Editar vehículo · vehiculo-qr admin" : "Nuevo vehículo · vehiculo-qr admin", noindex: true });

  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const { data, error: fetchError } = await supabase.from("vehicles").select("*").eq("id", id).single();
      if (fetchError || !data) {
        setError("No fue posible cargar el vehículo.");
        setLoading(false);
        return;
      }
      setForm({
        patente: data.patente ?? "",
        propietario: data.propietario ?? "",
        mostrar_propietario: data.mostrar_propietario ?? false,
        marca: data.marca ?? "",
        modelo: data.modelo ?? "",
        anio: data.anio ? String(data.anio) : "",
        color: data.color ?? "",
        vin: data.vin ?? "",
        numero_motor: data.numero_motor ?? "",
        activo: data.activo ?? true,
      });
      setLoading(false);
    }
    load();
  }, [id]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const patenteNormalizada = normalizePatente(form.patente);
    if (!isValidPatente(patenteNormalizada)) {
      setError("La patente ingresada no tiene un formato chileno válido (ej: AB1234 o BBBB12).");
      return;
    }

    setSaving(true);

    const payload = {
      patente: patenteNormalizada,
      propietario: form.propietario || null,
      mostrar_propietario: form.mostrar_propietario,
      marca: form.marca,
      modelo: form.modelo,
      anio: form.anio ? Number(form.anio) : null,
      color: form.color || null,
      vin: form.vin || null,
      numero_motor: form.numero_motor || null,
      activo: form.activo,
    };

    const query = isEditing
      ? supabase.from("vehicles").update(payload).eq("id", id)
      : supabase.from("vehicles").insert(payload);

    const { error: saveError } = await query;
    setSaving(false);

    if (saveError) {
      if (saveError.code === "23505") {
        setError("Ya existe un vehículo registrado con esta patente.");
      } else {
        setError("No fue posible guardar el vehículo. Intenta nuevamente.");
      }
      return;
    }

    navigate("/admin/vehiculos");
  }

  if (loading) {
    return <Skeleton className="h-96 w-full max-w-lg" />;
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-4 font-display text-xl font-bold text-slate-900">
        {isEditing ? "Editar vehículo" : "Nuevo vehículo"}
      </h1>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="patente">Patente</Label>
              <Input
                id="patente"
                required
                value={form.patente}
                onChange={(e) => update("patente", e.target.value)}
                placeholder="AB1234"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="marca">Marca</Label>
                <Input id="marca" required value={form.marca} onChange={(e) => update("marca", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="modelo">Modelo</Label>
                <Input id="modelo" required value={form.modelo} onChange={(e) => update("modelo", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="anio">Año</Label>
                <Input
                  id="anio"
                  type="number"
                  value={form.anio}
                  onChange={(e) => update("anio", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input id="color" value={form.color} onChange={(e) => update("color", e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="vin">VIN / N° de chasis</Label>
              <Input id="vin" value={form.vin} onChange={(e) => update("vin", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="numero_motor">N° de motor</Label>
              <Input
                id="numero_motor"
                value={form.numero_motor}
                onChange={(e) => update("numero_motor", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="propietario">Propietario</Label>
              <Input
                id="propietario"
                value={form.propietario}
                onChange={(e) => update("propietario", e.target.value)}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <Checkbox
                checked={form.mostrar_propietario}
                onChange={(e) => update("mostrar_propietario", e.target.checked)}
              />
              Mostrar propietario en la consulta pública
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <Checkbox checked={form.activo} onChange={(e) => update("activo", e.target.checked)} />
              Vehículo activo
            </label>

            {error && <p className="text-sm text-bad-text">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/admin/vehiculos")}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
