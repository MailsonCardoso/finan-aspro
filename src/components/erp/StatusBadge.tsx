import { cn } from "@/lib/utils";

type StatusType = "Pago" | "Pendente" | "Atrasado" | "Ativo" | "Experiência" | "Vencido" | "Vencendo" | "Válido" | "Recebido" | "Confirmado" | string;

const statusStyles: Record<string, string> = {
  Pago: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Recebido: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Confirmado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Ativo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Válido: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pendente: "bg-amber-50 text-amber-700 border-amber-200",
  Vencendo: "bg-amber-50 text-amber-700 border-amber-200",
  Experiência: "bg-amber-50 text-amber-700 border-amber-200",
  Atrasado: "bg-rose-50 text-rose-700 border-rose-200",
  Vencido: "bg-rose-50 text-rose-700 border-rose-200",
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", style, className)}>
      {status}
    </span>
  );
}
