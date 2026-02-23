import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

export function FluxoCaixa() {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["financial-entries", "all"],
    queryFn: async () => {
      const response = await api.get("/financial/entries");
      return response.data;
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entriesWithBalance = entries?.map((d: any) => {
    let computedStatus = d.status;
    if (d.status === 'pending') {
      const isLate = new Date(d.due_date.substring(0, 10) + 'T00:00:00') < today;
      computedStatus = isLate ? 'Atrasado' : 'Pendente';
    } else if (d.status === 'paid') {
      computedStatus = 'Pago';
    }
    return {
      ...d,
      computedStatus,
      actualValue: d.type === 'income' ? Number(d.value) : -Number(d.value)
    };
  }).sort((a: any, b: any) => {
    const order: Record<string, number> = { 'Atrasado': 1, 'Pendente': 2, 'Pago': 3 };
    const orderA = order[a.computedStatus] || 99;
    const orderB = order[b.computedStatus] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  }) || [];

  const entradas = entriesWithBalance.filter((d: any) => d.type === 'income').reduce((a: number, b: any) => a + Number(b.value), 0);
  const saidas = entriesWithBalance.filter((d: any) => d.type === 'expense').reduce((a: number, b: any) => a + Number(b.value), 0);
  const saldo = entries?.filter((d: any) => d.status === 'paid')
    .reduce((a: number, b: any) => a + (b.type === 'income' ? Number(b.value) : -Number(b.value)), 0) || 0;

  const kpis = [
    { label: "Total Entradas", value: entradas },
    { label: "Total Saídas", value: saidas },
    { label: "Saldo em Caixa (Realizado)", value: saldo },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground">Fluxo de Caixa</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(k.value)}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Descrição</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Situação</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Valor</th>
            </tr>
          </thead>
          <tbody>
            {entriesWithBalance?.map((row: any) => (
              <tr key={row.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="p-3 text-muted-foreground">{formatDate(row.due_date)}</td>
                <td className="p-3 font-medium text-foreground">{row.description}</td>
                <td className="p-3"><StatusBadge status={row.computedStatus} /></td>
                <td className={`p-3 text-right font-semibold ${row.type === 'income' ? "text-success" : "text-danger"}`}>
                  {row.type === 'income' ? "+" : "-"}{formatCurrency(Math.abs(Number(row.value)))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

