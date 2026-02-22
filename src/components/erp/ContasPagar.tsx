import { useState } from "react";
import { Search, Calendar, Plus } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import { Modal } from "./Modal";

const data = [
  { id: 1, desc: "Aluguel Escritório", fornecedor: "Imobiliária Central", emissao: "2025-01-01", vencimento: "2025-01-10", estado: "Pago", valor: 8500 },
  { id: 2, desc: "Energia Elétrica", fornecedor: "CEMIG", emissao: "2025-01-05", vencimento: "2025-01-20", estado: "Pendente", valor: 2340 },
  { id: 3, desc: "Internet Fibra", fornecedor: "Vivo Empresas", emissao: "2025-01-08", vencimento: "2025-02-08", estado: "Pendente", valor: 890 },
  { id: 4, desc: "Material de Escritório", fornecedor: "Kalunga", emissao: "2024-12-20", vencimento: "2025-01-05", estado: "Atrasado", valor: 1250 },
  { id: 5, desc: "Serviço de Limpeza", fornecedor: "LimpaTudo LTDA", emissao: "2025-01-15", vencimento: "2025-02-15", estado: "Pendente", valor: 3100 },
  { id: 6, desc: "Licenças Microsoft 365", fornecedor: "Microsoft Brasil", emissao: "2025-01-01", vencimento: "2025-01-31", estado: "Pago", valor: 4500 },
];

const kpis = [
  { label: "Total a Pagar", value: data.reduce((a, b) => a + b.valor, 0) },
  { label: "Pago no Mês", value: data.filter(d => d.estado === "Pago").reduce((a, b) => a + b.valor, 0) },
  { label: "Em Atraso", value: data.filter(d => d.estado === "Atrasado").reduce((a, b) => a + b.valor, 0) },
];

export function ContasPagar() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = data.filter(d => {
    const matchSearch = d.desc.toLowerCase().includes(search.toLowerCase()) || d.fornecedor.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Todos" || d.estado === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Contas a Pagar</h2>
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
          <input type="text" placeholder="Buscar por descrição ou fornecedor..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option>Todos</option>
          <option>Pendente</option>
          <option>Pago</option>
          <option>Atrasado</option>
        </select>
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">Descrição</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Fornecedor</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Emissão</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Vencimento</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Valor</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium text-foreground">{row.desc}</td>
                <td className="p-3 text-muted-foreground">{row.fornecedor}</td>
                <td className="p-3 text-muted-foreground">{formatDate(row.emissao)}</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> {formatDate(row.vencimento)}
                  </span>
                </td>
                <td className="p-3"><StatusBadge status={row.estado} /></td>
                <td className="p-3 text-right font-medium text-foreground">{formatCurrency(row.valor)}</td>
                <td className="p-3 text-right">
                  {row.estado !== "Pago" && (
                    <button className="text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-primary hover:text-primary-foreground transition-colors font-medium">
                      Dar Baixa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Conta a Pagar">
        <div className="space-y-4">
          <div className="bg-secondary border border-primary/20 rounded-lg p-3 text-sm">
            <p className="font-medium text-primary mb-1">ℹ️ Datas importantes</p>
            <p className="text-muted-foreground"><strong>Data de Emissão (Competência):</strong> é a data em que o compromisso foi gerado ou a nota fiscal emitida.</p>
            <p className="text-muted-foreground mt-1"><strong>Data de Vencimento:</strong> é a data limite para efetuar o pagamento ao fornecedor.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Descrição</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Fornecedor</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Data de Emissão</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Data de Vencimento</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Valor (R$)</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm">
            Salvar Conta
          </button>
        </div>
      </Modal>
    </div>
  );
}
