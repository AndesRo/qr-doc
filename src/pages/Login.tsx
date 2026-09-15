import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ScanLine, ShieldCheck, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { useSeo } from "@/lib/useSeo";

const highlights = [
  { icon: ScanLine, text: "Un QR por vehículo, listo para escanear en segundos." },
  { icon: FileCheck2, text: "Padrón, permiso, revisión técnica, emisiones y SOAP en un solo lugar." },
  { icon: ShieldCheck, text: "Acceso administrativo protegido y datos servidos mediante enlaces firmados." },
];

export default function Login() {
  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useSeo({ title: "Acceso administrativo · vehiculo-qr", noindex: true });

  const from = (location.state as { from?: Location })?.from?.pathname || "/admin";

  if (session) {
    navigate(from, { replace: true });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    navigate(from, { replace: true });
  }

  return (
    <div className="grid min-h-screen bg-surface lg:grid-cols-2">
      {/* Panel de marca — oculto en móvil para priorizar el formulario */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-gradient p-10 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-mesh-light" />
        <LogoWordmarkLight />
        <div className="relative max-w-sm">
          <h1 className="font-display text-3xl font-bold leading-tight">
            Documentación vehicular, verificada al instante.
          </h1>
          <div className="mt-8 space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm text-white/85">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-white/50">
          Plataforma informativa. No reemplaza la verificación oficial de Carabineros de Chile.
        </p>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center px-4 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-card">
          <div className="mb-7 flex flex-col items-center text-center lg:items-start lg:text-left">
            <Logo className="mb-4 h-11 w-11 lg:hidden" />
            <h1 className="font-display text-xl font-bold text-slate-900">Panel administrativo</h1>
            <p className="text-sm text-slate-500">Ingresa con tu cuenta de administrador</p>
          </div>

          <div className="mb-4">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="mb-4 text-sm text-bad-text">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function LogoWordmarkLight() {
  return (
    <div className="relative flex items-center gap-2.5">
      <Logo className="h-8 w-8" />
      <span className="font-display text-lg font-bold tracking-tight text-white">
        vehiculo<span className="text-accent-light">-qr</span>
      </span>
    </div>
  );
}
