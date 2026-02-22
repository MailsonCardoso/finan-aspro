import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";

const data = [
  { id: 1, data: "2025-01-02", desc: "Recebimento Cliente A", categoria: "Receita Operacional", situacao: "Confirmado", valor: 15200 },
  { id: 2, data: "2025-01-03", desc: "Pagamento Aluguel", categoria: "Despesa Fixa", situacao: "Confirmado", valor: -8500 },
  { id: 3, data: "2025-01-05", desc: "Venda de Serviços", categoria: "Receita Operacional", situacao: "Confirmado", valor: 23400 },
  { id: 4, data: "2025-01-08", desc: "Folha de Pagamento", categoria: "Pessoal", situacao: "Confirmado", valor: -42000 },
  { id: 5, data: "2025-01-10", desc: "Recebimento Cliente B", categoria: "Receita Operacional", situacao: "Pendente", valor: 8700 },
  { id: 6, data: "2025-01-12", desc: "Impostos Federais", categoria: "Tributos", situacao: "Pendente", valor: -6200 },
  { id: 7, data: "2025-01-15", desc: "Energia e Telecom", categoria: "Despesa Fixa", situacao: "Pendente", valor: -3230 },
  { id: 8, data: "2025-01-18", desc: "Recebimento Projeto X", categoria: "Receita Operacional", situacao: "Pendente", valor: 31000 },
];

const entradas = data.filter(d => d.valor > 0).reduce((a, b) => a + b.valor, 0);
const saidas = data.filter(d => d.valor < 0).reduce((a, b) => a + Math.abs(b.valor), 0);
const saldo = entradas - saidas;

const kpis = [
  { label: "Entradas", value: entradas },
  { label: "Saídas", value: saidas },
  { label: "Saldo Final", value: saldo },
];

export function FluxoCaixa() {
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
              <th className="text-left p-3 font-medium text-muted-foreground">Data Efetiva</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Descrição</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Categoria</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Situação</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Valor</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="p-3 text-muted-foreground">{formatDate(row.data)}</td>
                <td className="p-3 font-medium text-foreground">{row.desc}</td>
                <td className="p-3 text-muted-foreground">{row.categoria}</td>
                <td className="p-3"><StatusBadge status={row.situacao} /></td>
                <td className={`p-3 text-right font-semibold ${row.valor >= 0 ? "text-success" : "text-danger"}`}>
                  {row.valor >= 0 ? "+" : ""}{formatCurrency(Math.abs(row.valor))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
