import { useState, useEffect } from "react";
import {
  LayoutDashboard, FileText, CreditCard, TrendingUp, BarChart3,
  Users, Shield, Bell, Menu, X, LogOut, ChevronRight, Loader2, Settings
} from "lucide-react";
import { toast } from "sonner";
import { Dashboard } from "@/components/erp/Dashboard";
import { ContasReceber } from "@/components/erp/ContasReceber";
import { ContasPagar } from "@/components/erp/ContasPagar";
import { FluxoCaixa } from "@/components/erp/FluxoCaixa";
import { DRE } from "@/components/erp/DRE";
import { Funcionarios } from "@/components/erp/Funcionarios";
import { GestaoEPIs } from "@/components/erp/GestaoEPIs";
import { Epis } from "@/components/erp/Epis";
import { Clientes } from "@/components/erp/Clientes";
import { Despesas } from "@/components/erp/Despesas";
import { Configuracoes } from "@/components/erp/Configuracoes";
import api from "@/lib/api";

type Tab = "resumo" | "receber" | "pagar" | "fluxo" | "dre" | "funcionarios" | "epis" | "gestao-epis" | "clientes" | "despesas" | "configuracoes";

const navGroups = [
  {
    label: "Financeiro",
    items: [
      { id: "resumo" as Tab, label: "Resumo", icon: LayoutDashboard },
      { id: "receber" as Tab, label: "Contas a Receber", icon: FileText },
      { id: "pagar" as Tab, label: "Contas a Pagar", icon: CreditCard },
      { id: "fluxo" as Tab, label: "Fluxo de Caixa", icon: TrendingUp },
      { id: "dre" as Tab, label: "DRE", icon: BarChart3 },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { id: "clientes" as Tab, label: "Clientes", icon: Users },
      { id: "despesas" as Tab, label: "Despesas", icon: FileText },
    ],
  },
  {
    label: "Recursos Humanos",
    items: [
      { id: "funcionarios" as Tab, label: "Funcionários", icon: Users },
      { id: "epis" as Tab, label: "EPI's", icon: Shield },
      { id: "gestao-epis" as Tab, label: "Gestão de EPIs", icon: Shield },
    ],
  },
  {
    label: "Sistema",
    items: [
      { id: "configuracoes" as Tab, label: "Configurações", icon: Settings },
    ],
  },
];

const tabTitles: Record<Tab, string> = {
  resumo: "Resumo",
  receber: "Contas a Receber",
  pagar: "Contas a Pagar",
  fluxo: "Fluxo de Caixa",
  dre: "DRE",
  funcionarios: "Funcionários",
  epis: "EPI's",
  "gestao-epis": "Gestão de EPIs",
  clientes: "Clientes",
  despesas: "Categorias de Despesas",
  configuracoes: "Configurações do Sistema",
};

interface NotificationEntry {
  id: number;
  description: string;
  due_date: string;
  type: 'income' | 'expense';
  value: number;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("resumo");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [epiModalOpen, setEpiModalOpen] = useState(false);
  const [epiEmployee, setEpiEmployee] = useState<string | undefined>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [seenIds, setSeenIds] = useState<number[]>(() => {
    const saved = localStorage.getItem("seen_notificacoes");
    return saved ? JSON.parse(saved) : [];
  });
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    // Load theme from settings if authenticated
    if (token) {
      api.get("/settings").then(response => {
        const settings = response.data;
        if (settings && settings.theme_id) {
          const THEMES = [
            { id: "purple", name: "Imperial Purple (Padrão)", primary: "280 61% 50%", sidebar: "265 44% 15%" },
            { id: "blue", name: "Ocean Blue", primary: "210 100% 50%", sidebar: "220 45% 15%" },
            { id: "green", name: "Nature Green", primary: "142 71% 45%", sidebar: "150 40% 12%" },
            { id: "orange", name: "Sunset Orange", primary: "24 100% 50%", sidebar: "24 30% 12%" },
            { id: "slate", name: "Modern Slate", primary: "215 25% 27%", sidebar: "222 47% 11%" },
          ];
          const theme = THEMES.find(t => t.id === settings.theme_id);
          if (theme) {
            document.documentElement.style.setProperty("--primary", theme.primary);
            document.documentElement.style.setProperty("--sidebar", theme.sidebar);
          }
        }
      }).catch(() => {
        // Fallback or ignore if settings fail
      });

      // Fetch notifications
      api.get("/financial/entries?status=pending").then(response => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(today.getDate() + 2);
        twoDaysFromNow.setHours(23, 59, 59, 999);

        const urgent = response.data.filter((entry: any) => {
          const dueDate = new Date(entry.due_date.substring(0, 10) + 'T00:00:00');
          // Important: check if late OR due within next 2 days
          return dueDate <= twoDaysFromNow;
        });
        setNotifications(urgent);
      });
    }
  }, []);

  const unseenNotifications = notifications.filter(n => !seenIds.includes(n.id));

  const handleToggleNotif = (open: boolean) => {
    setNotifOpen(open);
    if (open && unseenNotifications.length > 0) {
      // Mark current unseen as seen
      const newSeenIds = [...seenIds, ...unseenNotifications.map(n => n.id)];
      // Keep only last 100 to avoid localStorage bloat
      const limitedSeenIds = newSeenIds.slice(-100);
      setSeenIds(limitedSeenIds);
      localStorage.setItem("seen_notificacoes", JSON.stringify(limitedSeenIds));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post("/login", { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setIsAuthenticated(true);
      toast.success("Bem-vindo ao FinançasPro!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao realizar login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    toast.info("Sessão encerrada");
  };

  const handleOpenEPI = (employeeName?: string) => {
    setEpiEmployee(employeeName);
    setEpiModalOpen(true);
    setActiveTab("gestao-epis");
  };

  const handleNav = (tab: Tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  if (isAuthenticated === null) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden border border-sidebar-muted animate-fade-in">
          <div className="p-8 border-b border-sidebar-muted bg-sidebar/50">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground">FinançasPro</h1>
                <p className="text-xs text-sidebar-foreground/60 uppercase tracking-tighter">Acesse sua conta</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                placeholder="exemplo@empresa.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Entrar no Sistema"}
            </button>
            <p className="text-center text-[11px] text-muted-foreground mt-4">
              Protegido por criptografia SG-AES-256
            </p>
          </form>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeTab) {
      case "resumo": return <Dashboard />;
      case "receber": return <ContasReceber />;
      case "pagar": return <ContasPagar />;
      case "fluxo": return <FluxoCaixa />;
      case "dre": return <DRE />;
      case "funcionarios": return <Funcionarios onOpenEPI={handleOpenEPI} />;
      case "epis": return <Epis />;
      case "gestao-epis": return <GestaoEPIs modalOpen={epiModalOpen} onCloseModal={() => setEpiModalOpen(false)} preselectedEmployee={epiEmployee} />;
      case "clientes": return <Clientes />;
      case "despesas": return <Despesas />;
      case "configuracoes": return <Configuracoes />;
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-muted">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold text-primary-foreground">FinançasPro</h1>
              <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">ERP Corporativo</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto scrollbar-thin">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">{group.label}</p>
              <ul className="space-y-0.5">
                {group.items.map(item => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === item.id
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-muted hover:text-primary-foreground"
                        }`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                      {activeTab === item.id && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-sidebar-muted">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              {user.name?.[0]}{user.name?.split(' ')?.[1]?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary-foreground truncate">{user.name || 'Administrador'}</p>
              <p className="text-[11px] text-sidebar-foreground/60">Sessão Ativa</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-md hover:bg-sidebar-muted transition-colors">
              <LogOut className="h-4 w-4 text-sidebar-foreground/60" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-sidebar h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-primary-foreground">FinançasPro</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md text-sidebar-foreground">
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-14 z-30 bg-sidebar border-t border-sidebar-muted shadow-xl max-h-[70vh] overflow-y-auto">
          <nav className="p-3 space-y-4">
            {navGroups.map(group => (
              <div key={group.label}>
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">{group.label}</p>
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === item.id
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-muted"
                      }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-card border-b h-14 lg:h-16 flex items-center justify-between px-4 lg:px-8 mt-14 lg:mt-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-foreground hidden sm:block">{tabTitles[activeTab]}</h2>

          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => handleToggleNotif(!notifOpen)}
                className={`relative p-2 rounded-lg transition-colors ${notifOpen ? 'bg-muted' : 'hover:bg-muted'}`}
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unseenNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-danger text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                    {unseenNotifications.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-card border rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                      <h3 className="font-bold text-sm">Alertas de Vencimento</h3>
                      <span className="text-[10px] bg-danger/10 text-danger px-1.5 py-0.5 rounded-full font-bold">Urgente</span>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto p-2 space-y-1">
                      {/* Show current unseen in the current open session */}
                      {unseenNotifications.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground text-xs italic">
                          Tudo em dia! Sem novos alertas.
                        </div>
                      ) : (
                        unseenNotifications.map(n => {
                          const isLate = new Date(n.due_date.substring(0, 10)) < new Date(new Date().toISOString().substring(0, 10));
                          return (
                            <div key={n.id} className="p-3 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border">
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-xs font-bold text-foreground truncate">{n.description}</p>
                                <span className={`text-[10px] whitespace-nowrap font-bold ${n.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                  {n.type === 'income' ? '+' : '-'} {n.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <p className={`text-[10px] ${isLate ? 'text-danger font-bold' : 'text-muted-foreground'}`}>
                                  Vence em: {new Date(n.due_date).toLocaleDateString('pt-BR')}
                                </p>
                                {isLate && <span className="text-[9px] uppercase font-black text-danger">Atrasado</span>}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {unseenNotifications.length > 0 && (
                      <div className="p-3 border-t bg-muted/10">
                        <button
                          onClick={() => {
                            setActiveTab(unseenNotifications[0].type === 'income' ? 'receber' : 'pagar');
                            setNotifOpen(false);
                          }}
                          className="w-full py-2 text-[11px] font-bold text-primary hover:underline"
                        >
                          Ver todas as pendências
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary">
                {user.name?.[0] || "A"}
              </div>
              <span className="text-sm font-medium text-foreground">{user.name?.split(' ')?.[0] || 'User'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default Index;

