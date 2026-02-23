export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  // Handle ISO strings like "2026-02-23T00:00:00.000000Z"
  const dateOnly = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = dateOnly.split("-");
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}
