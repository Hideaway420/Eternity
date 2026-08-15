/**
 * Eternity Products Money Utility
 * All internal money calculations are strictly in integer paisa (NPR x 100)
 */

export function paisaToNpr(paisa: number): number {
  return Math.round(paisa) / 100;
}

export function nprToPaisa(npr: number): number {
  return Math.round(npr * 100);
}

export function formatNpr(paisa: number, locale: "en" | "np" = "en"): string {
  const npr = paisaToNpr(paisa);
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(npr);

  if (locale === "np") {
    return `रु ${formatted}`;
  }
  return `NPR ${formatted}`;
}

export function calculateVat(paisaInclusive: number, vatRatePercent: number = 13): {
  netPaisa: number;
  vatPaisa: number;
} {
  const netPaisa = Math.round(paisaInclusive / (1 + vatRatePercent / 100));
  const vatPaisa = paisaInclusive - netPaisa;
  return { netPaisa, vatPaisa };
}
