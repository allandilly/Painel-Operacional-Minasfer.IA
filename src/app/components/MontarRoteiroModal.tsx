import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useApp, Pedido } from '../context/AppContext';
import { Route, MapPin, Truck, Calendar, Save, Plus, CheckCircle2, Box, Info, User } from 'lucide-react';
import { toast } from 'sonner';

interface MontarRoteiroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRACAS = ['Mariana', 'Santa Bárbara', 'Cachoeira do Campo', 'Ouro Branco'];

export function MontarRoteiroModal({ isOpen, onClose }: MontarRoteiroModalProps) {
  const { pedidos, atualizarPedido } = useApp();
  
  // Eligible orders for routing
  const eligiblePedidos = pedidos.filter(p => 
    p.etapa_atual === 'Logística' && 
    ['Entrega', 'Transportadora'].includes(p.modalidade) &&
    (p.status_atual === 'Aguardando separação' || p.status_atual === 'Pronto para retirada')
  );

  const [unassignedPedidos, setUnassignedPedidos] = useState<Pedido[]>([]);
  const [routedPedidos, setRoutedPedidos] = useState<Record<string, Pedido[]>>({
    'Mariana': [],
    'Santa Bárbara': [],
    'Cachoeira do Campo': [],
    'Ouro Branco': []
  });

  const [trucks, setTrucks] = useState<Record<string, string>>({
    'Mariana': '',
    'Santa Bárbara': '',
    'Cachoeira do Campo': '',
    'Ouro Branco': ''
  });

  const [drivers, setDrivers] = useState<Record<string, string>>({
    'Mariana': '',
    'Santa Bárbara': '',
    'Cachoeira do Campo': '',
    'Ouro Branco': ''
  });

  const [dates, setDates] = useState<Record<string, string>>({
    'Mariana': '',
    'Santa Bárbara': '',
    'Cachoeira do Campo': '',
    'Ouro Branco': ''
  });

  useEffect(() => {
    if (isOpen) {
      setUnassignedPedidos(eligiblePedidos);
      setRoutedPedidos({
        'Mariana': [],
        'Santa Bárbara': [],
        'Cachoeira do Campo': [],
        'Ouro Branco': []
      });
      setTrucks({
        'Mariana': '',
        'Santa Bárbara': '',
        'Cachoeira do Campo': '',
        'Ouro Branco': ''
      });
      setDrivers({
        'Mariana': '',
        'Santa Bárbara': '',
        'Cachoeira do Campo': '',
        'Ouro Branco': ''
      });
      setDates({
        'Mariana': '',
        'Santa Bárbara': '',
        'Cachoeira do Campo': '',
        'Ouro Branco': ''
      });
    }
  }, [isOpen, pedidos]);

  const matchPraca = (cidade: string, rota: string, praca: string) => {
    const text = `${cidade} ${rota}`.toLowerCase();
    const p = praca.toLowerCase();
    if (p === 'cachoeira do campo' && text.includes('cachoeira')) return true;
    if (p === 'santa bárbara' && (text.includes('santa') || text.includes('barbara') || text.includes('bárbara'))) return true;
    if (text.includes(p)) return true;
    return false;
  };

  const handleAddAll = (praca: string) => {
    const matching = unassignedPedidos.filter(p => matchPraca(p.cidade, p.rota_logistica, praca));
    if (matching.length === 0) {
      toast.info(`Nenhum pedido encontrado na lista para ${praca}`);
      return;
    }
    
    setRoutedPedidos(prev => ({
      ...prev,
      [praca]: [...prev[praca], ...matching]
    }));
    
    setUnassignedPedidos(prev => prev.filter(p => !matchPraca(p.cidade, p.rota_logistica, praca)));
    toast.success(`${matching.length} pedido(s) adicionados à praça ${praca}`);
  };

  const handleAddManual = (pedidoId: string, praca: string) => {
    const pedido = unassignedPedidos.find(p => p.id === pedidoId);
    if (!pedido) return;

    setRoutedPedidos(prev => ({
      ...prev,
      [praca]: [...prev[praca], pedido]
    }));
    setUnassignedPedidos(prev => prev.filter(p => p.id !== pedidoId));
  };

  const handleRemove = (pedidoId: string, praca: string) => {
    const pedido = routedPedidos[praca].find(p => p.id === pedidoId);
    if (!pedido) return;

    setUnassignedPedidos(prev => [pedido, ...prev]);
    setRoutedPedidos(prev => ({
      ...prev,
      [praca]: prev[praca].filter(p => p.id !== pedidoId)
    }));
  };

  const handleSaveRoute = (praca: string) => {
    const peds = routedPedidos[praca];
    if (peds.length === 0) {
      toast.error(`A carga de ${praca} está vazia.`);
      return;
    }
    if (!trucks[praca]) {
      toast.error(`Selecione o caminhão para a carga de ${praca}.`);
      return;
    }
    if (!drivers[praca]) {
      toast.error(`Selecione o motorista para a carga de ${praca}.`);
      return;
    }
    if (!dates[praca]) {
      toast.error(`Defina a data de entrega para a carga de ${praca}.`);
      return;
    }

    peds.forEach(p => {
      atualizarPedido(p.id, {
        caminhao: trucks[praca],
        rota_logistica: praca,
        status_atual: 'Liberado para entrega',
        motorista: drivers[praca]
      });
    });

    toast.success(`Carga para ${praca} roteirizada com sucesso. A documentação deve ser entregue ao motorista ${drivers[praca]} (${trucks[praca]}).`);
    
    // Clear the completed route
    setRoutedPedidos(prev => ({ ...prev, [praca]: [] }));
    setTrucks(prev => ({ ...prev, [praca]: '' }));
    setDrivers(prev => ({ ...prev, [praca]: '' }));
    setDates(prev => ({ ...prev, [praca]: '' }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[95vw] sm:h-[90vh] p-0 overflow-hidden bg-slate-50 border-slate-200 shadow-2xl rounded-2xl flex flex-col">
        
        {/* Header Premium */}
        <DialogHeader className="p-6 border-b border-slate-200 bg-white shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 z-0"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Route className="w-6 h-6 text-indigo-300" />
                Painel de Roteirização de Cargas
              </DialogTitle>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 flex items-center gap-4">
              <div className="text-white text-sm font-medium">
                <span className="text-indigo-200 block text-xs">Aptos para entrega</span>
                <span className="text-xl font-bold">{unassignedPedidos.length} pedidos</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          
          {/* Top Section: Unassigned Orders */}
          <div className="h-[45%] shrink-0 border-b border-slate-200 bg-slate-50 flex flex-col pt-2">
            <div className="flex-1 overflow-auto custom-scrollbar p-2">
              {unassignedPedidos.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <p className="text-sm font-medium">Nenhum pedido pendente de roteirização no momento.</p>
                </div>
              ) : (
                <div className="px-4 pb-4 pt-2 h-full">
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
                    {/* Header da Tabela */}
                    <div className="hidden md:flex items-center px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 gap-4">
                      <div className="w-16">PV</div>
                      <div className="w-[28%]">Cliente</div>
                      <div className="flex-1 min-w-[200px]">Cidade / Rota Ref.</div>
                      <div className="w-40 flex justify-center">Status</div>
                      <div className="w-48 text-right">Direcionar para Praça</div>
                    </div>
                    {/* Lista Rolável */}
                    <div className="flex-1 overflow-auto custom-scrollbar divide-y divide-slate-100">
                      {unassignedPedidos.map(pedido => (
                        <div key={pedido.id} className="flex flex-col md:flex-row md:items-center px-4 py-3 hover:bg-indigo-50/30 transition-colors group gap-3 md:gap-4">
                          
                          <div className="flex justify-between md:w-16 md:block">
                            <span className="font-bold text-slate-900 text-sm">{pedido.id}</span>
                            <span className="md:hidden text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-max">
                              <Box className="w-3 h-3" />
                              {pedido.status_atual}
                            </span>
                          </div>

                          <div className="w-full md:w-[28%] text-sm font-bold text-slate-700 truncate">{pedido.cliente}</div>
                          
                          <div className="flex-1 min-w-[200px] text-xs text-slate-500 font-medium flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5" />
                            {pedido.cidade} {pedido.rota_logistica && pedido.rota_logistica !== '-' ? `- ${pedido.rota_logistica}` : ''}
                          </div>
                          
                          <div className="hidden md:flex w-40 justify-center">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 whitespace-nowrap">
                              <Box className="w-3 h-3" />
                              {pedido.status_atual}
                            </span>
                          </div>

                          <div className="md:w-48 flex justify-end mt-2 md:mt-0">
                            <select 
                              className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              onChange={(e) => {
                                if (e.target.value) handleAddManual(pedido.id, e.target.value);
                              }}
                              value=""
                            >
                              <option value="" disabled>Enviar para praça...</option>
                              {PRACAS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Plazas (Praças) */}
          <div className="flex-1 bg-slate-100/50 p-4 lg:p-6 overflow-x-auto">
            <div className="flex gap-4 lg:gap-6 min-w-max h-full">
              {PRACAS.map(praca => (
                <div key={praca} className="w-[320px] lg:w-[350px] bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
                  
                  {/* Column Header */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-3">
                      <Route className="w-4 h-4 text-indigo-500" />
                      {praca}
                      <span className="ml-auto text-xs font-bold bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded-full shadow-sm">
                        {routedPedidos[praca].length} ped.
                      </span>
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="relative">
                        <Truck className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select 
                          value={trucks[praca]}
                          onChange={e => setTrucks(prev => ({...prev, [praca]: e.target.value}))}
                          className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                        >
                          <option value="">Selecionar Caminhão...</option>
                          <option value="Placa OQW-1234">Placa OQW-1234 (Toco)</option>
                          <option value="Placa RTY-5678">Placa RTY-5678 (Truck)</option>
                          <option value="Placa UOP-9012">Placa UOP-9012 (HR)</option>
                          <option value="Placa PLM-3456">Placa PLM-3456 (Fiorino)</option>
                        </select>
                      </div>

                      <div className="relative">
                        <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select 
                          value={drivers[praca]}
                          onChange={e => setDrivers(prev => ({...prev, [praca]: e.target.value}))}
                          className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                        >
                          <option value="">Selecionar Motorista...</option>
                          <option value="Carlos Silva">Carlos Silva</option>
                          <option value="Roberto Souza">Roberto Souza</option>
                          <option value="Marcos Alves">Marcos Alves</option>
                          <option value="João Pedro">João Pedro</option>
                        </select>
                      </div>
                      
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="date"
                          value={dates[praca]}
                          onChange={e => setDates(prev => ({...prev, [praca]: e.target.value}))}
                          className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => handleAddAll(praca)}
                        className="flex-1 py-1.5 px-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold rounded-md transition-colors text-center"
                      >
                        Puxar autom.
                      </button>
                    </div>
                  </div>

                  {/* Routed Orders List */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30 custom-scrollbar">
                    {routedPedidos[praca].length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 px-4 text-center">
                        <Info className="w-6 h-6 mb-2" />
                        <p className="text-xs font-medium">Nenhum pedido atrelado a esta carga ainda.</p>
                      </div>
                    ) : (
                      routedPedidos[praca].map(pedido => (
                        <div key={pedido.id} className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm text-sm group flex flex-col gap-1 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                          <div className="flex justify-between items-start pl-1.5">
                            <span className="font-bold text-slate-900 text-xs">{pedido.id}</span>
                            <button 
                              onClick={() => handleRemove(pedido.id, praca)}
                              className="text-slate-300 hover:text-rose-500 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5 rotate-45" />
                            </button>
                          </div>
                          <p className="font-bold text-slate-700 text-xs truncate pl-1.5">{pedido.cliente}</p>
                          <p className="text-[10px] text-slate-500 font-medium pl-1.5 truncate">
                            {pedido.cidade} {pedido.rota_logistica && pedido.rota_logistica !== '-' ? `- ${pedido.rota_logistica}` : ''}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Save Button */}
                  <div className="p-3 border-t border-slate-100 bg-white">
                    <button 
                      onClick={() => handleSaveRoute(praca)}
                      disabled={routedPedidos[praca].length === 0}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      Salvar Carga
                    </button>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}