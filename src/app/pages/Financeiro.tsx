import { FileText, CheckCircle, Search, Filter, AlertCircle, ArrowUpRight, DollarSign, Wallet } from "lucide-react";
import { useApp, Pedido } from "../context/AppContext";
import { FaturamentoModal } from "../components/FaturamentoModal";
import { useState } from "react";

export function Financeiro() {
  const { financeiro, pedidos, faturarPedido, conciliarPedido, openOrderDetails, isLoading } = useApp();

  const [faturamentoModalOpen, setFaturamentoModalOpen] = useState(false);
  const [selectedPedidoParaFaturar, setSelectedPedidoParaFaturar] = useState<Pedido | null>(null);

  const safeFinanceiro = financeiro ?? [];

  const cards = [
    { label: "Aguardando Faturamento", value: safeFinanceiro.filter(f => f.status === 'Aguardando Faturamento').length.toString(), desc: "Pedidos aprovados que exigem NF/Boleto", icon: FileText, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { label: "Aguardando Conciliação", value: safeFinanceiro.filter(f => f.status === 'Aguardando Conciliação').length.toString(), desc: "Concluídos operacionalmente aguardando baixa", icon: Wallet, color: "text-blue-600 bg-blue-50 border-blue-200" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Financeiro & Documental</h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Gestão de emissões fiscais, boletos e conciliação de pagamentos pós-operação.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Lote de Faturamento
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array(2).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-5 animate-pulse">
              <div className="w-14 h-14 rounded-full bg-slate-200 shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-10 bg-slate-200 rounded w-16"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
              <div className="w-5 h-5 bg-slate-200 rounded-full"></div>
            </div>
          ))
        ) : (
          cards.map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border shrink-0 ${card.color}`}>
                <card.icon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{card.label}</h3>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{card.value}</span>
                </div>
                <p className="text-sm text-slate-400 font-medium">{card.desc}</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-300" />
            </div>
          ))
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar">
            <button className="px-4 py-2 bg-white text-slate-900 text-sm font-bold rounded-lg border border-slate-200 shadow-sm whitespace-nowrap">Todas as Filas</button>
            <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-sm font-medium rounded-lg transition-colors whitespace-nowrap">Aguard. Faturamento</button>
            <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-sm font-medium rounded-lg transition-colors whitespace-nowrap">Aguard. Conciliação</button>
            <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-sm font-medium rounded-lg transition-colors whitespace-nowrap">Encerrados</button>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar PV, NF ou Cliente" 
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
                <th className="px-6 py-4 w-28">Nº PV</th>
                <th className="px-6 py-4">Cliente / Saída</th>
                <th className="px-6 py-4">Condição & Dados</th>
                <th className="px-6 py-4">Checklist Fisc.</th>
                <th className="px-6 py-4">Status Interno</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array(5).fill(0).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-16"></div></td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="h-5 bg-slate-200 rounded w-32"></div>
                        <div className="h-4 bg-slate-100 rounded w-24"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="h-4 bg-slate-200 rounded w-24"></div>
                        <div className="h-3 bg-slate-100 rounded w-16"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="flex gap-2"><div className="h-5 bg-slate-200 rounded w-16"></div><div className="h-5 bg-slate-200 rounded w-16"></div></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : (
                safeFinanceiro.map((item, idx) => (
                  <tr key={idx} onClick={() => {
                    if (item.status === 'Aguardando Faturamento') {
                      const ped = pedidos.find(p => p.id === item.id);
                      if (ped) {
                        setSelectedPedidoParaFaturar(ped);
                        setFaturamentoModalOpen(true);
                      } else {
                        openOrderDetails(item.id);
                      }
                    } else {
                      openOrderDetails(item.id);
                    }
                  }} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">{item.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-800 flex items-center gap-2">
                          {item.cliente}
                          {item.warning && <AlertCircle className="w-4 h-4 text-rose-500" title={item.warning} />}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 w-max px-2 py-0.5 rounded">
                          Saída: {item.saida}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                          {item.pagamento}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          OC: {item.oc !== "-" ? <span className="text-slate-900 bg-slate-100 px-1 rounded">{item.oc}</span> : <span className="text-slate-300">Não exigida</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded text-xs font-bold border ${item.nf !== '-' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                          {item.nf !== '-' ? item.nf : 'Sem NF'}
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-bold border ${item.boleto !== '-' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                          {item.boleto !== '-' ? item.boleto : 'Sem Boleto'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold ${
                        item.status === 'Aguardando Faturamento' ? 'bg-amber-100 text-amber-800' :
                        item.status === 'Aguardando Conciliação' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'Encerrado' ? 'bg-slate-100 text-slate-600' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status === 'Aguardando Faturamento' && (
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            const ped = pedidos.find(p => p.id === item.id);
                            if (ped) {
                              setSelectedPedidoParaFaturar(ped);
                              setFaturamentoModalOpen(true);
                            }
                          }}
                          className="px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-sm bg-slate-900 text-white hover:bg-slate-800"
                        >
                          Faturar
                        </button>
                      )}
                      {item.status === 'Aguardando Conciliação' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); conciliarPedido(item.id); }}
                          className="px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-sm bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Conciliar
                        </button>
                      )}
                      {item.status === 'Encerrado' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); openOrderDetails(item.id); }}
                          className="px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          Ver Detalhes
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="px-6 py-4 border-t border-slate-100 text-sm text-slate-500 bg-slate-50/50 flex justify-between">
          <span>5 registros encontrados</span>
        </div>
      </div>

      <FaturamentoModal 
        isOpen={faturamentoModalOpen} 
        onClose={() => {
          setFaturamentoModalOpen(false);
          setSelectedPedidoParaFaturar(null);
        }}
        pedido={selectedPedidoParaFaturar}
      />
    </div>
  );
}