import { useState } from "react";
import {
    Building2, Users, Palette, Save, Loader2, Plus,
    Trash2, Mail, Fingerprint, CheckCircle2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { maskCPF } from "@/lib/format";
import { SidePanel } from "./SidePanel";
import { ConfirmModal } from "./ConfirmModal";

const THEMES = [
    { id: "purple", name: "Imperial Purple (Padrão)", primary: "280 61% 50%", sidebar: "265 44% 15%" },
    { id: "blue", name: "Ocean Blue", primary: "210 100% 50%", sidebar: "220 45% 15%" },
    { id: "green", name: "Nature Green", primary: "142 71% 45%", sidebar: "150 40% 12%" },
    { id: "orange", name: "Sunset Orange", primary: "24 100% 50%", sidebar: "24 30% 12%" },
    { id: "slate", name: "Modern Slate", primary: "215 25% 27%", sidebar: "222 47% 11%" },
];

export function Configuracoes() {
    const [activeSubTab, setActiveSubTab] = useState<"empresa" | "usuarios" | "temas">("empresa");
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [formCpf, setFormCpf] = useState("");
    const queryClient = useQueryClient();

    // Queries
    const { data: settings, isLoading: loadingSettings } = useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            const response = await api.get("/settings");
            return response.data;
        },
    });

    const { data: users, isLoading: loadingUsers } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await api.get("/users");
            return response.data;
        },
    });

    // Mutations
    const updateSettingsMutation = useMutation({
        mutationFn: (data: any) => api.post("/settings", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            toast.success("Configurações atualizadas!");
        },
    });

    const resetSystemMutation = useMutation({
        mutationFn: () => api.post("/financial/wipe"),
        onSuccess: () => {
            queryClient.invalidateQueries();
            toast.success("Sistema resetado com sucesso!");
            setResetConfirmOpen(false);
        },
    });

    const saveUserMutation = useMutation({
        mutationFn: (data: any) => api.post("/users", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setUserModalOpen(false);
            setFormCpf("");
            toast.success("Usuário criado com sucesso! A senha padrão é o CPF.");
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Usuário removido.");
        },
    });

    const handleApplyTheme = (theme: typeof THEMES[0]) => {
        // In a real app, this would update the CSS variables on :root
        const root = document.documentElement;
        root.style.setProperty("--primary", theme.primary);
        root.style.setProperty("--sidebar", theme.sidebar);

        // Save to settings
        updateSettingsMutation.mutate({ theme_id: theme.id });
    };

    if (loadingSettings) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Tabs Header */}
            <div className="flex border-b overflow-x-auto scrollbar-none">
                <button
                    onClick={() => setActiveSubTab("empresa")}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeSubTab === "empresa"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <Building2 className="h-4 w-4" /> Dados da Empresa
                </button>
                <button
                    onClick={() => setActiveSubTab("usuarios")}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeSubTab === "usuarios"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <Users className="h-4 w-4" /> Usuários & Acessos
                </button>
                <button
                    onClick={() => setActiveSubTab("temas")}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeSubTab === "temas"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <Palette className="h-4 w-4" /> Personalização
                </button>
            </div>

            {/* Content Area */}
            <div className="mt-6">
                {activeSubTab === "empresa" && (
                    <div className="max-w-2xl bg-card border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b bg-muted/20">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" /> Informações Corporativas
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Estes dados aparecerão em relatórios e cabeçalhos.</p>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                updateSettingsMutation.mutate(Object.fromEntries(formData));
                            }}
                            className="p-6 space-y-4"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Nome Fantasia / Razão Social</label>
                                    <input
                                        name="company_name"
                                        defaultValue={settings?.company_name}
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">CNPJ</label>
                                    <input
                                        name="company_cnpj"
                                        defaultValue={settings?.company_cnpj}
                                        placeholder="00.000.000/0000-00"
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Telefone</label>
                                    <input
                                        name="company_phone"
                                        defaultValue={settings?.company_phone}
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">E-mail de Contato</label>
                                    <input
                                        name="company_email"
                                        type="email"
                                        defaultValue={settings?.company_email}
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Endereço Completo</label>
                                    <textarea
                                        name="company_address"
                                        rows={2}
                                        defaultValue={settings?.company_address}
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={updateSettingsMutation.isPending}
                                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition-all"
                                >
                                    {updateSettingsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeSubTab === "empresa" && (
                    <div className="max-w-2xl mt-6 p-6 bg-danger/5 border border-danger/20 rounded-xl">
                        <h4 className="font-bold text-danger flex items-center gap-2">
                            <Trash2 className="h-4 w-4" /> Zona de Perigo
                        </h4>
                        <p className="text-xs text-muted-foreground mt-2 mb-4">
                            Esta ação irá apagar permanentemente todos os lançamentos financeiros, clientes, funcionários e gastos.
                            Os usuários administradores e as configurações de tema serão mantidos.
                        </p>
                        <button
                            onClick={() => setResetConfirmOpen(true)}
                            className="text-xs font-bold text-danger hover:bg-danger/10 px-4 py-2 border border-danger/30 rounded-lg transition-all"
                        >
                            Resetar Todos os Dados Operacionais
                        </button>
                    </div>
                )}

                {activeSubTab === "usuarios" && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-foreground">Gestão de Administradores</h3>
                                <p className="text-xs text-muted-foreground">Usuários com acesso total ao sistema.</p>
                            </div>
                            <button
                                onClick={() => setUserModalOpen(true)}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:shadow-lg transition-all"
                            >
                                <Plus className="h-4 w-4" /> Novo Usuário
                            </button>
                        </div>

                        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/50 border-b">
                                        <th className="text-left p-4 font-semibold text-muted-foreground">Nome</th>
                                        <th className="text-left p-4 font-semibold text-muted-foreground">E-mail / Login</th>
                                        <th className="text-left p-4 font-semibold text-muted-foreground">CPF</th>
                                        <th className="text-right p-4 font-semibold text-muted-foreground">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {users?.map((u: any) => (
                                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-4 font-medium">{u.name}</td>
                                            <td className="p-4 text-muted-foreground">{u.email}</td>
                                            <td className="p-4 text-muted-foreground">{u.cpf ? maskCPF(u.cpf) : '---'}</td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setUserToDelete(u.id);
                                                        setDeleteConfirmOpen(true);
                                                    }}
                                                    className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeSubTab === "temas" && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-foreground text-lg">Paleta de Cores</h3>
                            <p className="text-sm text-muted-foreground">Escolha a combinação que melhor se adapta à sua marca.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {THEMES.map((theme) => (
                                <div
                                    key={theme.id}
                                    className={`relative group cursor-pointer border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl ${settings?.theme_id === theme.id ? 'ring-2 ring-primary border-primary shadow-lg scale-[1.02]' : 'hover:border-primary/50'
                                        }`}
                                    onClick={() => handleApplyTheme(theme)}
                                >
                                    {/* Theme Preview Card */}
                                    <div className="h-32 flex">
                                        <div style={{ backgroundColor: `hsl(${theme.sidebar})` }} className="w-1/4 h-full" />
                                        <div className="w-3/4 h-full bg-white p-3 space-y-2">
                                            <div style={{ backgroundColor: `hsl(${theme.primary})` }} className="h-3 w-3/4 rounded-full" />
                                            <div className="h-2 w-1/2 bg-muted rounded-full" />
                                            <div className="h-2 w-full bg-muted rounded-full" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-card flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-sm text-foreground">{theme.name}</p>
                                            <div className="flex gap-1 mt-1">
                                                <div style={{ backgroundColor: `hsl(${theme.primary})` }} className="h-3 w-3 rounded-full" />
                                                <div style={{ backgroundColor: `hsl(${theme.sidebar})` }} className="h-3 w-3 rounded-full" />
                                            </div>
                                        </div>
                                        {settings?.theme_id === theme.id && (
                                            <CheckCircle2 className="h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <SidePanel
                open={userModalOpen}
                onOpenChange={setUserModalOpen}
                title="Novo Administrador"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        saveUserMutation.mutate(Object.fromEntries(formData));
                    }}
                    className="space-y-4 pb-10"
                >
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                        <Fingerprint className="h-5 w-5 text-blue-600 shrink-0" />
                        <p className="text-xs text-blue-700 leading-relaxed">
                            <strong>Segurança:</strong> Por padrão, a senha de acesso inicial do usuário será o CPF informado (somente números).
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Nome Completo</label>
                        <input name="name" required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">E-mail (Login)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input name="email" type="email" required className="w-full border rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">CPF</label>
                        <input
                            name="cpf"
                            required
                            placeholder="000.000.000-00"
                            value={formCpf}
                            onChange={(e) => setFormCpf(maskCPF(e.target.value))}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>

                    <div className="pt-4 border-t mt-6">
                        <button
                            type="submit"
                            disabled={saveUserMutation.isPending}
                            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
                        >
                            {saveUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Criar Usuário
                        </button>
                    </div>
                </form>
            </SidePanel>

            <ConfirmModal
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                title="Remover Acesso"
                description="Este usuário perderá acesso imediato ao sistema. Deseja continuar?"
                onConfirm={() => userToDelete && deleteUserMutation.mutate(userToDelete)}
                confirmText="Remover Usuário"
            />

            <ConfirmModal
                open={resetConfirmOpen}
                onOpenChange={setResetConfirmOpen}
                title="RESETER TODO O SISTEMA?"
                description="ESTA AÇÃO É IRREVERSÍVEL. Todos os dados financeiros e operacionais serão apagados. Deseja continuar?"
                onConfirm={() => resetSystemMutation.mutate()}
                confirmText="Sim, LIMPAR TUDO"
            />
        </div>
    );
}
