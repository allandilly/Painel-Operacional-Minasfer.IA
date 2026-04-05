import React, { useEffect, useState } from 'react';
import { useApp, Pedido, StatusGeral, EtapaAtual, Criticidade, PrioridadeProducao } from '../context/AppContext';
import { X, CheckCircle, Clock, Truck, Hammer, DollarSign, Store, FileText, Calendar, Box, Activity, AlertTriangle, MessageSquare, MapPin, User, Tag, Save, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

export function OrderDetailsModal() {
  const { 
    selectedOrderId, 
    closeOrderDetails, 
    pedidos,
    atualizarPedido,
    aprovarOrcamento
  } = useApp();

  const [isModalLoading, setIsModalLoading] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm<Partial<Pedido>>();

  useEffect(() => {
    if (selectedOrderId) {
      setIsModalLoading(true);
      const timer = setTimeout(() => setIsModalLoading(false), 600); // skeleton sim
      
      const pedido = (pedidos || []).find(p => p.id === selectedOrderId);
      if (pedido) {
        reset(pedido);
      }
      return () => clearTimeout(timer);
    }
  }, [selectedOrderId, pedidos, reset]);

  if (!selectedOrderId) return null;

  const pedido = (pedidos || []).find(p => p.id === selectedOrderId);

  if (!pedido && !isModalLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl relative">
          <button onClick={closeOrderDetails} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
          <div className="text-center py-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Pedido não encontrado</h3>
            <p className="text-slate-500 text-sm">Os dados base do pedido {selectedOrderId} não foram localizados.</p>
            <button 
              onClick={closeOrderDetails}
              className="mt-6 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 w-full"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) closeOrderDetails();
  };

  const onSubmit = (data: Partial<Pedido>) => {
    // Process form data
    atualizarPedido(selectedOrderId, data);
    closeOrderDetails();
  };

  const getCriticidadeColor = (crit: string) => {
    switch(crit) {
      case 'alta': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'atencao': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'baixa': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-400 border-slate-200';
    }
  };

  const watchNecessidadeProducao = watch("necessidade_producao");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
        
        {isModalLoading || !pedido ? (
          // Skeleton State for Modal (Etapa 3)
          <div className="flex-1 flex flex-col p-6 animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-48 bg-slate-100 rounded-xl border border-slate-200"></div>
                <div className="h-48 bg-slate-100 rounded-xl border border-slate-200"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-slate-100 rounded-xl border border-slate-200"></div>
                <div className="h-32 bg-slate-100 rounded-xl border border-slate-200"></div>
              </div>
            </div>
            <div className="h-16 mt-6 bg-slate-100 rounded-xl border border-slate-200"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/50 flex-shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Pedido {pedido.id}</h2>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getCriticidadeColor(pedido.criticidade)}`}>
                    Criticidade: {pedido.criticidade.charAt(0).toUpperCase() + pedido.criticidade.slice(1)}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full border bg-slate-100 text-slate-700 border-slate-200">
                    Etapa: {pedido.etapa_atual}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {pedido.cliente}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {pedido.cidade}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Atualizado em: {new Date(pedido.data_atualizacao).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <button type="button" onClick={closeOrderDetails} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Coluna Principal - 2/3 */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Bloco de Dados Principais */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                      <Store className="w-5 h-5 text-blue-500" />
                      <h3 className="font-bold text-slate-900 text-base">Dados Principais e Comercial</h3>
                    </div>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Cliente</label>
                          <input {...register('cliente')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Telefone</label>
                            <input {...register('telefone')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Cidade</label>
                            <input {...register('cidade')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Vendedor</label>
                            <input {...register('vendedor')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Origem</label>
                            <select {...register('origem')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors">
                              <option value="WhatsApp">WhatsApp</option>
                              <option value="Telefone">Telefone</option>
                              <option value="Email">Email</option>
                              <option value="Balcão">Balcão</option>
                              <option value="Licitação">Licitação</option>
                              <option value="Outro">Outro</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Valor do Pedido</label>
                          <input {...register('valor')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Data Prometida (Prazo)</label>
                          <input {...register('data_prometida')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                        </div>
                        <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                          <input type="checkbox" id="necessidade_producao" {...register('necessidade_producao')} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                          <label htmlFor="necessidade_producao" className="text-sm font-medium text-slate-700">Este pedido exige Produção / Corte?</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bloco Operacional (Dinâmico dependendo da necessidade de produção e modalidade) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Produção */}
                    <div className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-opacity ${watchNecessidadeProducao ? 'border-slate-200 opacity-100' : 'border-slate-200 opacity-50 grayscale pointer-events-none'}`}>
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                        <Hammer className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-bold text-slate-900 text-base">Produção</h3>
                      </div>
                      <div className="p-5 space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Itens para Produção</label>
                          <textarea {...register('producao_itens')} rows={2} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors resize-none" placeholder="Ex: 3 Ton - Perfis de Aço" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Prioridade Fabril</label>
                          <select {...register('producao_prioridade')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
                            <option value="Normal">Normal</option>
                            <option value="Alta">Alta</option>
                            <option value="Urgente">Urgente</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Logística */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                        <Truck className="w-5 h-5 text-amber-500" />
                        <h3 className="font-bold text-slate-900 text-base">Expedição / Logística</h3>
                      </div>
                      <div className="p-5 space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Modalidade de Saída</label>
                          <select {...register('modalidade')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors">
                            <option value="Entrega">Entrega via Frota</option>
                            <option value="Balcão">Retirada Balcão</option>
                            <option value="Retirada Galpão">Retirada Galpão</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Rota / Setor</label>
                            <input {...register('rota_logistica')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Motorista</label>
                            <input {...register('motorista')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coluna Secundária - 1/3 */}
                <div className="space-y-6 flex flex-col">
                  
                  {/* Bloco de Acompanhamento (Status) */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-5 h-5 text-emerald-500" />
                      <h3 className="font-bold text-slate-900 text-base">Acompanhamento</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Status Atual do Pedido</label>
                        <select {...register('status_atual')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors">
                          <option value="Orçamento Criado">Orçamento Criado</option>
                          <option value="Aguardando Cliente">Aguardando Cliente</option>
                          <option value="Confirmado">Confirmado / Aprovado</option>
                          <option value="Recebido pela produção">Em Produção</option>
                          <option value="Produção concluída">Produção Concluída</option>
                          <option value="Aguardando separação">Aguardando Separação</option>
                          <option value="Em rota">Em Rota (Entrega)</option>
                          <option value="Pronto para retirada">Pronto para Retirada</option>
                          <option value="Concluído operacionalmente">Concluído Operacionalmente</option>
                          <option value="Aguardando Faturamento">Aguardando Faturamento</option>
                          <option value="Aguardando Conciliação">Aguardando Pagamento</option>
                          <option value="Encerrado">Encerrado Financeiramente</option>
                          <option value="Expirado">Expirado / Cancelado</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Responsável Atual</label>
                        <input {...register('responsavel_atual')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Próxima Ação</label>
                        <input {...register('proxima_acao')} className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="Ex: Ligar para confirmar..." />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Criticidade</label>
                        <select {...register('criticidade')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors">
                          <option value="baixa">Baixa (Rotina)</option>
                          <option value="normal">Normal</option>
                          <option value="atencao">Atenção (Requer cuidado)</option>
                          <option value="alta">Alta (Urgência / Problema)</option>
                          <option value="inativo">Inativo / Morto</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Observações e Pendências */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-slate-500" />
                      <h3 className="font-bold text-slate-900 text-base">Anotações Internas</h3>
                    </div>
                    
                    <div className="space-y-4 flex-1 flex flex-col">
                      <div className="flex-1 flex flex-col">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Observações Operacionais (Livre)</label>
                        <textarea {...register('observacao_operacional')} className="w-full flex-1 min-h-[100px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none" placeholder="Anotações gerais visíveis para toda equipe..." />
                      </div>
                      
                      {pedido.pendencias.length > 0 && (
                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                          <label className="block text-xs font-bold text-rose-700 mb-2 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Pendências Registradas
                          </label>
                          <ul className="text-sm text-rose-900 space-y-1.5 list-disc pl-4 marker:text-rose-400">
                            {pedido.pendencias.map((pend, idx) => (
                              <li key={idx} className="leading-snug">{pend}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
              {/* Linha do Fluxo Curta */}
              <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-400">
                <span className={`flex items-center gap-1 ${['Caixa', 'Financeiro', 'Produção', 'Logística', 'Finalizado'].includes(pedido.etapa_atual) ? 'text-emerald-600' : ''}`}><CheckCircle className="w-3.5 h-3.5" /> Caixa</span>
                <span className="text-slate-300">-</span>
                <span className={`flex items-center gap-1 ${['Produção', 'Logística', 'Finalizado'].includes(pedido.etapa_atual) ? 'text-emerald-600' : pedido.etapa_atual === 'Financeiro' ? 'text-blue-600' : ''}`}>{['Produção', 'Logística', 'Finalizado'].includes(pedido.etapa_atual) ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />} Fin/Com</span>
                <span className="text-slate-300">-</span>
                <span className={`flex items-center gap-1 ${['Logística', 'Finalizado'].includes(pedido.etapa_atual) ? 'text-emerald-600' : pedido.etapa_atual === 'Produção' ? 'text-indigo-600' : ''}`}>{['Logística', 'Finalizado'].includes(pedido.etapa_atual) ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />} Prod</span>
                <span className="text-slate-300">-</span>
                <span className={`flex items-center gap-1 ${pedido.etapa_atual === 'Finalizado' ? 'text-emerald-600' : pedido.etapa_atual === 'Logística' ? 'text-amber-600' : ''}`}>{pedido.etapa_atual === 'Finalizado' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />} Log</span>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button type="button" onClick={closeOrderDetails} className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" /> Cancelar
                </button>
                <button type="submit" className="flex-1 md:flex-none px-5 py-2.5 bg-blue-600 border border-transparent text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Salvar Alterações
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}