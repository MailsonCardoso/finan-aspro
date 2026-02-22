import { TrendingUp, TrendingDown, DollarSign, ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { formatCurrency } from "@/lib/format";

const kpis = [
  { label: "Saldo em Caixa", value: 284350.0, trend: 12.5, up: true, icon: Wallet },
  { label: "A Receber", value: 156780.0, trend: 8.3, up: true, icon: ArrowDownLeft },
  { label: "A Pagar", value: 98420.0, trend: 3.1, up: false, icon: ArrowUpRight },
  { label: "Lucro Líquido", value: 67230.0, trend: 15.2, up: true, icon: DollarSign },
];

const cashFlowData = [
  { month: "Jul", Receitas: 85000, Despesas: 62000 },
  { month: "Ago", Receitas: 92000, Despesas: 71000 },
  { month: "Set", Receitas: 78000, Despesas: 65000 },
  { month: "Out", Receitas: 105000, Despesas: 73000 },
  { month: "Nov", Receitas: 98000, Despesas: 80000 },
  { month: "Dez", Receitas: 115000, Despesas: 85000 },
];

const costData = [
  { name: "Folha de Pagamento", value: 42 },
  { name: "Fornecedores", value: 25 },
  { name: "Impostos", value: 18 },
  { name: "Operacional", value: 10 },
  { name: "Outros", value: 5 },
];

const PIE_COLORS = ["#9932CC", "#7A28A3", "#B366D9", "#D4A5E8", "#E8CCF2"];

export function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-lg border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">{kpi.label}</span>
              <div className="p-2 rounded-lg bg-secondary">
                <kpi.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(kpi.value)}</p>
            <div className="flex items-center mt-2 gap-1">
              {kpi.up ? (
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-danger" />
              )}
              <span className={`text-xs font-medium ${kpi.up ? "text-success" : "text-danger"}`}>
                {kpi.trend}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs mês anterior</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-lg border p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Fluxo de Caixa — Últimos 6 Meses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cashFlowData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,6%,90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(250,10%,45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(250,10%,45%)" tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: 8, border: "1px solid hsl(40,6%,90%)" }} />
              <Bar dataKey="Receitas" fill="#9932CC" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Despesas" fill="#D4A5E8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Estrutura de Custos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={costData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {costData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
