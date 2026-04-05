import { Truck, MapPin, Search, Filter, Box, Route, Calendar, ArrowRight, User, PackageCheck } from "lucide-react";
import { useApp } from "../context/AppContext";
import { MontarRoteiroModal } from "../components/MontarRoteiroModal";
import { useState } from "react";

export function Logistica() {
  const { logistica, avancarLogistica, openOrderDetails, isLoading } = useApp();
  const safeLogistica = logistica ?? [];
  const [roteiroModalOpen, setRoteiroModalOpen] = useState(false);

  const queues = [
    { label: "Aguardando Separação", count: safeLogistica.filter(l => l.status === 'Aguardando separação').length.toString(), icon: Box, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { label: "Pronto / Rota", count: safeLogistica.filter(l => l.status === 'Pronto para retirada' || l.status === 'Liberado para entrega' || l.status === 'Em rota').length.toString(), icon: Route, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { label: "Concluídos", count: safeLogistica.filter(l => l.status === 'Concluído operacionalmente').length.toString(), icon: PackageCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Expedição e Logística</h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Preparação física, planejamento de rotas, balcão de retiradas e frota.
          </p>
        </div>
        <button 
          onClick={() => setRoteiroModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
        >
          <Route className="w-5 h-5" />
          Montar Roteiro
        </button>
      </div>

      {/* Main Queues Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0"></div>
                <div className="flex flex-col gap-2">
                  <div className="h-8 bg-slate-200 rounded w-16"></div>
                  <div className="h-3 bg-slate-200 rounded w-24"></div>
                </div>
              </div>
              <div className="w-5 h-5 bg-slate-200 rounded-full"></div>
            </div>
          ))
        ) : (
          queues.map((q, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border shrink-0 ${q.color}`}>
                  <q.icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate-900 leading-none mb-1">{q.count}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{q.label}</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300" />
            </div>
          ))
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar">
            <button className="px-4 py-2 bg-white text-slate-900 text-sm font-bold rounded-lg border border-slate-200 shadow-sm whitespace-nowrap">Todos em Fila</button>
            <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-sm font-medium rounded-lg transition-colors whitespace-nowrap">Retiradas (Balcão/Galpão)</button>
            <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-sm font-medium rounded-lg transition-colors whitespace-nowrap">Entregas (Frota)</button>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar PV, Rota ou Cidade" 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-400"
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg shadow-sm transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">PV & Cliente</th>
                <th className="px-6 py-4">Contexto Logístico</th>
                <th className="px-6 py-4">Rota & Frota</th>
                <th className="px-6 py-4">Status Interno</th>
                <th className="px-6 py-4 text-right">Ação Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array(5).fill(0).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="flex flex-col gap-2"><div className="h-5 bg-slate-200 rounded w-20"></div><div className="h-4 bg-slate-100 rounded w-32"></div></div></td>
                    <td className="px-6 py-4"><div className="flex flex-col gap-2"><div className="h-5 bg-slate-200 rounded w-24"></div><div className="h-4 bg-slate-100 rounded w-20"></div></div></td>
                    <td className="px-6 py-4"><div className="flex flex-col gap-2"><div className="h-4 bg-slate-200 rounded w-24"></div><div className="h-4 bg-slate-100 rounded w-32"></div></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : (
                safeLogistica.map((item, idx) => (
                  <tr key={idx} onClick={() => openOrderDetails(item.id)} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-900">{item.id}</span>
                        <span className="text-slate-600 font-medium">{item.cliente}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span className={`w-max text-xs font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 ${
                          item.saida === 'Entrega' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <Truck className="w-3 h-3" />
                          {item.saida}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {item.cidade}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.saida === 'Entrega' ? (
                        <div className="flex flex-col gap-1.5">
                          <span className={`text-xs font-bold ${item.rota === 'Pendente' ? 'text-amber-500 flex items-center gap-1' : 'text-slate-700 flex items-center gap-1'}`}>
                            <Route className="w-3.5 h-3.5" /> 
                            {item.rota}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {item.motorista} • {item.caminhao}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 italic">
                          <User className="w-3.5 h-3.5" />
                          Retirada pelo Cliente
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold w-max ${
                          item.status === 'Aguardando separação' ? 'bg-amber-100 text-amber-800' :
                          item.status === 'Pronto para retirada' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'Liberado para entrega' ? 'bg-indigo-100 text-indigo-800' :
                          item.status === 'Em rota' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'Concluído operacionalmente' ? 'bg-slate-100 text-slate-500' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (item.status === 'Concluído operacionalmente') {
                            openOrderDetails(item.id);
                          } else {
                            avancarLogistica(item.id);
                          }
                        }}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-sm ${
                        item.status === 'Aguardando separação' || item.status === 'Em rota' || item.status === 'Pronto para retirada' || item.status === 'Liberado para entrega'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
                          'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}>
                        {item.status === 'Aguardando separação' ? 'Liberar/Avançar' :
                         item.status === 'Pronto para retirada' ? 'Concluir Retirada' :
                         item.status === 'Liberado para entrega' ? 'Sair para entrega' :
                         item.status === 'Em rota' ? 'Concluir Entrega' :
                         'Ver Recibo'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="px-6 py-4 border-t border-slate-100 text-sm text-slate-500 bg-slate-50/50 flex justify-between">
          <span>12 pedidos em fila de logística</span>
        </div>
      </div>

      <MontarRoteiroModal 
        isOpen={roteiroModalOpen}
        onClose={() => setRoteiroModalOpen(false)}
      />
    </div>
  );
}