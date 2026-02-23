import { useState } from "react";
import { Search, Plus, Edit, Loader2, Trash2 } from "lucide-react";
import { SidePanel } from "./SidePanel";
import { ConfirmModal } from "./ConfirmModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { maskCPFCNPJ, maskPhone } from "@/lib/format";

export function Clientes() {
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<number | null>(null);
    const [formDocument, setFormDocument] = useState("");
    const [formPhone, setFormPhone] = useState("");
    const queryClient = useQueryClient();

    const { data: clients, isLoading } = useQuery({
        queryKey: ["clients"],
        queryFn: async () => {
            const response = await api.get("/clients");
            return response.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/clients/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            toast.success("Cliente excluído com sucesso!");
        },
        onError: () => {
            toast.error("Erro ao excluir cliente.");
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            if (editingClient) {
                return api.put(`/clients/${editingClient.id}`, data);
            }
            return api.post("/clients", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            toast.success(`Cliente ${editingClient ? "atualizado" : "cadastrado"} com sucesso!`);
            closeModal();
        },
        onError: () => {
            toast.error("Erro ao salvar cliente.");
        },
    });

    const handleDelete = (id: number) => {
        setClientToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleEdit = (client: any) => {
        setEditingClient(client);
        setFormDocument(client.document || "");
        setFormPhone(client.phone || "");
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingClient(null);
        setFormDocument("");
        setFormPhone("");
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            document: formData.get("document"),
        };
        saveMutation.mutate(data);
    };

    const filtered = clients?.filter((c: any) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.document?.toLowerCase().includes(search.toLowerCase())
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
                <h2 className="text-xl font-bold text-foreground">Clientes</h2>
                <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium">
                    <Plus className="h-4 w-4" /> Novo Cliente
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Buscar por nome ou CPF/CNPJ..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div className="bg-card rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="text-left p-3 font-medium text-muted-foreground">Nome</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">CPF/CNPJ</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Telefone</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">E-mail</th>
                            <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((row: any) => (
                            <tr key={row.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                                <td className="p-3 font-medium text-foreground">{row.name}</td>
                                <td className="p-3 text-muted-foreground">{row.document ? maskCPFCNPJ(row.document) : '-'}</td>
                                <td className="p-3 text-muted-foreground">{row.phone ? maskPhone(row.phone) : '-'}</td>
                                <td className="p-3 text-muted-foreground">{row.email || '-'}</td>
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
                                <td colSpan={5} className="p-4 text-center text-muted-foreground">Nenhum cliente encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <SidePanel open={modalOpen} onOpenChange={setModalOpen} title={editingClient ? "Editar Cliente" : "Novo Cliente"}>
                <form onSubmit={handleSubmit} className="space-y-4 pb-10">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Nome</label>
                        <input required type="text" name="name" defaultValue={editingClient?.name} className="w-full p-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">CPF ou CNPJ</label>
                        <input
                            type="text"
                            name="document"
                            value={formDocument}
                            onChange={(e) => setFormDocument(maskCPFCNPJ(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Telefone</label>
                            <input
                                type="text"
                                name="phone"
                                value={formPhone}
                                onChange={(e) => setFormPhone(maskPhone(e.target.value))}
                                className="w-full p-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">E-mail</label>
                            <input type="email" name="email" defaultValue={editingClient?.email} className="w-full p-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                    </div>

                    <div className="pt-4 border-t mt-6">
                        <button type="submit" disabled={saveMutation.isPending} className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-all shadow-lg active:scale-95 font-bold text-sm flex items-center justify-center gap-2">
                            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            Salvar Cliente
                        </button>
                    </div>
                </form>
            </SidePanel>

            <ConfirmModal
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={() => clientToDelete && deleteMutation.mutate(clientToDelete)}
                title="Excluir Cliente"
                description="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
                confirmText="Excluir"
            />
        </div>
    );
}
