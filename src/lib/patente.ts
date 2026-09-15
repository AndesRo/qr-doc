/**
 * Normaliza una patente chilena: mayúsculas, sin espacios ni guiones.
 * Acepta formatos antiguos (AA1234) y nuevos (BBBB12).
 */
export function normalizePatente(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .trim();
}

/**
 * Valida que la patente normalizada tenga un formato chileno plausible:
 * - Formato antiguo: 2 letras + 4 números (AA1234)
 * - Formato nuevo: 4 letras + 2 números (BBBB12)
 */
export function isValidPatente(raw: string): boolean {
  const p = normalizePatente(raw);
  return /^[A-Z]{2}\d{4}$/.test(p) || /^[A-Z]{4}\d{2}$/.test(p);
}

/**
 * Formatea una patente normalizada para visualización destacada, ej: AB·CD·12 o AA·12·34
 */
export function formatPatenteDisplay(raw: string): string {
  const p = normalizePatente(raw);
  if (/^[A-Z]{4}\d{2}$/.test(p)) {
    return `${p.slice(0, 2)}·${p.slice(2, 4)}·${p.slice(4, 6)}`;
  }
  if (/^[A-Z]{2}\d{4}$/.test(p)) {
    return `${p.slice(0, 2)}·${p.slice(2, 4)}·${p.slice(4, 6)}`;
  }
  return p;
}
