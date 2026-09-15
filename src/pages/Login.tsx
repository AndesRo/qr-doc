
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { useSeo } from "@/lib/useSeo";

export default function Login() {
  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useSeo({
    title: "Acceso administrativo · Doc QR",
    noindex: true,
  });

  const from =
    (location.state as { from?: Location })?.from?.pathname || "/admin";

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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">

      <div className="w-full max-w-md">

        {/* =====================================================
            LOGO Y MARCA
        ====================================================== */}
        <div className="mb-8 flex flex-col items-center text-center">

          {/* QR grande */}
          <Logo className="h-32 w-32 sm:h-36 sm:w-36" />

          {/* Nombre */}
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-[#0A2C4E]">
            Doc{" "}
            <span className="text-[#19A9F5]">
              QR
            </span>
          </h1>

          {/* Descripción */}
          <p className="mt-2 max-w-xs text-sm leading-5 text-slate-500">
            Documentación vehicular digital y verificable mediante código QR.
          </p>
        </div>

        {/* =====================================================
            FORMULARIO
        ====================================================== */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8"
        >

          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Panel administrativo
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Ingresa con tu cuenta de administrador.
            </p>
          </div>

          {/* Correo */}
          <div className="mb-4">
            <Label htmlFor="email">
              Correo
            </Label>

            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@docqr.cl"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Contraseña */}
          <div className="mb-5">
            <Label htmlFor="password">
              Contraseña
            </Label>

            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
              <p className="text-sm text-bad-text">
                {error}
              </p>
            </div>
          )}

          {/* Botón */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>

          {/* Seguridad */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Acceso administrativo protegido</span>
          </div>
        </form>

        {/* =====================================================
            FOOTER
        ====================================================== */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Doc QR · Documentación vehicular digital
        </p>

      </div>
    </main>
  );
}
