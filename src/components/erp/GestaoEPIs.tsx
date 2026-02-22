import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/format";
import { Modal } from "./Modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export function GestaoEPIs({ modalOpen, onCloseModal, preselectedEmployee }: { modalOpen: boolean; onCloseModal: () => void; preselectedEmployee?: string }) {
  const [internalModal, setInternalModal] = useState(false);
  const isOpen = modalOpen || internalModal;
  const queryClient = useQueryClient();

  const handleClose = () => { onCloseModal(); setInternalModal(false); };

  const { data: assignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ["epi-assignments"],
    queryFn: async () => {
      const response = await api.get("/epis/assignments");
      return response.data;
    },
  });

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await api.get("/employees");
      return response.data;
    },
  });

  const { data: epis } = useQuery({
    queryKey: ["epis"],
    queryFn: async () => {
      const response = await api.get("/epis");
      return response.data;
    },
  });

  const kpis = [
    { label: "EPIs Ativos", value: assignments?.filter((a: any) => a.status === 'delivered').length.toString() || "0" },
    { label: "Vencendo / Vencidos", value: assignments?.filter((a: any) => a.status === 'expired').length.toString() || "0" },
    { label: "Total Registros", value: assignments?.length.toString() || "0" },
  ];

  if (loadingAssignments) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            </tr>
          </thead>
          <tbody>
            {assignments?.map((row: any) => (
              <tr key={row.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium text-foreground">{row.employee?.name}</td>
                <td className="p-3 text-muted-foreground">{row.epi?.name}</td>
                <td className="p-3 text-muted-foreground">{formatDate(row.assignment_date)}</td>
                <td className="p-3 text-muted-foreground">{formatDate(row.expiry_date)}</td>
                <td className="p-3"><StatusBadge status={row.status === 'delivered' ? 'Válido' : 'Vencido'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={isOpen} onClose={handleClose} title="Vincular EPI">
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const payload = {
            employee_id: formData.get('employee_id'),
            epi_id: formData.get('epi_id'),
            assignment_date: formData.get('assignment_date'),
            expiry_date: formData.get('expiry_date'),
            status: 'delivered'
          };

          api.post('/epis/assignments', payload).then(() => {
            queryClient.invalidateQueries({ queryKey: ["epi-assignments"] });
            handleClose();
            toast.success("EPI vinculado com sucesso!");
          });
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Funcionário</label>
            <select name="employee_id" required defaultValue={preselectedEmployee || ""} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="" disabled>Selecione o funcionário</option>
              {employees?.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Tipo de EPI</label>
            <select name="epi_id" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="" disabled selected>Selecione o EPI</option>
              {epis?.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Data da Entrega</label>
              <input name="assignment_date" type="date" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Próxima Troca (Validade)</label>
              <input name="expiry_date" type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm">
            Vincular EPI
          </button>
        </form>
      </Modal>
    </div>
  );
}

