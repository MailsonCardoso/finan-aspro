import { TrendingUp, TrendingDown, DollarSign, ArrowDownLeft, ArrowUpRight, Wallet, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatCurrency } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const PIE_COLORS = ["#9932CC", "#7A28A3", "#B366D9", "#D4A5E8", "#E8CCF2"];

export function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await api.get("/dashboard/stats");
      return response.data;
    },
  });

  const kpis = [
    {
      label: "Saldo em Caixa",
      value: stats?.saldo_caixa || 0,
      trend: stats?.saldo_caixa_trend || 0,
      up: (stats?.saldo_caixa_trend || 0) >= 0,
      icon: Wallet
    },
    {
      label: "A Receber",
      value: stats?.a_receber || 0,
      trend: stats?.a_receber_trend || 0,
      up: (stats?.a_receber_trend || 0) >= 0,
      icon: ArrowDownLeft
    },
    {
      label: "A Pagar",
      value: stats?.a_pagar || 0,
      trend: stats?.a_pagar_trend || 0,
      up: (stats?.a_pagar_trend || 0) <= 0, // Lower trend is "up" for accounts payable? Actually red/green logic usually means "good" or "bad". More debt is usually bad (red).
      icon: ArrowUpRight
    },
    {
      label: "Lucro Líquido",
      value: stats?.lucro_liquido || 0,
      trend: stats?.lucro_liquido_trend || 0,
      up: (stats?.lucro_liquido_trend || 0) >= 0,
      icon: DollarSign
    },
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

      <div className="flex flex-col gap-6">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Fluxo de Caixa — Últimos 6 Meses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.cash_flow_data || []} barGap={4}>
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
              <Pie
                data={stats?.cost_structure || []}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {[0, 1, 2, 3].map((_, i) => (
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

