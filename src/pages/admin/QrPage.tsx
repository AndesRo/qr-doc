import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Copy, Download, Check, ExternalLink, ScanLine } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { PlateDisplay } from "@/components/PlateDisplay";
import { useSeo } from "@/lib/useSeo";
import type { Vehicle } from "@/types";

const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;

export default function QrPage() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  useSeo({ title: "Código QR · vehiculo-qr admin", noindex: true });

  useEffect(() => {
    if (!id) return;
    supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error: fetchError }) => {
        if (fetchError || !data) {
          setError("No fue posible cargar el vehículo.");
          return;
        }
        setVehicle(data as Vehicle);
      });
  }, [id]);

  if (error) return <p className="text-sm text-bad-text">{error}</p>;
  if (!vehicle) return <Skeleton className="h-96 w-full max-w-2xl" />;

  const v = vehicle;
  const publicUrl = `${SITE_URL}/v/${v.patente}`;

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadPng() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${v.patente}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function downloadSvg() {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `qr-${v.patente}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 font-display text-xl font-bold text-slate-900">Código QR</h1>
      <p className="mb-4 text-sm text-slate-500">
        Muestra el QR para escanear o usa el acceso directo si el fiscalizador prefiere revisar
        los documentos sin escanear.
      </p>

      <Card>
        <CardContent className="grid gap-6 sm:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center gap-3">
            <PlateDisplay patente={v.patente} />
            <div ref={canvasRef} className="rounded-xl border border-slate-200 p-3">
              <QRCodeCanvas value={publicUrl} size={190} level="M" />
            </div>
            <div ref={svgRef} className="hidden">
              <QRCodeSVG value={publicUrl} size={512} level="M" />
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3">
            <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600 break-all">
              {publicUrl}
            </div>

            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="accent" className="w-full">
                <ExternalLink className="h-4 w-4" />
                Ver documentos sin escanear
              </Button>
            </a>
            <p className="-mt-1 flex items-start gap-1.5 text-xs text-slate-400">
              <ScanLine className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Abre la misma vista pública del QR en el navegador, por si el fiscalizador prefiere
              no escanear.
            </p>

            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado" : "Copiar URL"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={downloadPng}>
                <Download className="h-4 w-4" /> PNG
              </Button>
              <Button variant="outline" className="flex-1" onClick={downloadSvg}>
                <Download className="h-4 w-4" /> SVG
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
