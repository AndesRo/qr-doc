import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSeo } from "@/lib/useSeo";

export function NotFoundState({
  title = "Página no encontrada",
  message = "La dirección a la que intentas acceder no existe o fue movida.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <SearchX className="mb-4 h-10 w-10 text-slate-400" />
      <h1 className="font-display text-lg font-bold text-slate-900">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">{message}</p>
      <Link to="/" className="mt-6">
        <Button variant="outline" size="sm">Volver al inicio</Button>
      </Link>
    </div>
  );
}

export default function NotFound() {
  useSeo({ title: "Página no encontrada · vehiculo-qr", noindex: true });
  return <NotFoundState />;
}
