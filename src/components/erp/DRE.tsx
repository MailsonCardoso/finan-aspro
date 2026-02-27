import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { Loader2, AlertCircle, TrendingUp, BarChart3, PieChart, FileText, Printer } from "lucide-react";
import { MonthYearPicker } from "./MonthYearPicker";

interface DREData {
  periodo: string;
  receita_bruta: number;
  impostos: number;
  receita_liquida: number;
  custos_variaveis: number;
  margem_contribuicao: number;
  despesas_operacionais: number;
  lucro_liquido: number;
  detalhes: {
    por_categoria: Record<string, { type: string; total: number }>;
  };
}

export function DRE() {
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const { data, isLoading, error } = useQuery<DREData>({
    queryKey: ["dre", selectedMonth, selectedYear],
    queryFn: async () => {
      const response = await api.get(`/financial/dre?month=${selectedMonth}&year=${selectedYear}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Calculando demonstrativo...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-danger/5 rounded-2xl border border-danger/20">
        <AlertCircle className="h-10 w-10 mb-4 text-danger" />
        <h3 className="text-lg font-bold text-danger mb-2">Ops! Falha na Geração</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Não conseguimos processar o DRE. Verifique se o backend na VPS está configurado corretamente.
        </p>
      </div>
    );
  }

  const rows = [
    { label: "(+) RECEITA BRUTA OPERACIONAL", value: data.receita_bruta, bold: true, type: 'income' },
    { label: "(-) Impostos sobre Vendas", value: -data.impostos, bold: false, type: 'expense' },
    { label: "(=) RECEITA LÍQUIDA", value: data.receita_liquida, bold: true, type: 'result' },
    { label: "(-) Custos Variáveis (Insumos/Fornec.)", value: -data.custos_variaveis, bold: false, type: 'expense' },
    { label: "(=) MARGEM DE CONTRIBUIÇÃO", value: data.margem_contribuicao, bold: true, type: 'result' },
    { label: "(-) Despesas Fixas / Operacionais", value: -data.despesas_operacionais, bold: false, type: 'expense' },
    { label: "(=) LUCRO LÍQUIDO DO PERÍODO", value: data.lucro_liquido, bold: true, type: 'result' },
  ];

  const margemLiquida = data.receita_bruta > 0
    ? (data.lucro_liquido / data.receita_bruta) * 100
    : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Relatório Contábil</span>
            </div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">DRE Corporativo</h2>
            <p className="text-sm text-muted-foreground">Demonstrativo do Resultado do Exercício consolidado.</p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl hover:bg-muted transition-all text-sm font-semibold"
            >
              <Printer className="h-4 w-4" /> Imprimir DRE
            </button>
            <MonthYearPicker
              month={selectedMonth}
              year={selectedYear}
              onChange={(m, y) => {
                setSelectedMonth(m);
                setSelectedYear(y);
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 bg-card border px-5 py-3 rounded-2xl shadow-sm">
          <div className="text-right border-r pr-4 border-dashed">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Mês de Referência</p>
            <p className="text-xl font-black text-foreground">{data.periodo}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Status Contábil</p>
            <div className="flex items-center gap-1.5 justify-end mt-1">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-bold text-success uppercase">Consolidado</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main DRE Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card rounded-3xl border shadow-xl overflow-hidden">
            <div className="p-6 bg-muted/30 border-b border-dashed flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Estrutura de Resultados
              </h3>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-bold uppercase">Valores em Reais (BRL)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/10">
                    <th className="text-left py-4 px-8 font-bold text-[10px] uppercase text-muted-foreground tracking-widest">Conta Descritiva</th>
                    <th className="text-right py-4 px-8 font-bold text-[10px] uppercase text-muted-foreground tracking-widest">Saldo (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed">
                  {rows.map((row, i) => (
                    <tr
                      key={i}
                      className={`transition-all ${row.bold ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/10 group"
                        }`}
                    >
                      <td className={`py-6 px-8 ${row.bold ? "font-black text-foreground text-lg" : "text-muted-foreground font-medium pl-14 relative"}`}>
                        {!row.bold && <div className="absolute left-10 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors" />}
                        {row.label}
                      </td>
                      <td className={`py-6 px-8 text-right font-black ${row.value >= 0 ? "text-success" : "text-danger"
                        } ${row.bold ? "text-xl" : "text-lg"}`}>
                        {formatCurrency(row.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-start gap-4">
            <TrendingUp className="h-6 w-6 text-primary mt-1" />
            <div>
              <h4 className="font-bold text-primary mb-1">Análise de Performance</h4>
              <p className="text-sm text-foreground/70 leading-relaxed">
                Neste período, a empresa obteu uma margem líquida de <span className="font-bold text-primary">{margemLiquida.toFixed(2)}%</span>.
                {margemLiquida > 15
                  ? " O resultado indica uma excelente eficiência operacional e controle de custos fixos."
                  : " Recomenda-se a revisão dos custos variáveis para otimização da margem de lucro bruto."}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-6">
          {/* Liquidity Widget */}
          <div className="bg-sidebar p-8 rounded-3xl text-sidebar-foreground border-t-4 border-primary shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
              <PieChart size={120} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 opacity-80">Rendimento Líquido</p>
            <div className="text-5xl font-black mb-2 tracking-tighter">
              {margemLiquida.toFixed(1)}<span className="text-2xl text-primary">%</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mt-6">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, margemLiquida))}%` }}
              />
            </div>
            <p className="text-[10px] mt-4 text-white/50 leading-relaxed">Considerando a Receita Bruta menos todos os custos e despesas apurados.</p>
          </div>

          {/* Categories Chart Alternative */}
          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Gastos por Categoria
            </h3>
            <div className="space-y-3">
              {Object.entries(data.detalhes.por_categoria)
                .filter(([_, info]) => info.type === 'expense')
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 5)
                .map(([category, info]) => (
                  <div key={category} className="group">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-muted-foreground group-hover:text-primary transition-colors">{category || 'Diversas'}</span>
                      <span className="font-black text-foreground">{formatCurrency(info.total)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full">
                      <div
                        className="h-full bg-danger/60 rounded-full"
                        style={{ width: `${Math.min(100, (info.total / data.despesas_operacionais) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { 
            size: A4 portrait; 
            margin: 0; 
          }
          
          /* Hide EVERYTHING */
          body > * { 
            display: none !important; 
          }

          /* Force display only the printable content */
          body > div[data-state], 
          .lg\\:ml-64,
          main,
          .animate-fade-in {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
          }

          /* Target the DRE container specifically */
          .space-y-8 {
            display: block !important;
            width: 210mm !important;
            height: 297mm !important;
            padding: 10mm !important;
            box-sizing: border-box !important;
            background: white !important;
            overflow: hidden !important;
            position: fixed !important;
            top: 0;
            left: 0;
            z-index: 99999;
          }

          .no-print, button, select, [role="dialog"], .SidePanel, .toast, header, aside, .lucide { 
            display: none !important; 
          }
          
          .bg-card, .bg-sidebar { 
            border: 1px solid #eee !important;
            background: transparent !important;
            box-shadow: none !important;
            margin-bottom: 8px !important;
            padding: 10px !important;
          }

          /* Extreme Table Compaction */
          table { margin-top: 5px !important; }
          th, td { padding: 4px 8px !important; border-bottom: 1px solid #eee !important; }
          .py-6 { padding-top: 4px !important; padding-bottom: 4px !important; }
          
          /* Font resets */
          .text-3xl { font-size: 16pt !important; margin: 0 !important; }
          .text-xl { font-size: 11pt !important; }
          .text-lg { font-size: 9pt !important; }
          h2, h3, h4 { margin-bottom: 4px !important; }
          
          /* Force grid items to stack tightly */
          .grid { display: block !important; }
          .lg\\:col-span-8, .lg\\:col-span-12, .lg\\:col-span-4 { 
            width: 100% !important; 
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .text-primary { color: black !important; }
          .text-success { color: #15803d !important; }
          .text-danger { color: #b91c1c !important; }
          
          /* Hide Analysis text if space is tight */
          .bg-primary\\/5 { margin-top: 5px !important; padding: 10px !important; }
        }
      `}</style>
    </div>
  );
}

