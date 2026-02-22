import { formatCurrency } from "@/lib/format";

const rows = [
  { label: "Receita Bruta de Vendas", value: 520000, bold: false },
  { label: "(-) Deduções sobre Vendas", value: -45000, bold: false },
  { label: "= Receita Líquida", value: 475000, bold: true },
  { label: "(-) Custo dos Produtos Vendidos (CPV)", value: -185000, bold: false },
  { label: "= Lucro Bruto", value: 290000, bold: true },
  { label: "(-) Despesas com Pessoal", value: -98000, bold: false },
  { label: "(-) Despesas Administrativas", value: -32000, bold: false },
  { label: "(-) Despesas Comerciais", value: -18500, bold: false },
  { label: "(-) Despesas Tributárias", value: -24000, bold: false },
  { label: "= EBITDA", value: 117500, bold: true },
  { label: "(-) Depreciação e Amortização", value: -12000, bold: false },
  { label: "(-) Resultado Financeiro", value: -8300, bold: false },
  { label: "= Resultado Antes do IR/CSLL", value: 97200, bold: true },
  { label: "(-) IR e CSLL", value: -29840, bold: false },
  { label: "= Lucro Líquido do Exercício", value: 67360, bold: true },
];

export function DRE() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground">DRE — Demonstração do Resultado do Exercício</h2>
      <p className="text-sm text-muted-foreground">Período: Janeiro/2025</p>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">Conta</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`border-b last:border-b-0 ${row.bold ? "bg-muted/40" : "hover:bg-muted/20"} transition-colors`}>
                <td className={`p-3 ${row.bold ? "font-bold text-foreground" : "text-foreground pl-6"}`}>{row.label}</td>
                <td className={`p-3 text-right ${row.bold ? "font-bold" : "font-medium"} ${row.value >= 0 ? "text-foreground" : "text-danger"}`}>
                  {formatCurrency(Math.abs(row.value))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
