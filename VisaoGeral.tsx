import { ArrowRight, AlertTriangle, Clock, Activity, CheckCircle2, TrendingUp, Store } from "lucide-react";
import { useApp } from "../context/AppContext";

export function VisaoGeral() {
  const { orcamentos, financeiro, producao, logistica, alertas, openOrderDetails, isLoading } = useApp();

  const safeOrcamentos = orcamentos ?? [];
  const safeFinanceiro = financeiro ?? [];
  const safeProducao = producao ?? [];
  const safeLogistica = logistica ?? [];

  const cards = [
    {
      title: "Caixa & Comercial",
      value: safeOrcamentos.filter(o => o.status === 'Aguardando Cliente' || o.status === 'Orçamento Criado').length.toString(),
      label: "Aguardando Aprovação",
      color: "border-blue-200 bg-blue-50 text-blue-700",
      stats: [
        { name: "Confirmados", val: safeOrcamentos.filter(o => o.status === 'Confirmado').length.toString() },
        { name: "Expirados", val: safeOrcamentos.filter(o => o.status === 'Expirado').length.toString() },
      ]
    },
    {
      title: "Financeiro",
      value: safeFinanceiro.filter(f => f.status === 'Aguardando Faturamento').length.toString(),
      label: "Aguardando Faturamento",
      color: "border-emerald-200 bg-emerald-50 text-emerald-700",
      stats: [
        { name: "Aguard. Conciliação", val: safeFinanceiro.filter(f => f.status === 'Aguardando Conciliação').length.toString() },
        { name: "Encerrados", val: safeFinanceiro.filter(f => f.status === 'Encerrado').length.toString() },
      ]
    },
    {
      title: "Produção",
      value: safeProducao.filter(p => p.status !== 'Produção concluída').length.toString(),
      label: "Na Fila Mínima",
      color: "border-amber-200 bg-amber-50 text-amber-700",
      stats: [
        { name: "Produção Concluída", val: safeProducao.filter(p => p.status === 'Produção concluída').length.toString() },
        { name: "Atrasos", val: safeProducao.filter(p => p.status === 'Atrasado').length.toString() },
      ]
    },
    {
      title: "Expedição & Logística",
      value: safeLogistica.filter(l => l.status === 'Aguardando separação').length.toString(),
      label: "Aguardando Separação",
      color: "border-indigo-200 bg-indigo-50 text-indigo-700",
      stats: [
        { name: "Em Rota", val: safeLogistica.filter(l => l.status === 'Em rota').length.toString() },
        { name: "Pronto p/ Retirada", val: safeLogistica.filter(l => l.status === 'Pronto para retirada').length.toString() },
      ]
    }
  ];

  const safeAlertas = alertas ?? [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Visão Geral Operacional</h1>
          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Acompanhe o fluxo consolidado da operação Minasfer. Clique nos setores ou veja as prioridades abaixo para intervir nos gargalos em tempo real.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Activity className="w-4 h-4" />
            Relatório do Dia
          </button>
        </div>
      </div>

      {/* Cards de Indicadores (4 homes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse flex flex-col h-48">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="flex items-baseline gap-3 mb-6">
                <div className="h-10 bg-slate-200 rounded w-16"></div>
                <div className="h-4 bg-slate-200 rounded w-24"></div>
              </div>
              <div className="pt-4 border-t border-slate-100 space-y-3 mt-auto">
                <div className="flex justify-between"><div className="h-3 bg-slate-200 rounded w-20"></div><div className="h-3 bg-slate-200 rounded w-8"></div></div>
                <div className="flex justify-between"><div className="h-3 bg-slate-200 rounded w-24"></div><div className="h-3 bg-slate-200 rounded w-8"></div></div>
              </div>
            </div>
          ))
        ) : (
          cards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 ${card.color.split(' ')[1]}`}></div>
              
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between">
                {card.title}
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </h3>
              
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-5xl font-extrabold text-slate-900 tracking-tighter">{card.value}</span>
                <span className="text-sm font-medium text-slate-500 max-w-[100px] leading-tight">{card.label}</span>
              </div>
              
              <div className="pt-4 border-t border-slate-100 space-y-3">
                {card.stats.map((stat, sIdx) => (
                  <div key={sIdx} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{stat.name}</span>
                    <span className="font-semibold text-slate-700">{stat.val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Prioridades e Pendências */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alertas Operacionais */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Prioridades & Gargalos
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Ver todas</button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-5 py-4 w-28">Nº Pedido</th>
                  <th className="px-5 py-4">Contexto e Cliente</th>
                  <th className="px-5 py-4">Setor</th>
                  <th className="px-5 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array(3).fill(0).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-32 mb-1"></div><div className="h-3 bg-slate-100 rounded w-24"></div></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                      <td className="px-5 py-4 text-right flex flex-col items-end gap-1"><div className="h-5 bg-slate-200 rounded-full w-20"></div><div className="h-3 bg-slate-100 rounded w-16"></div></td>
                    </tr>
                  ))
                ) : (
                  safeAlertas.map((alerta) => (
                    <tr key={alerta.id} onClick={() => openOrderDetails(alerta.id)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                      <td className="px-5 py-4 font-semibold text-slate-700 whitespace-nowrap">{alerta.id}</td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900 mb-0.5">{alerta.motivo}</div>
                        <div className="text-slate-500 text-xs">{alerta.cliente}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">{alerta.setor}</td>
                      <td className="px-5 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                          alerta.status === 'Crítico' ? 'bg-rose-100 text-rose-700' :
                          alerta.status === 'Travado' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {alerta.status}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 font-medium">{alerta.tempo}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status do Dia (Mini Feed) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500" />
            Fluxo Contínuo
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-[calc(100%-2.5rem)]">
            <div className="relative border-l-2 border-slate-100 pl-4 space-y-8 py-2">
              <div className="relative">
                <span className="absolute -left-[25px] flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 ring-4 ring-white">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-slate-900">12 Pedidos Liberados</span>
                  <span className="text-xs text-slate-500">Logística conferiu e iniciou rota de entrega.</span>
                  <span className="text-xs text-slate-400 font-medium mt-1">Há 10 min</span>
                </div>
              </div>
              
              <div className="relative">
                <span className="absolute -left-[25px] flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 ring-4 ring-white">
                  <TrendingUp className="h-3 w-3 text-blue-600" />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-slate-900">Lote Faturado</span>
                  <span className="text-xs text-slate-500">22 Notas Fiscais emitidas automaticamente.</span>
                  <span className="text-xs text-slate-400 font-medium mt-1">Há 45 min</span>
                </div>
              </div>

              <div className="relative">
                <span className="absolute -left-[25px] flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 ring-4 ring-white">
                  <Store className="h-3 w-3 text-slate-500" />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-slate-900">Abertura de Caixa</span>
                  <span className="text-xs text-slate-500">Início do dia operacional com 5 orçamentos herdados.</span>
                  <span className="text-xs text-slate-400 font-medium mt-1">08:00</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-2 text-sm text-slate-600 hover:bg-slate-50 font-medium rounded-lg transition-colors border border-slate-200">
              Ver Histórico Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}