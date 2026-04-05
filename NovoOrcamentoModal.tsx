import React, { useState } from 'react';
import { useApp, PrioridadeProducao, Criticidade } from '../context/AppContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Truck, MapPin, Box, Calendar, ClipboardList, Info, Factory, InfoIcon, FileText } from 'lucide-react';

interface NovoOrcamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovoOrcamentoModal({ isOpen, onClose }: NovoOrcamentoModalProps) {
  const { criarOrcamento } = useApp();
  
  const [formData, setFormData] = useState({
    numero_pv: '',
    cliente: '',
    telefone: '',
    vendedor: '',
    origem: 'WhatsApp',
    cidade: '',
    modalidade: 'Entrega',
    necessidade_producao: false,
    tem_oc: false,
    oc: '',
    valor: '',
    data_prometida: '',
    validade: '7 dias',
    producao_prioridade: 'Normal' as PrioridadeProducao,
    responsavel_atual: '',
    observacao_operacional: '',
    criticidade: 'normal' as Criticidade,
    rota_logistica: '',
    forma_pagamento: '',
    condicao_parcelamento: '',
    condicao_vencimento: '',
    condicao_fechamento: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.numero_pv || !formData.cliente || !formData.valor || !formData.cidade || !formData.vendedor || !formData.origem || !formData.modalidade || !formData.forma_pagamento) {
      toast.error('Preencha todos os campos obrigatórios (*).');
      return;
    }
    
    if (formData.tem_oc && !formData.oc) {
      toast.error('Informe o número da Ordem de Compra (O.C.)');
      return;
    }

    criarOrcamento({
      id: formData.numero_pv,
      cliente: formData.cliente,
      telefone: formData.telefone,
      vendedor: formData.vendedor || 'Vendedor Padrão',
      origem: formData.origem,
      cidade: formData.cidade,
      modalidade: formData.modalidade,
      necessidade_producao: formData.necessidade_producao,
      oc: formData.tem_oc ? formData.oc : '-',
      valor: `R$ ${formData.valor}`,
      data_prometida: formData.data_prometida || formData.validade,
      producao_prioridade: formData.producao_prioridade,
      responsavel_atual: formData.responsavel_atual,
      observacao_operacional: formData.observacao_operacional,
      criticidade: formData.criticidade,
      rota_logistica: formData.rota_logistica,
      forma_pagamento: formData.tem_oc ? 'Boleto' : formData.forma_pagamento,
      condicao_parcelamento: formData.condicao_parcelamento,
      condicao_vencimento: formData.condicao_vencimento,
      condicao_fechamento: formData.condicao_fechamento
    });
    
    // Reset and close
    setFormData({
      numero_pv: '',
      cliente: '',
      telefone: '',
      vendedor: '',
      origem: 'WhatsApp',
      cidade: '',
      modalidade: 'Entrega',
      necessidade_producao: false,
      tem_oc: false,
      oc: '',
      valor: '',
      data_prometida: '',
      validade: '7 dias',
      producao_prioridade: 'Normal',
      responsavel_atual: '',
      observacao_operacional: '',
      criticidade: 'normal',
      rota_logistica: '',
      forma_pagamento: '',
      condicao_parcelamento: '',
      condicao_vencimento: '',
      condicao_fechamento: ''
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-slate-50 border-slate-200 shadow-2xl rounded-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <DialogHeader className="p-6 pb-5 border-b border-slate-200 bg-white relative shrink-0">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Registrar Orçamento no Painel Operacional
          </DialogTitle>
          <DialogDescription className="text-slate-500 mt-1.5 text-sm leading-relaxed max-w-lg">
            Informe o número do PV gerado no ERP da loja e os dados complementares para lançar o orçamento no Painel Operacional e acompanhar visualmente seu fluxo.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <form id="novo-orcamento-form" onSubmit={handleSave} className="overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-50/50">
          
          {/* Section 1: Identificação principal */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-indigo-500" />
              Identificação Principal
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-semibold text-slate-700">Número do PV / Orçamento do ERP *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <FileText className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    required
                    value={formData.numero_pv}
                    onChange={e => handleChange('numero_pv', e.target.value)}
                    placeholder="Ex: PV-2042"
                    className="w-full pl-9 pr-3.5 py-3 bg-indigo-50/30 border-2 border-indigo-200 rounded-lg text-base font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:font-normal placeholder:text-slate-400 shadow-sm text-slate-900"
                  />
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <InfoIcon className="w-3.5 h-3.5" />
                  Identificador do orçamento já criado no sistema da loja
                </p>
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold text-slate-700">Cliente *</label>
                <input 
                  type="text" 
                  required
                  value={formData.cliente}
                  onChange={e => handleChange('cliente', e.target.value)}
                  placeholder="Nome do cliente ou empresa"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 shadow-sm"
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold text-slate-700">Telefone / WhatsApp</label>
                <input 
                  type="text" 
                  value={formData.telefone}
                  onChange={e => handleChange('telefone', e.target.value)}
                  placeholder="(31) 90000-0000"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 shadow-sm"
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold text-slate-700">Vendedor Responsável *</label>
                <input 
                  type="text" 
                  required
                  value={formData.vendedor}
                  onChange={e => handleChange('vendedor', e.target.value)}
                  placeholder="Nome do vendedor"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 shadow-sm"
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold text-slate-700">Origem *</label>
                <select 
                  required
                  value={formData.origem}
                  onChange={e => handleChange('origem', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-700 shadow-sm"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Telefone">Telefone</option>
                  <option value="Balcão">Balcão (Presencial)</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Email">E-mail</option>
                </select>
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-semibold text-slate-700">Cidade / Praça *</label>
                <input 
                  type="text" 
                  required
                  value={formData.cidade}
                  onChange={e => handleChange('cidade', e.target.value)}
                  placeholder="Ex: Belo Horizonte, Contagem..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 shadow-sm"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 2: Operacional */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Box className="w-4 h-4 text-emerald-500" />
              Dados Operacionais
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Valor Estimado *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">R$</span>
                  <input 
                    type="text" 
                    required
                    value={formData.valor}
                    onChange={e => handleChange('valor', e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 shadow-sm font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Data Prometida</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input 
                    type="text"
                    value={formData.data_prometida}
                    onChange={e => handleChange('data_prometida', e.target.value)}
                    placeholder="DD/MM/AAAA"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Tipo de Saída *</label>
                <select 
                  required
                  value={formData.modalidade}
                  onChange={e => handleChange('modalidade', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-700 shadow-sm"
                >
                  <option value="Entrega">Entrega (Transporte próprio)</option>
                  <option value="Retirada Galpão">Retirada no Galpão</option>
                  <option value="Balcão">Balcão</option>
                  <option value="Transportadora">Transportadora</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                  Forma de Pagamento *
                  {formData.tem_oc && <span className="text-[10px] text-rose-500 font-bold uppercase">Boleto Obrigatório</span>}
                </label>
                <select 
                  required
                  value={formData.forma_pagamento}
                  onChange={e => handleChange('forma_pagamento', e.target.value)}
                  disabled={formData.tem_oc}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-700 shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="" disabled>Selecione...</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="Débito">Débito</option>
                  <option value="Crédito">Crédito</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Mensalista">Mensalista</option>
                  <option value="Crediário">Crediário</option>
                </select>
                {['Boleto', 'Mensalista', 'Crediário'].includes(formData.forma_pagamento) && (
                  <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1 leading-tight">
                    <Info className="w-3 h-3 shrink-0" />
                    Exige passagem pelo Financeiro e posterior conciliação
                  </p>
                )}
              </div>

              {formData.forma_pagamento === 'Crédito' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-semibold text-slate-700">Parcelamento</label>
                  <input 
                    type="text"
                    value={formData.condicao_parcelamento}
                    onChange={e => handleChange('condicao_parcelamento', e.target.value)}
                    placeholder="Ex: 3x sem juros"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              )}

              {formData.forma_pagamento === 'Boleto' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-semibold text-slate-700">Vencimento</label>
                  <input 
                    type="text"
                    value={formData.condicao_vencimento}
                    onChange={e => handleChange('condicao_vencimento', e.target.value)}
                    placeholder="Ex: 30/60/90 dias"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              )}

              {['Mensalista', 'Crediário'].includes(formData.forma_pagamento) && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-semibold text-slate-700">Condição / Fechamento</label>
                  <input 
                    type="text"
                    value={formData.condicao_fechamento}
                    onChange={e => handleChange('condicao_fechamento', e.target.value)}
                    placeholder="Ex: Dia 15 / Mês seguinte"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Requer Produção? *</label>
                <div className="flex items-center gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => handleChange('necessidade_producao', true)}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2 ${formData.necessidade_producao ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('necessidade_producao', false)}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2 ${!formData.necessidade_producao ? 'bg-slate-800 border-slate-800 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    Não
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold text-slate-700">Prazo de Validade</label>
                <select 
                  value={formData.validade}
                  onChange={e => handleChange('validade', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-700 shadow-sm"
                >
                  <option value="Hoje">Hoje</option>
                  <option value="Amanhã">Amanhã</option>
                  <option value="7 dias">7 dias</option>
                  <option value="15 dias">15 dias</option>
                  <option value="30 dias">30 dias</option>
                </select>
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold text-slate-700">Pedido com O.C.? *</label>
                <div className="flex items-center gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleChange('tem_oc', true);
                      handleChange('forma_pagamento', 'Boleto');
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2 ${formData.tem_oc ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange('tem_oc', false);
                      handleChange('oc', '');
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2 ${!formData.tem_oc ? 'bg-slate-800 border-slate-800 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    Não
                  </button>
                </div>
              </div>

              {formData.tem_oc && (
                <div className="space-y-1.5 col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-semibold text-slate-700">Número da O.C. *</label>
                  <input 
                    type="text" 
                    required={formData.tem_oc}
                    value={formData.oc}
                    onChange={e => handleChange('oc', e.target.value)}
                    placeholder="Ex: O.C. 1964"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              )}
              
              {/* Conditional Field: Produção */}
              {formData.necessidade_producao && (
                <div className="col-span-2 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Factory className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="space-y-2 w-full">
                    <p className="text-sm text-indigo-900 font-medium leading-tight">
                      Este pedido será enviado para a <strong>Fila Mínima da Produção</strong>.
                    </p>
                    <div className="flex gap-4 items-center pt-1">
                      <label className="text-xs font-semibold text-indigo-800">Prioridade na Produção:</label>
                      <select 
                        value={formData.producao_prioridade}
                        onChange={e => handleChange('producao_prioridade', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-indigo-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-900 shadow-sm"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Alta">Alta</option>
                        <option value="Urgente">Urgente</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 3: Fluxo */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              Fluxo e Observações
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-semibold text-slate-700">Observação Curta</label>
                <textarea 
                  rows={2}
                  value={formData.observacao_operacional}
                  onChange={e => handleChange('observacao_operacional', e.target.value)}
                  placeholder="Instruções curtas ou observações para as próximas etapas..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-slate-400 shadow-sm resize-none custom-scrollbar"
                />
              </div>

              {formData.modalidade === 'Entrega' && (
                <div className="space-y-1.5 col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-slate-400" />
                    Rota / Bairro / Observação Logística
                  </label>
                  <input 
                    type="text" 
                    value={formData.rota_logistica}
                    onChange={e => handleChange('rota_logistica', e.target.value)}
                    placeholder="Região, bairro ou observação de entrega"
                    className="w-full px-3.5 py-2.5 bg-amber-50/50 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder:text-amber-700/50 shadow-sm"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <InfoIcon className="w-4 h-4 text-indigo-500" />
                Caminho Previsto do Pedido
              </h4>
              <p className="text-sm text-slate-600">
                Caixa 
                {((formData.tem_oc || ['Boleto', 'Mensalista', 'Crediário'].includes(formData.forma_pagamento)) || formData.modalidade !== 'Balcão') ? ' → Financeiro' : ''}
                {formData.necessidade_producao ? ' → Produção' : ''}
                {(formData.modalidade === 'Retirada Galpão' || formData.modalidade === 'Entrega' || formData.modalidade === 'Transportadora') ? ' → Expedição e Logística' : ''}
                {formData.modalidade === 'Balcão' && !(formData.tem_oc || ['Boleto', 'Mensalista', 'Crediário'].includes(formData.forma_pagamento)) && !formData.necessidade_producao ? ' → Concluído' : ''}
              </p>
            </div>
          </div>

        </form>

        {/* Footer */}
        <DialogFooter className="p-5 border-t border-slate-200 bg-white shrink-0 flex items-center justify-between sm:justify-between">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            Cancelar
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              type="button"
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
              onClick={() => {
                toast.success('Rascunho salvo com sucesso');
                onClose();
              }}
            >
              Salvar rascunho
            </button>
            <button 
              type="submit"
              form="novo-orcamento-form"
              className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all flex items-center gap-2"
            >
              Lançar no Painel
            </button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
