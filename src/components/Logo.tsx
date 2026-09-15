import { useId } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  monochrome?: boolean;
}

export function Logo({
  className,
  monochrome = false,
}: LogoProps) {
  const gradientId = useId();

  const primary = monochrome ? "currentColor" : `url(#${gradientId})`;
  const accent = monochrome ? "currentColor" : "#19A9F5";

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Doc QR"
      xmlns="http://www.w3.org/2000/svg"
    >
      {!monochrome && (
        <defs>
          <linearGradient
            id={gradientId}
            x1="10"
            y1="10"
            x2="90"
            y2="90"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#154C82" />
            <stop offset="1" stopColor="#0A2C4E" />
          </linearGradient>
        </defs>
      )}

      {/* Fondo */}
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="20"
        fill={primary}
      />

      {/* Marco QR superior izquierdo */}
      <rect
        x="18"
        y="18"
        width="24"
        height="24"
        rx="3"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="5"
      />

      <rect
        x="25"
        y="25"
        width="10"
        height="10"
        rx="1.5"
        fill="#FFFFFF"
      />

      {/* Marco QR superior derecho */}
      <rect
        x="58"
        y="18"
        width="24"
        height="24"
        rx="3"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="5"
      />

      <rect
        x="65"
        y="25"
        width="10"
        height="10"
        rx="1.5"
        fill="#FFFFFF"
      />

      {/* Marco QR inferior izquierdo */}
      <rect
        x="18"
        y="58"
        width="24"
        height="24"
        rx="3"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="5"
      />

      <rect
        x="25"
        y="65"
        width="10"
        height="10"
        rx="1.5"
        fill="#FFFFFF"
      />

      {/* Patrón central QR */}
      <rect x="47" y="18" width="5" height="5" rx="1" fill="#FFFFFF" />
      <rect x="48" y="27" width="7" height="7" rx="1" fill="#FFFFFF" />
      <rect x="46" y="38" width="6" height="6" rx="1" fill="#FFFFFF" />

      <rect x="47" y="49" width="8" height="8" rx="1" fill="#FFFFFF" />
      <rect x="58" y="47" width="6" height="6" rx="1" fill="#FFFFFF" />
      <rect x="68" y="47" width="6" height="6" rx="1" fill="#FFFFFF" />

      <rect x="45" y="61" width="6" height="6" rx="1" fill="#FFFFFF" />
      <rect x="54" y="70" width="7" height="7" rx="1" fill="#FFFFFF" />
      <rect x="64" y="58" width="6" height="6" rx="1" fill="#FFFFFF" />

      <rect x="76" y="67" width="5" height="5" rx="1" fill="#FFFFFF" />

      {/* Check de verificación */}
      <circle
        cx="74"
        cy="76"
        r="15"
        fill={accent}
        stroke="#FFFFFF"
        strokeWidth="4"
      />

      <path
        d="M66.5 76 L71.5 81 L82 69.5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoWordmark({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Logo className="h-10 w-10" />

      <span className="font-display text-2xl font-extrabold tracking-tight text-[#0A2C4E]">
        Doc{" "}
        <span className="text-[#19A9F5]">QR</span>
      </span>
    </div>
  );
}