import { useState } from "react";
import { Search, Plus, Edit, Shield, Loader2, Trash2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/format";
import { SidePanel } from "./SidePanel";
import { ConfirmModal } from "./ConfirmModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export function Funcionarios({ onOpenEPI }: { onOpenEPI: (employeeName?: string) => void }) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await api.get("/employees");
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Funcionário excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir funcionário.");
    },
  });

  const handleDelete = (id: number) => {
    setEmployeeToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleEdit = (emp: any) => {
    setEditingEmployee(emp);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEmployee(null);
  };

  const filtered = employees?.filter((e: any) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalAtivos = employees?.filter((e: any) => e.status === "active").length || 0;

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
          <p className="text-sm text-muted-foreground">Total Cadastrados</p>
          <p className="text-xl font-bold text-foreground mt-1">{employees?.length || 0}</p>
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
              <th className="text-left p-3 font-medium text-muted-foreground">Cargo</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Data Admissão</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp: any) => (
              <tr key={emp.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary">
                      {emp.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <span className="font-medium text-foreground">{emp.name}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{emp.role}</td>
                <td className="p-3 text-muted-foreground">{formatDate(emp.admission_date)}</td>
                <td className="p-3"><StatusBadge status={emp.status === 'active' ? 'Ativo' : 'Inativo'} /></td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onOpenEPI(emp.name)} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors font-medium">
                      <Shield className="h-3 w-3" /> Vincular EPI
                    </button>
                    <button onClick={() => handleEdit(emp)} title="Editar" className="p-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-muted transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(emp.id)} title="Excluir" className="p-1.5 bg-danger/10 text-danger rounded-md hover:bg-danger/20 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SidePanel open={modalOpen} onOpenChange={setModalOpen} title={editingEmployee ? "Editar Funcionário" : "Novo Funcionário"}>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const payload = {
            name: formData.get('name'),
            role: formData.get('role'),
            admission_date: formData.get('admission_date'),
            status: editingEmployee?.status || 'active'
          };

          const request = editingEmployee
            ? api.put(`/employees/${editingEmployee.id}`, payload)
            : api.post('/employees', payload);

          request.then(() => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            closeModal();
            toast.success(editingEmployee ? "Funcionário atualizado!" : "Funcionário cadastrado!");
          });
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nome Completo</label>
            <input name="name" defaultValue={editingEmployee?.name} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Cargo</label>
              <input name="role" defaultValue={editingEmployee?.role} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Data de Admissão</label>
              <input name="admission_date" type="date" defaultValue={editingEmployee?.admission_date ? editingEmployee.admission_date.split('T')[0] : ""} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div className="pt-4 border-t mt-6">
            <button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-all shadow-lg active:scale-95 font-bold text-sm">
              {editingEmployee ? "Salvar Alterações" : "Cadastrar Funcionário"}
            </button>
          </div>
        </form>
      </SidePanel>

      <ConfirmModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={() => employeeToDelete && deleteMutation.mutate(employeeToDelete)}
        title="Excluir Funcionário"
        description="Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita."
        confirmText="Excluir"
      />
    </div>
  );
}

