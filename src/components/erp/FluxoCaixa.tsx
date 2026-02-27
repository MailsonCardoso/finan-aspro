import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Loader2, Plus, Calendar, Printer } from "lucide-react";
import { MonthYearPicker } from "./MonthYearPicker";
import { SidePanel } from "./SidePanel";
import { toast } from "sonner";

export function FluxoCaixa() {
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState("");
  const queryClient = useQueryClient();

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (!val) {
      setDisplayValue("");
      return;
    }
    const numberValue = Number(val) / 100;
    setDisplayValue(numberValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
  };

  const { data: entries, isLoading } = useQuery({
    queryKey: ["financial-entries", "all", selectedMonth, selectedYear],
    queryFn: async () => {
      const response = await api.get(`/financial/entries?month=${selectedMonth}&year=${selectedYear}`);
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

  const filteredEntries = filterType === "all"
    ? entriesWithBalance
    : entriesWithBalance.filter((d: any) => d.type === filterType);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Fluxo de Caixa</h2>
          <p className="text-sm text-muted-foreground">Visão detalhada de movimentações financeiras.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="h-9 px-3 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Todos os Lançamentos</option>
            <option value="income">Somente Entradas</option>
            <option value="expense">Somente Saídas</option>
          </select>
          <MonthYearPicker
            month={selectedMonth}
            year={selectedYear}
            onChange={(m, y) => {
              setSelectedMonth(m);
              setSelectedYear(y);
            }}
          />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl hover:bg-muted transition-all text-sm font-semibold no-print"
          >
            <Printer className="h-4 w-4" /> Imprimir
          </button>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all text-sm font-semibold no-print">
            <Plus className="h-4 w-4" /> Novo Lançamento
          </button>
        </div>
      </div>

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
            {filteredEntries?.map((row: any) => (
              <tr key={row.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="p-3 text-muted-foreground text-[11px] font-medium">
                  {formatDate(row.issue_date || row.due_date)} | {formatDate(row.due_date)}
                </td>
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

      <SidePanel open={modalOpen} onOpenChange={setModalOpen} title="Novo Lançamento Rápido">
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const rawValue = formData.get('value') as string;
          const numericValue = rawValue ? Number(rawValue.replace(/\D/g, '')) / 100 : 0;

          const payload = {
            description: formData.get('description'),
            value: numericValue,
            due_date: formData.get('due_date'),
            issue_date: formData.get('issue_date'),
            type: formData.get('type'),
            bank_account: formData.get('bank_account'),
            payment_method: formData.get('payment_method'),
            expense_type: formData.get('expense_type') || 'fixa',
            status: formData.get('already_paid') === 'on' ? 'paid' : 'pending'
          };

          api.post('/financial/entries', payload).then(() => {
            queryClient.invalidateQueries({ queryKey: ["financial-entries"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
            queryClient.invalidateQueries({ queryKey: ["dre"] });
            setModalOpen(false);
            setDisplayValue("");
            toast.success("Lançamento realizado!");
          });
        }} className="space-y-4 pb-10">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex flex-col gap-3 mb-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Use este atalho para lançar **Saldos Iniciais** ou movimentações rápidas sem sair desta tela.
              </p>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border border-primary/10">
              <input
                type="checkbox"
                id="is_saldo_inicial"
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  const descInput = document.getElementsByName('description')[0] as HTMLInputElement;
                  const incomeRadio = document.getElementsByName('type')[0] as HTMLInputElement;
                  const expenseRadio = document.getElementsByName('type')[1] as HTMLInputElement;

                  if (isChecked) {
                    descInput.value = "Saldo Inicial";
                    incomeRadio.checked = true;
                    expenseRadio.disabled = true;
                  } else {
                    descInput.value = "";
                    expenseRadio.disabled = false;
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="is_saldo_inicial" className="text-xs font-black text-primary uppercase cursor-pointer">
                É um Saldo Inicial?
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Tipo de Movimentação</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-muted/50 has-[:checked]:bg-success/10 has-[:checked]:border-success has-[:checked]:text-success transition-all has-[:disabled]:opacity-50">
                <input type="radio" name="type" value="income" defaultChecked className="hidden" />
                <span className="text-xs font-bold uppercase">Entrada (+)</span>
              </label>
              <label className="flex items-center justify-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-muted/50 has-[:checked]:bg-danger/10 has-[:checked]:border-danger has-[:checked]:text-danger transition-all has-[:disabled]:opacity-50">
                <input type="radio" name="type" value="expense" className="hidden" />
                <span className="text-xs font-bold uppercase">Saída (-)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Descrição</label>
            <input name="description" placeholder="Ex: Saldo Inicial, Venda Rápida..." required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Banco</label>
              <select name="bank_account" className="w-full border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required>
                <option value="">Selecione...</option>
                <option value="Nubank">Nubank</option>
                <option value="Banco Inter">Banco Inter</option>
                <option value="Caixa">Caixa</option>
                <option value="Bradesco">Bradesco</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Forma</label>
              <select name="payment_method" className="w-full border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required>
                <option value="">Selecione...</option>
                <option value="Pix">Pix</option>
                <option value="Boleto">Boleto</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Classificação (Para o DRE)</label>
            <select name="expense_type" className="w-full border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="fixa">Despesa Fixa / Operacional</option>
              <option value="variavel">Custo Variável</option>
              <option value="imposto">Imposto</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Data</label>
              <input name="due_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input name="issue_date" type="hidden" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Valor (R$)</label>
              <input
                name="value"
                type="text"
                value={displayValue}
                onChange={handleValueChange}
                required
                placeholder="R$ 0,00"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-dashed border-primary/20">
            <input
              type="checkbox"
              name="already_paid"
              id="already_paid_quick"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="already_paid_quick" className="text-sm font-semibold text-foreground cursor-pointer">
              Lançamento já realizado (Pago/Recebido)
            </label>
          </div>

          <div className="pt-4 border-t mt-6">
            <button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-all shadow-lg active:scale-95 font-bold text-sm">
              Confirmar Lançamento
            </button>
          </div>
        </form>
      </SidePanel>

      <style>{`
        @media print {
          @page { 
            size: A4 landscape; 
            margin: 10mm; 
          }
          
          html, body {
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .no-print, button, select, [role="dialog"], .SidePanel, .toast, header, aside { 
            display: none !important; 
          }
          
          .lg\\:ml-64 { margin-left: 0 !important; }
          main { 
            padding: 0 !important; 
            margin: 0 !important;
            display: block !important;
            float: none !important;
          }
          
          .bg-card { 
            border: none !important; 
            background: transparent !important;
            box-shadow: none !important; 
            break-inside: avoid;
          }
          
          body { 
            background: white !important; 
            color: black !important;
          }
          
          .animate-fade-in { animation: none !important; }
          
          table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            margin-top: 20px;
            break-inside: auto;
          }

          tr { break-inside: avoid; break-after: auto; }
          
          th, td { 
            border: 1px solid #ddd !important; 
            padding: 8px !important;
          }
          
          th { background-color: #f9f9f9 !important; -webkit-print-color-adjust: exact; }
          
          .text-primary { color: black !important; }
          .text-success { color: #15803d !important; }
          .text-danger { color: #b91c1c !important; }
          .text-muted-foreground { color: #666 !important; }
        }
      `}</style>
    </div>
  );
}
