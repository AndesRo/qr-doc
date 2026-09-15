import { cn } from "@/lib/utils";

/**
 * Isotipo de vehiculo-qr: el "ojo" buscador de un código QR combinado con
 * un check de verificación. Representa la idea central del producto —
 * verificar documentación mediante un código QR — sin imitar ningún
 * escudo o símbolo oficial del Estado.
 */
export function Logo({ className, monochrome = false }: { className?: string; monochrome?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("shrink-0", className)} role="img" aria-label="vehiculo-qr">
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#154C82" />
          <stop offset="1" stopColor="#0A2C4E" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill={monochrome ? "currentColor" : "url(#logo-gradient)"} />
      <rect x="7" y="7" width="12" height="12" rx="2.5" fill="none" stroke="#FFFFFF" strokeWidth="2.4" />
      <rect x="11" y="11" width="4" height="4" rx="1" fill="#FFFFFF" />
      <path
        d="M21 24.5 L26.5 30 L34 18"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Logo className="h-8 w-8" />
      <span className="font-display text-lg font-bold tracking-tight text-slate-900">
        vehiculo<span className="text-brand">-qr</span>
      </span>
    </div>
  );
}
