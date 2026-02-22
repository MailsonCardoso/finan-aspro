import { useState, useEffect } from "react";
import {
  LayoutDashboard, FileText, CreditCard, TrendingUp, BarChart3,
  Users, Shield, Bell, Search, Menu, X, LogOut, ChevronRight, Loader2,
} from "lucide-react";
import { Dashboard } from "@/components/erp/Dashboard";
import { ContasReceber } from "@/components/erp/ContasReceber";
import { ContasPagar } from "@/components/erp/ContasPagar";
import { FluxoCaixa } from "@/components/erp/FluxoCaixa";
import { DRE } from "@/components/erp/DRE";
import { Funcionarios } from "@/components/erp/Funcionarios";
import { GestaoEPIs } from "@/components/erp/GestaoEPIs";
import api from "@/lib/api";
import { toast } from "sonner";

type Tab = "resumo" | "receber" | "pagar" | "fluxo" | "dre" | "funcionarios" | "epis";

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
    label: "Recursos Humanos",
    items: [
      { id: "funcionarios" as Tab, label: "Funcionários", icon: Users },
      { id: "epis" as Tab, label: "Gestão de EPIs", icon: Shield },
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
  epis: "Gestão de EPIs",
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("resumo");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [epiModalOpen, setEpiModalOpen] = useState(false);
  const [epiEmployee, setEpiEmployee] = useState<string | undefined>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("administrador@financeiro.com.br");
  const [password, setPassword] = useState("@Secur1t1@");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

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
    setActiveTab("epis");
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
      case "epis": return <GestaoEPIs modalOpen={epiModalOpen} onCloseModal={() => setEpiModalOpen(false)} preselectedEmployee={epiEmployee} />;
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
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 border rounded-lg bg-background text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger" />
            </button>
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

