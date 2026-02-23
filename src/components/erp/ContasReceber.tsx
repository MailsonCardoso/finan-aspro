import { useState } from "react";
import { Search, Calendar, Plus, Loader2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import { Modal } from "./Modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export function ContasReceber() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
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
    queryKey: ["financial-entries", "income"],
    queryFn: async () => {
      const response = await api.get("/financial/entries?type=income");
      return response.data;
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = entries?.filter((d: any) => {
    const matchSearch = d.description.toLowerCase().includes(search.toLowerCase());

    let computedStatus = d.status;
    if (d.status === 'pending') {
      const isLate = new Date(d.due_date.substring(0, 10) + 'T00:00:00') < today;
      computedStatus = isLate ? 'Atrasado' : 'Pendente';
    } else if (d.status === 'paid') {
      computedStatus = 'Recebido';
    }

    const matchFilter = filter === "Todos" || filter === computedStatus;
    return matchSearch && matchFilter;
  }) || [];

  const kpis = [
    { label: "Total a Receber", value: entries?.reduce((a: number, b: any) => a + Number(b.value), 0) || 0 },
    { label: "Recebido", value: entries?.filter((d: any) => d.status === "paid").reduce((a: number, b: any) => a + Number(b.value), 0) || 0 },
    { label: "Pendente", value: entries?.filter((d: any) => d.status === "pending").reduce((a: number, b: any) => a + Number(b.value), 0) || 0 },
  ];

  const handleConfirmPayment = async (id: number) => {
    try {
      await api.patch(`/financial/entries/${id}/status`, { status: 'paid' });
      queryClient.invalidateQueries({ queryKey: ["financial-entries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Recebimento confirmado!");
    } catch (error) {
      toast.error("Erro ao confirmar recebimento.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Contas a Receber</h2>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium">
          <Plus className="h-4 w-4" /> Nova Conta
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(k.value)}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar por descrição..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="Todos">Todos</option>
          <option value="Pendente">Pendente</option>
          <option value="Recebido">Recebido</option>
        </select>
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">Descrição</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Vencimento</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Valor</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row: any) => (
              <tr key={row.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium text-foreground">{row.description}</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> {formatDate(row.due_date)}
                  </span>
                </td>
                <td className="p-3"><StatusBadge status={row.status === 'paid' ? 'Recebido' : (row.status === 'pending' && new Date(row.due_date.substring(0, 10) + 'T00:00:00') < new Date(new Date().setHours(0, 0, 0, 0)) ? 'Atrasado' : 'Pendente')} /></td>
                <td className="p-3 text-right font-medium text-foreground">{formatCurrency(Number(row.value))}</td>
                <td className="p-3 text-right">
                  {row.status !== "paid" && (
                    <button
                      onClick={() => handleConfirmPayment(row.id)}
                      className="text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
                    >
                      Confirmar Recebimento
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Conta a Receber">
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
            type: 'income',
            status: 'pending'
          };

          api.post('/financial/entries', payload).then(() => {
            queryClient.invalidateQueries({ queryKey: ["financial-entries"] });
            setModalOpen(false);
            setDisplayValue("");
            toast.success("Conta criada com sucesso!");
          });
        }} className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-3 mb-4">
            <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              A <span className="font-bold text-foreground">Data de Emissão (Competência)</span> vai para o DRE do mês.
              A <span className="font-bold text-foreground">Data de Vencimento</span> define quando o valor deve entrar/sair do Fluxo de Caixa.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Descrição</label>
            <input name="description" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Emissão (Competência)</label>
              <input name="issue_date" type="date" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Data de Vencimento</label>
              <input name="due_date" type="date" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
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
          <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm">
            Salvar Conta
          </button>
        </form>
      </Modal>
    </div>
  );
}

