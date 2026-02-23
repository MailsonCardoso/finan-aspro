import { useState } from "react";
import { Search, Plus, Edit, Trash2, Loader2, Package } from "lucide-react";
import { Modal } from "./Modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export function Epis() {
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEpi, setEditingEpi] = useState<any>(null);
    const queryClient = useQueryClient();

    const { data: epis, isLoading } = useQuery({
        queryKey: ["epis"],
        queryFn: async () => {
            const response = await api.get("/epis");
            return response.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/epis/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["epis"] });
            toast.success("EPI excluído com sucesso!");
        },
        onError: () => {
            toast.error("Erro ao excluir EPI. Pode haver vínculos ativos.");
        },
    });

    const handleDelete = (id: number) => {
        if (confirm("Tem certeza que deseja excluir este tipo de EPI?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleEdit = (epi: any) => {
        setEditingEpi(epi);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingEpi(null);
    };

    const filtered = epis?.filter((e: any) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.description?.toLowerCase() || "").includes(search.toLowerCase())
    ) || [];

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
                <h2 className="text-xl font-bold text-foreground">Cadastro de EPI's</h2>
                <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium">
                    <Plus className="h-4 w-4" /> Novo EPI
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Buscar por nome ou descrição..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div className="bg-card rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="text-left p-3 font-medium text-muted-foreground">EPI</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Descrição / CA</th>
                            <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((epi: any) => (
                            <tr key={epi.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                                <td className="p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                                            <Package className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium text-foreground">{epi.name}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-muted-foreground">{epi.description || "-"}</td>
                                <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEdit(epi)} title="Editar" className="p-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-muted transition-colors">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(epi.id)} title="Excluir" className="p-1.5 bg-danger/10 text-danger rounded-md hover:bg-danger/20 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal open={modalOpen} onClose={closeModal} title={editingEpi ? "Editar EPI" : "Novo EPI"}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const payload = {
                        name: formData.get('name'),
                        description: formData.get('description'),
                    };

                    const request = editingEpi
                        ? api.put(`/epis/${editingEpi.id}`, payload)
                        : api.post('/epis', payload);

                    request.then(() => {
                        queryClient.invalidateQueries({ queryKey: ["epis"] });
                        closeModal();
                        toast.success(editingEpi ? "EPI atualizado!" : "EPI cadastrado!");
                    });
                }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Nome do EPI</label>
                        <input name="name" defaultValue={editingEpi?.name} required placeholder="Ex: Capacete de Segurança" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Descrição / CA</label>
                        <textarea name="description" defaultValue={editingEpi?.description} rows={3} placeholder="Ex: CA 12345 - Modelo Master" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm">
                        {editingEpi ? "Salvar Alterações" : "Cadastrar EPI"}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
