import { useState } from "react";
import { Search, Plus, Edit, Shield } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/format";
import { Modal } from "./Modal";

const employees = [
  { id: 1, nome: "Ana Clara Souza", cargo: "Analista de Sistemas", depto: "TI", admissao: "2022-03-15", estado: "Ativo", avatar: "AC" },
  { id: 2, nome: "Carlos Eduardo Lima", cargo: "Gerente Financeiro", depto: "Financeiro", admissao: "2019-07-01", estado: "Ativo", avatar: "CE" },
  { id: 3, nome: "Mariana Ferreira", cargo: "Coordenadora RH", depto: "RH", admissao: "2021-11-20", estado: "Ativo", avatar: "MF" },
  { id: 4, nome: "Pedro Henrique Alves", cargo: "Desenvolvedor Frontend", depto: "TI", admissao: "2024-10-01", estado: "Experiência", avatar: "PH" },
  { id: 5, nome: "Juliana Costa", cargo: "Assistente Administrativo", depto: "Administrativo", admissao: "2023-05-10", estado: "Ativo", avatar: "JC" },
  { id: 6, nome: "Rafael Martins", cargo: "Técnico de Segurança", depto: "SESMT", admissao: "2024-11-15", estado: "Experiência", avatar: "RM" },
];

const totalAtivos = employees.filter(e => e.estado === "Ativo").length;
const novasContratacoes = employees.filter(e => e.estado === "Experiência").length;

export function Funcionarios({ onOpenEPI }: { onOpenEPI: (employeeName?: string) => void }) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = employees.filter(e => e.nome.toLowerCase().includes(search.toLowerCase()) || e.cargo.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Funcionários</h2>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium">
          <Plus className="h-4 w-4" /> Novo Funcionário
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Ativos</p>
          <p className="text-xl font-bold text-foreground mt-1">{totalAtivos}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Novas Contratações</p>
          <p className="text-xl font-bold text-foreground mt-1">{novasContratacoes}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" placeholder="Buscar por nome ou cargo..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">Nome</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Cargo / Departamento</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Data Admissão</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(emp => (
              <tr key={emp.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary">{emp.avatar}</div>
                    <span className="font-medium text-foreground">{emp.nome}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{emp.cargo} <span className="text-xs">• {emp.depto}</span></td>
                <td className="p-3 text-muted-foreground">{formatDate(emp.admissao)}</td>
                <td className="p-3"><StatusBadge status={emp.estado} /></td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onOpenEPI(emp.nome)} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors font-medium">
                      <Shield className="h-3 w-3" /> Vincular EPI
                    </button>
                    <button className="text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-muted transition-colors font-medium">
                      <Edit className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Funcionário">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nome Completo</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Cargo</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Departamento</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Data de Admissão</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm">
            Cadastrar Funcionário
          </button>
        </div>
      </Modal>
    </div>
  );
}
