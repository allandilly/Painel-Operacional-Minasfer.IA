import { Hammer, Search, Filter, AlertTriangle, Check, Clock } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Producao() {
  const { producao, concluirProducao, desfazerProducao, openOrderDetails, isLoading } = useApp();
  const safeProducao = producao ?? [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Produção</h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Fila mínima de operações industriais (corte, dobra) antes da expedição e logística.
          </p>
        </div>
        
        {/* Simple Summary */}
        <div className="flex items-center gap-6 bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fila Atual</span>
            <span className="text-xl font-extrabold text-slate-900">{safeProducao.filter(p => p.status !== 'Produção concluída').length} <span className="text-sm font-medium text-slate-500">pedidos</span></span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Atrasos</span>
            <span className="text-xl font-extrabold text-rose-600">{safeProducao.filter(p => p.status === 'Atrasado').length} <span className="text-sm font-medium text-rose-400">pedido{safeProducao.filter(p => p.status === 'Atrasado').length !== 1 ? 's' : ''}</span></span>
          </div>
        </div>
      </div>

      {/* Main Lean Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-sm">Recebidos ({safeProducao.filter(p => p.status !== 'Produção concluída').length})</button>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium rounded-lg transition-colors">Concluídos ({safeProducao.filter(p => p.status === 'Produção concluída').length})</button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar PV ou Cliente" 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Data List (Lean Approach as requested by PDF) */}
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            Array(4).fill(0).map((_, idx) => (
              <div key={idx} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-pulse">
                <div className="flex items-start gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0"></div>
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center gap-3">
                      <div className="h-5 bg-slate-200 rounded w-20"></div>
                      <div className="h-5 bg-slate-100 rounded w-32"></div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-48"></div>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-100 md:border-0 justify-between md:justify-end">
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <div className="h-3 bg-slate-200 rounded w-16"></div>
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                  </div>
                  <div className="h-12 bg-slate-200 rounded-xl w-[180px]"></div>
                </div>
              </div>
            ))
          ) : (
            safeProducao.map((item, idx) => (
              <div key={idx} onClick={() => openOrderDetails(item.id)} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors cursor-pointer group">
                
                <div className="flex items-start gap-4 w-full md:w-auto">
                  {/* Priority Indicator */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${
                    item.prioridade === 'Urgente' || item.status === 'Atrasado' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                    item.prioridade === 'Alta' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                    item.status === 'Produção concluída' ? 'bg-slate-50 border-slate-200 text-slate-400' :
                    'bg-white border-slate-200 text-slate-700'
                  }`}>
                    {item.status === 'Produção concluída' ? <Check className="w-6 h-6" /> : <Hammer className="w-6 h-6" />}
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 text-lg">{item.id}</span>
                      <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{item.cliente}</span>
                      {item.prioridade === 'Urgente' && <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200 uppercase tracking-wider"><AlertTriangle className="w-3 h-3"/> Urgente</span>}
                    </div>
                    <span className={`text-sm font-medium ${item.status === 'Produção concluída' ? 'text-slate-400' : 'text-slate-700'}`}>
                      Resumo Operacional: <span className="font-bold">{item.itens}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-100 md:border-0 justify-between md:justify-end">
                  <div className="flex flex-col text-left md:text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5 flex items-center md:justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      Prazo
                    </span>
                    <span className={`text-sm font-bold ${
                      item.status === 'Atrasado' ? 'text-rose-600' : 
                      item.status === 'Produção concluída' ? 'text-slate-400 line-through' : 'text-slate-900'
                    }`}>
                      {item.prazo}
                    </span>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      item.status === 'Produção concluída' ? desfazerProducao(item.id) : concluirProducao(item.id);
                    }}
                    className={`px-6 py-3 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center min-w-[180px] ${
                    item.status === 'Produção concluída' 
                      ? 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md'
                  }`}>
                    {item.status === 'Produção concluída' ? 'Desfazer' : 'Concluir Produção'}
                  </button>
                </div>
                
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}