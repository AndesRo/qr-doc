import { Link } from "react-router-dom";
import { QrCode, ScanLine, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/Logo";
import { useSeo } from "@/lib/useSeo";

export default function Home() {
  useSeo({
    title: "vehiculo-qr · Consulta digital de documentos vehiculares",
    description:
      "Consulta el estado de la documentación de un vehículo escaneando su código QR: padrón, permiso de circulación, revisión técnica, emisiones y SOAP en una sola vista.",
  });

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface bg-mesh-light px-4 py-16 text-center">
      <Logo className="mb-6 h-16 w-16" />
      <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">vehiculo-qr</h1>
      <p className="mt-3 max-w-md text-slate-600">
        Consulta digital del estado de documentación de un vehículo mediante un código QR.
      </p>

      <div className="mt-8 grid w-full max-w-md gap-3 text-left">
        <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-card">
          <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <p className="text-sm text-slate-600">
            Cada vehículo tiene una página pública única, accesible escaneando su QR.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-card">
          <ScanLine className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <p className="text-sm text-slate-600">
            Si prefieres no escanear, también puedes abrir la vista pública directamente.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-card">
          <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <p className="text-sm text-slate-600">
            La información se administra de forma privada y solo se muestra lo necesario.
          </p>
        </div>
      </div>

      <Link to="/login" className="mt-10">
        <Button variant="outline">Acceso administrativo</Button>
      </Link>

      <p className="mt-10 max-w-md text-xs text-slate-400">
        Esta plataforma es informativa y no reemplaza la verificación oficial de Carabineros de
        Chile ni de los organismos competentes.
      </p>
    </div>
  );
}
