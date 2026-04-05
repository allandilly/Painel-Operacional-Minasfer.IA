import { useState } from "react";
import { Plus, Search, Filter, Calendar, Clock, ArrowRight, MoreHorizontal, Store, DollarSign, Ban } from "lucide-react";
import { useApp } from "../context/AppContext";
import { NovoOrcamentoModal } from "../components/NovoOrcamentoModal";

export function Caixa() {
  const { orcamentos, aprovarOrcamento, openOrderDetails, isLoading } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const safeOrcamentos = orcamentos ?? [];

  const metrics = [
    { label: "Orçamentos Abertos", value: safeOrcamentos.filter(o => o.status === 'Orçamento Criado' || o.status === 'Aguardando Cliente').length.toString(), trend: "+2", icon: Store, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { label: "Confirmados", value: safeOrcamentos.filter(o => o.status === 'Confirmado').length.toString(), trend: "+14", icon: DollarSign, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { label: "Expirados", value: safeOrcamentos.filter(o => o.status === 'Expirado').length.toString(), trend: "-1", icon: Ban, color: "text-rose-600 bg-rose-50 border-rose-200" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Caixa e Comercial</h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Gestão de orçamentos, aprovações comerciais e entrada de pedidos no fluxo operacional.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Novo Orçamento
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-slate-200 rounded w-16"></div>
                  <div className="h-4 bg-slate-200 rounded w-8 self-end"></div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-100"></div>
            </div>
          ))
        ) : (
          metrics.map((metric, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">{metric.label}</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">{metric.value}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${metric.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {metric.trend}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${metric.color}`}>
                <metric.icon className="w-6 h-6" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
        
        {/* Toolbar (Filters & Search) */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <button className="px-4 py-2 bg-white text-slate-900 text-sm font-semibold rounded-lg border border-slate-200 shadow-sm whitespace-nowrap">Todos Ativos</button>
            <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-sm font-medium rounded-lg transition-colors whitespace-nowrap">Orçamentos</button>
            <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-sm font-medium rounded-lg transition-colors whitespace-nowrap">Confirmados</button>
            <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-sm font-medium rounded-lg transition-colors whitespace-nowrap">Expirados</button>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por PV ou Cliente" 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold w-24">PV</th>
                <th className="px-6 py-4 font-semibold">Cliente & Detalhes</th>
                <th className="px-6 py-4 font-semibold">Valor Total</th>
                <th className="px-6 py-4 font-semibold">Validade</th>
                <th className="px-6 py-4 font-semibold">Status Comercial</th>
                <th className="px-6 py-4 font-semibold text-right w-20">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array(5).fill(0).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-5"><div className="h-5 bg-slate-200 rounded w-16"></div></td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <div className="h-5 bg-slate-200 rounded w-32"></div>
                        <div className="h-4 bg-slate-100 rounded w-48"></div>
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="h-5 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-6 py-5"><div className="h-5 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-6 py-5"><div className="h-6 bg-slate-200 rounded-full w-28"></div></td>
                    <td className="px-6 py-5"><div className="h-6 bg-slate-200 rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
              ) : (
                safeOrcamentos.map((item, idx) => (
                  <tr key={idx} onClick={() => openOrderDetails(item.id)} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-5">
                      <span className="font-bold text-slate-900">{item.id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-800">{item.cliente}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{item.saida}</span>
                          {item.producao === "Sim" && <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">C/ Produção</span>}
                          <span className="text-slate-400">• Vend: {item.vendedor}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-medium text-slate-900">{item.valor}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${
                          item.criticidade === 'alta' ? 'text-rose-500' :
                          item.criticidade === 'atencao' ? 'text-amber-500' : 'text-slate-400'
                        }`} />
                        <span className={`font-medium ${
                          item.criticidade === 'alta' ? 'text-rose-600' :
                          item.criticidade === 'atencao' ? 'text-amber-600' :
                          item.criticidade === 'inativo' ? 'text-slate-400 line-through' : 'text-slate-700'
                        }`}>
                          {item.validade}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                        item.status === 'Confirmado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        item.status === 'Aguardando Cliente' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        item.status === 'Orçamento Criado' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {(item.status === 'Orçamento Criado' || item.status === 'Aguardando Cliente') ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); aprovarOrcamento(item.id); }}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                        >
                          Aprovar
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); openOrderDetails(item.id); }}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
          <span>Mostrando 5 de 45 orçamentos</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">Próxima</button>
          </div>
        </div>
      </div>
      
      <NovoOrcamentoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}