/** Parse Drizzle/pg numeric string to number for display and math. */
export function num(v: string | number): number {
  if (typeof v === "number") return v;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export function money(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

export function roundMoney(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2);
}
