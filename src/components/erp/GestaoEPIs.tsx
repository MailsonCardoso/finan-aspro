import { useState } from "react";
import { Plus, Loader2, RotateCcw, Search } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/format";
import { SidePanel } from "./SidePanel";
import { ConfirmModal } from "./ConfirmModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { FichaEPIControl } from "./FichaEPIControl";
import { FileText } from "lucide-react";

export function GestaoEPIs({ modalOpen, onCloseModal, preselectedEmployee }: { modalOpen: boolean; onCloseModal: () => void; preselectedEmployee?: string }) {
  const [internalModal, setInternalModal] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [fichaModalOpen, setFichaModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [search, setSearch] = useState("");

  const isOpen = modalOpen || internalModal;
  const queryClient = useQueryClient();

  const handleClose = () => { onCloseModal(); setInternalModal(false); };
  const closeReturnModal = () => { setReturnModalOpen(false); setSelectedAssignment(null); };

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

  const returnMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      await api.patch(`/epis/assignments/${id}/return`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["epi-assignments"] });
      closeReturnModal();
      toast.success("Baixa de EPI registrada!");
    },
  });

  const handleOpenReturn = (assignment: any) => {
    setSelectedAssignment(assignment);
    setReturnModalOpen(true);
  };

  const filtered = assignments?.filter((a: any) =>
    a.employee?.name.toLowerCase().includes(search.toLowerCase()) ||
    a.epi?.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.return_reason?.toLowerCase() || "").includes(search.toLowerCase())
  ) || [];

  const kpis = [
    { label: "EPIs Ativos", value: assignments?.filter((a: any) => a.status === 'delivered').length.toString() || "0" },
    { label: "Vencendo / Vencidos", value: assignments?.filter((a: any) => a.status === 'expired').length.toString() || "0" },
    { label: "Devolvidos", value: assignments?.filter((a: any) => a.status === 'returned').length.toString() || "0" },
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFichaModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium"
          >
            <FileText className="h-4 w-4" /> Ficha de Controle
          </button>
          <button onClick={() => setInternalModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium">
            <Plus className="h-4 w-4" /> Vincular EPI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" placeholder="Buscar por funcionário, EPI ou motivo..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">Funcionário</th>
              <th className="text-left p-3 font-medium text-muted-foreground">EPI Entregue</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Data da Entrega</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Observação / Baixa</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row: any) => (
              <tr key={row.id} className={`border-b last:border-b-0 hover:bg-muted/30 transition-colors ${row.status === 'returned' ? 'opacity-60 bg-muted/10' : ''}`}>
                <td className="p-3 font-medium text-foreground">{row.employee?.name}</td>
                <td className="p-3 text-muted-foreground">{row.epi?.name} {row.epi?.description ? <span className="text-xs text-muted-foreground/70 ml-1">({row.epi.description})</span> : ''}</td>
                <td className="p-3 text-muted-foreground">{formatDate(row.assignment_date)}</td>
                <td className="p-3 text-muted-foreground text-xs italic">
                  {row.status === 'returned'
                    ? `Devolvido em ${formatDate(row.return_date)}: ${row.return_reason}`
                    : `Validade: ${formatDate(row.expiry_date)}`}
                </td>
                <td className="p-3">
                  <StatusBadge
                    status={row.status === 'returned' ? 'Devolvido' : (row.status === 'delivered' ? 'Válido' : 'Vencido')}
                  />
                </td>
                <td className="p-3 text-right">
                  {row.status !== 'returned' && (
                    <button onClick={() => handleOpenReturn(row)} title="Dar Baixa (Devolver)" className="p-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SidePanel Vincular EPI */}
      <SidePanel open={isOpen} onOpenChange={handleClose} title="Vincular EPI">
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
        }} className="space-y-4 pb-10">
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
              {epis?.map((e: any) => <option key={e.id} value={e.id}>{e.name} {e.description ? `(${e.description})` : ''}</option>)}
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
          <div className="pt-4 border-t mt-6">
            <button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-all shadow-lg active:scale-95 font-bold text-sm">
              Vincular EPI
            </button>
          </div>
        </form>
      </SidePanel>

      {/* SidePanel Baixa/Devolução */}
      <SidePanel open={returnModalOpen} onOpenChange={setReturnModalOpen} title="Registrar Baixa de EPI">
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-dashed">
          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">EPI a ser devolvido</p>
          <p className="text-sm font-medium text-foreground">{selectedAssignment?.epi?.name} — {selectedAssignment?.employee?.name}</p>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const payload = {
            return_date: formData.get('return_date'),
            return_reason: formData.get('return_reason'),
          };
          returnMutation.mutate({ id: selectedAssignment.id, payload });
        }} className="space-y-4 pb-10">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Data de Devolução / Baixa</label>
            <input name="return_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Motivo da Baixa</label>
            <select name="return_reason" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="" disabled selected>Selecione o motivo</option>
              <option value="Devolução (Demissão)">Devolução (Demissão)</option>
              <option value="Troca por Desgaste">Troca por Desgaste</option>
              <option value="Troca por Vencimento">Troca por Vencimento</option>
              <option value="Extravio / Perda">Extravio / Perda</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          <div className="pt-4 border-t mt-6">
            <button type="submit" disabled={returnMutation.isPending} className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-all shadow-lg active:scale-95 font-bold text-sm flex items-center justify-center gap-2">
              {returnMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Baixa"}
            </button>
          </div>
        </form>
      </SidePanel>

      <FichaEPIControl open={fichaModalOpen} onOpenChange={setFichaModalOpen} />
    </div>
  );
}
