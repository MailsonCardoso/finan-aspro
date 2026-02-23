import { useState } from "react";
import { Search, Plus, Edit, Loader2, Trash2 } from "lucide-react";
import { SidePanel } from "./SidePanel";
import { ConfirmModal } from "./ConfirmModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export function Despesas() {
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
    const queryClient = useQueryClient();

    const { data: expenses, isLoading } = useQuery({
        queryKey: ["expenses"],
        queryFn: async () => {
            const response = await api.get("/expenses");
            return response.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/expenses/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            toast.success("Despesa excluída com sucesso!");
        },
        onError: () => {
            toast.error("Erro ao excluir despesa.");
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            if (editingExpense) {
                return api.put(`/expenses/${editingExpense.id}`, data);
            }
            return api.post("/expenses", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            toast.success(`Despesa ${editingExpense ? "atualizada" : "cadastrada"} com sucesso!`);
            closeModal();
        },
        onError: () => {
            toast.error("Erro ao salvar despesa.");
        },
    });

    const handleDelete = (id: number) => {
        setExpenseToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleEdit = (expense: any) => {
        setEditingExpense(expense);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingExpense(null);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            description: formData.get("description"),
        };
        saveMutation.mutate(data);
    };

    const filtered = expenses?.filter((e: any) =>
        e.name.toLowerCase().includes(search.toLowerCase())
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
                <h2 className="text-xl font-bold text-foreground">Categorias de Despesas</h2>
                <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium">
                    <Plus className="h-4 w-4" /> Nova Categoria
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Buscar por categoria..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div className="bg-card rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="text-left p-3 font-medium text-muted-foreground">Nome da Categoria</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Descrição</th>
                            <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((row: any) => (
                            <tr key={row.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                                <td className="p-3 font-medium text-foreground">{row.name}</td>
                                <td className="p-3 text-muted-foreground">{row.description || '-'}</td>
                                <td className="p-3">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(row.id)} className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors" title="Excluir">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-4 text-center text-muted-foreground">Nenhuma despesa encontrada.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <SidePanel open={modalOpen} onOpenChange={setModalOpen} title={editingExpense ? "Editar Despesa" : "Nova Despesa"}>
                <form onSubmit={handleSubmit} className="space-y-4 pb-10">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Nome da Categoria</label>
                        <input required type="text" name="name" defaultValue={editingExpense?.name} className="w-full p-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Descrição</label>
                        <textarea name="description" defaultValue={editingExpense?.description} rows={3} className="w-full p-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>

                    <div className="pt-4 border-t mt-6">
                        <button type="submit" disabled={saveMutation.isPending} className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-all shadow-lg active:scale-95 font-bold text-sm flex items-center justify-center gap-2">
                            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            Salvar Categoria
                        </button>
                    </div>
                </form>
            </SidePanel>

            <ConfirmModal
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={() => expenseToDelete && deleteMutation.mutate(expenseToDelete)}
                title="Excluir Categoria"
                description="Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita."
                confirmText="Excluir"
            />
        </div>
    );
}
