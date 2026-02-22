import { useState } from "react";
import { Plus } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/format";
import { Modal } from "./Modal";

const epiData = [
  { id: 1, funcionario: "Ana Clara Souza", epi: "Óculos de Proteção", entrega: "2024-08-10", validade: "2025-08-10", estado: "Válido" },
  { id: 2, funcionario: "Carlos Eduardo Lima", epi: "Capacete de Segurança", entrega: "2024-06-15", validade: "2025-06-15", estado: "Válido" },
  { id: 3, funcionario: "Pedro Henrique Alves", epi: "Luvas Isolantes", entrega: "2024-03-20", validade: "2025-01-20", estado: "Vencido" },
  { id: 4, funcionario: "Rafael Martins", epi: "Protetor Auricular", entrega: "2024-11-01", validade: "2025-02-01", estado: "Vencendo" },
  { id: 5, funcionario: "Juliana Costa", epi: "Sapato de Segurança", entrega: "2024-09-05", validade: "2025-09-05", estado: "Válido" },
  { id: 6, funcionario: "Mariana Ferreira", epi: "Máscara PFF2", entrega: "2024-12-01", validade: "2025-03-01", estado: "Vencendo" },
];

const ativos = epiData.filter(e => e.estado === "Válido").length;
const vencendo = epiData.filter(e => e.estado === "Vencendo").length;
const conformidade = Math.round((ativos / epiData.length) * 100);

const kpis = [
  { label: "EPIs Ativos", value: ativos.toString() },
  { label: "Vencendo em Breve", value: vencendo.toString() },
  { label: "Conformidade", value: `${conformidade}%` },
];

const employeeOptions = ["Ana Clara Souza", "Carlos Eduardo Lima", "Mariana Ferreira", "Pedro Henrique Alves", "Juliana Costa", "Rafael Martins"];
const epiTypes = ["Capacete de Segurança", "Óculos de Proteção", "Luvas Isolantes", "Protetor Auricular", "Sapato de Segurança", "Máscara PFF2", "Cinto de Segurança"];

export function GestaoEPIs({ modalOpen, onCloseModal, preselectedEmployee }: { modalOpen: boolean; onCloseModal: () => void; preselectedEmployee?: string }) {
  const [internalModal, setInternalModal] = useState(false);
  const isOpen = modalOpen || internalModal;
  const handleClose = () => { onCloseModal(); setInternalModal(false); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Gestão de EPIs</h2>
        <button onClick={() => setInternalModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium">
          <Plus className="h-4 w-4" /> Vincular EPI
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">Funcionário</th>
              <th className="text-left p-3 font-medium text-muted-foreground">EPI Entregue</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Data da Entrega</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Próxima Troca</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {epiData.map(row => (
              <tr key={row.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium text-foreground">{row.funcionario}</td>
                <td className="p-3 text-muted-foreground">{row.epi}</td>
                <td className="p-3 text-muted-foreground">{formatDate(row.entrega)}</td>
                <td className="p-3 text-muted-foreground">{formatDate(row.validade)}</td>
                <td className="p-3"><StatusBadge status={row.estado} /></td>
                <td className="p-3 text-right">
                  <button className="text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-primary hover:text-primary-foreground transition-colors font-medium">
                    Registrar Baixa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={isOpen} onClose={handleClose} title="Vincular EPI">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Funcionário</label>
            <select defaultValue={preselectedEmployee || ""} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="" disabled>Selecione o funcionário</option>
              {employeeOptions.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Tipo de EPI</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="" disabled selected>Selecione o EPI</option>
              {epiTypes.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Data da Entrega</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Próxima Troca (Validade)</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm">
            Vincular EPI
          </button>
        </div>
      </Modal>
    </div>
  );
}
