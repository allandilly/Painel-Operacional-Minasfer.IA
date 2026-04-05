import { Outlet, NavLink, useLocation } from "react-router";
import { LayoutDashboard, Store, DollarSign, Hammer, Truck, UserCircle, Bell, Settings } from "lucide-react";

export function Layout() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Visão Geral", icon: LayoutDashboard },
    { path: "/caixa", label: "Caixa", icon: Store },
    { path: "/financeiro", label: "Financeiro", icon: DollarSign },
    { path: "/producao", label: "Produção", icon: Hammer },
    { path: "/logistica", label: "Logística", icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header Premium */}
      <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo area */}
            <div className="flex flex-col items-start justify-center">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase leading-tight">Minasfer.IA</span>
              <span className="text-lg font-bold text-slate-900 leading-tight tracking-tight">Painel de Operações</span>
            </div>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* User & Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-3 cursor-pointer p-1 pr-2 rounded-full hover:bg-slate-50 transition-colors">
              <UserCircle className="w-8 h-8 text-slate-400" />
              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-sm font-semibold text-slate-700 leading-none mb-1">Admin Master</span>
                <span className="text-xs text-slate-500 leading-none">Supervisão</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1440px] mx-auto p-6 md:p-8 animate-in fade-in duration-300">
        <Outlet />
      </main>
    </div>
  );
}