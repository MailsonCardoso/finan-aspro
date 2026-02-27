import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import {
    Loader2,
    BarChart3,
    Wallet,
    CreditCard,
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart as PieChartIcon,
    ArrowUpRight,
    ArrowDownRight,
    Printer
} from "lucide-react";
import { MonthYearPicker } from "./MonthYearPicker";

interface AnalysisData {
    periodo: string;
    by_account: Array<{
        account: string;
        income: number;
        expense: number;
        balance: number;
    }>;
    by_method: Array<{
        method: string;
        income: number;
        expense: number;
        total: number;
        count: number;
    }>;
    total_month: {
        income: number;
        expense: number;
    };
}

export function AnaliseFinanceira() {
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    const { data, isLoading } = useQuery<AnalysisData>({
        queryKey: ["financial-analysis", selectedMonth, selectedYear],
        queryFn: async () => {
            const response = await api.get(`/financial/analysis?month=${selectedMonth}&year=${selectedYear}`);
            return response.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    const totalIncome = data?.total_month.income || 0;
    const totalExpense = data?.total_month.expense || 0;
    const totalBalance = totalIncome - totalExpense;

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-foreground tracking-tight">Análise Financeira Consolidada</h2>
                    <p className="text-sm text-muted-foreground">Consolidado por Contas Bancárias e Formas de Pagamento.</p>
                </div>
                <div className="flex items-center gap-2 no-print">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl hover:bg-muted transition-all text-sm font-semibold"
                    >
                        <Printer className="h-4 w-4" /> Imprimir Análise
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

            {/* Resumo Geral */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-2xl border shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Recebido</p>
                        <p className="text-2xl font-black text-foreground">{formatCurrency(totalIncome)}</p>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-2xl border shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-danger/10 flex items-center justify-center text-danger">
                        <TrendingDown size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Pago</p>
                        <p className="text-2xl font-black text-foreground">{formatCurrency(totalExpense)}</p>
                    </div>
                </div>
                <div className="bg-primary p-6 rounded-2xl shadow-lg shadow-primary/20 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                        <DollarSign size={24} />
                    </div>
                    <div className="text-white">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Saldo Líquido</p>
                        <p className="text-2xl font-black">{formatCurrency(totalBalance)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Agrupamento por Banco */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-lg">Movimentação por Bancos</h3>
                    </div>
                    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/30">
                                <tr className="border-b">
                                    <th className="text-left p-4 font-bold uppercase text-[10px] text-muted-foreground">Instituição</th>
                                    <th className="text-right p-4 font-bold uppercase text-[10px] text-muted-foreground">Entradas</th>
                                    <th className="text-right p-4 font-bold uppercase text-[10px] text-muted-foreground">Saídas</th>
                                    <th className="text-right p-4 font-bold uppercase text-[10px] text-muted-foreground">Líquido</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data?.by_account.map((acc, i) => (
                                    <tr key={i} className="hover:bg-muted/10 transition-colors">
                                        <td className="p-4 font-bold text-foreground capitalize">{acc.account}</td>
                                        <td className="p-4 text-right text-success font-medium">{formatCurrency(acc.income)}</td>
                                        <td className="p-4 text-right text-danger font-medium">{formatCurrency(acc.expense)}</td>
                                        <td className={`p-4 text-right font-black ${acc.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                                            {formatCurrency(acc.balance)}
                                        </td>
                                    </tr>
                                ))}
                                {(!data?.by_account || data.by_account.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-muted-foreground italic">Nenhuma movimentação bancária registrada.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Agrupamento por Forma de Pagamento */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <PieChartIcon className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-lg">Separação por Forma de Pagamento</h3>
                    </div>
                    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/30">
                                <tr className="border-b">
                                    <th className="text-left p-4 font-bold uppercase text-[10px] text-muted-foreground">Método</th>
                                    <th className="text-right p-4 font-bold uppercase text-[10px] text-muted-foreground">Volume</th>
                                    <th className="text-right p-4 font-bold uppercase text-[10px] text-muted-foreground">Entradas</th>
                                    <th className="text-right p-4 font-bold uppercase text-[10px] text-muted-foreground">Saídas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data?.by_method.sort((a, b) => b.total - a.total).map((method, i) => (
                                    <tr key={i} className="hover:bg-muted/10 transition-colors">
                                        <td className="p-4 flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                            <span className="font-bold text-foreground">{method.method}</span>
                                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-black">{method.count}x</span>
                                        </td>
                                        <td className="p-4 text-right font-medium text-muted-foreground">{formatCurrency(method.total)}</td>
                                        <td className="p-4 text-right text-success font-black">{formatCurrency(method.income)}</td>
                                        <td className="p-4 text-right text-danger font-black">{formatCurrency(method.expense)}</td>
                                    </tr>
                                ))}
                                {(!data?.by_method || data.by_method.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-muted-foreground italic">Nenhuma movimentação por método registrada.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
        @media print {
          @page { 
            size: A4 portrait; 
            margin: 15mm; 
          }
          
          .no-print, button, select, [role="dialog"], .SidePanel, .toast, header, aside { 
            display: none !important; 
          }
          
          .lg\\:ml-64 { margin-left: 0 !important; }
          main { padding: 0 !important; }
          
          .bg-card { 
            border: none !important; 
            background: transparent !important;
            box-shadow: none !important; 
          }
          
          body { 
            background: white !important; 
            color: black !important;
          }
          
          .animate-fade-in { animation: none !important; }
          .grid { display: block !important; }
          .lg\\:col-span-2, .lg\\:col-span-1 { width: 100% !important; margin-bottom: 20px; }
          
          .text-primary { color: black !important; }
          .text-success { color: #15803d !important; }
          .text-danger { color: #b91c1c !important; }
          .text-muted-foreground { color: #666 !important; }

          .grid-cols-1, .grid-cols-2, .lg\\:grid-cols-2, .md\\:grid-cols-3 { display: block !important; }
          .gap-6, .gap-8 { margin-bottom: 20px !important; }
          div { break-inside: avoid; }
        }
      `}</style>
        </div>
    );
}
