import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { useApp, Pedido } from '../context/AppContext';
import { FileText, CheckCircle, Ticket, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

interface FaturamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: Pedido | null;
}

export function FaturamentoModal({ isOpen, onClose, pedido }: FaturamentoModalProps) {
  const { faturarPedido, atualizarPedido } = useApp();
  
  const [temNf, setTemNf] = useState(false);
  const [nfNumero, setNfNumero] = useState('');
  const [temBoleto, setTemBoleto] = useState(false);
  const [boletoNumero, setBoletoNumero] = useState('');
  const [geradoErp, setGeradoErp] = useState(false);

  useEffect(() => {
    if (pedido) {
      const temNfInit = pedido.nf && pedido.nf !== '-';
      const temBoletoInit = pedido.boleto && pedido.boleto !== '-';
      
      setTemNf(temNfInit);
      setNfNumero(temNfInit ? pedido.nf : '');
      
      setTemBoleto(temBoletoInit);
      setBoletoNumero(temBoletoInit ? pedido.boleto : '');
      
      setGeradoErp(!!pedido.financeiro_erp);
    }
  }, [pedido]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pedido) return;

    if (temNf && !nfNumero) {
      toast.error('Informe o número da NF.');
      return;
    }
    
    if (temBoleto && !boletoNumero) {
      toast.error('Informe o número do Boleto.');
      return;
    }

    const updates = {
      nf: temNf ? nfNumero : '-',
      boleto: temBoleto ? boletoNumero : '-',
      financeiro_erp: geradoErp
    };

    if (pedido.status_atual === 'Aguardando Faturamento') {
      faturarPedido(pedido.id, updates);
      toast.success(`Pedido ${pedido.id} faturado com sucesso!`);
    } else {
      atualizarPedido(pedido.id, updates);
      toast.success(`Dados financeiros do pedido ${pedido.id} atualizados!`);
    }

    onClose();
  };

  if (!pedido) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-slate-50 border-slate-200 shadow-2xl rounded-2xl flex flex-col">
        <DialogHeader className="p-6 pb-5 border-b border-slate-200 bg-white">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Faturamento e Dados Fiscais
          </DialogTitle>
          <DialogDescription className="text-slate-500 mt-1.5 text-sm">
            Faturamento do Pedido {pedido.id} - {pedido.cliente}
          </DialogDescription>
        </DialogHeader>

        <form id="faturamento-form" onSubmit={handleSave} className="p-6 space-y-6">
          <div className="space-y-4">
            
            {/* NF Section */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={temNf}
                    onChange={(e) => setTemNf(e.target.checked)}
                    className="peer sr-opacity w-5 h-5 opacity-0 absolute"
                  />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${temNf ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-300'}`}>
                    <CheckSquare className={`w-3.5 h-3.5 text-white ${temNf ? 'block' : 'hidden'}`} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm select-none">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Emitir / Informar Nota Fiscal (NF)
                </div>
              </label>
              
              {temNf && (
                <div className="pl-8 animate-in fade-in slide-in-from-top-2 duration-200">
                  <input 
                    type="text" 
                    value={nfNumero}
                    onChange={(e) => setNfNumero(e.target.value)}
                    placeholder="Número da NF (Ex: 12345)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
              )}
            </div>

            {/* Boleto Section */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={temBoleto}
                    onChange={(e) => setTemBoleto(e.target.checked)}
                    className="peer sr-opacity w-5 h-5 opacity-0 absolute"
                  />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${temBoleto ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'}`}>
                    <CheckSquare className={`w-3.5 h-3.5 text-white ${temBoleto ? 'block' : 'hidden'}`} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm select-none">
                  <Ticket className="w-4 h-4 text-emerald-500" />
                  Emitir / Informar Boleto Bancário
                </div>
              </label>
              
              {temBoleto && (
                <div className="pl-8 animate-in fade-in slide-in-from-top-2 duration-200">
                  <input 
                    type="text" 
                    value={boletoNumero}
                    onChange={(e) => setBoletoNumero(e.target.value)}
                    placeholder="Número do Boleto ou Linha Digitável"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
              )}
            </div>

            {/* ERP Generation Checkbox */}
            <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={geradoErp}
                    onChange={(e) => setGeradoErp(e.target.checked)}
                    className="peer sr-opacity w-5 h-5 opacity-0 absolute"
                  />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${geradoErp ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300'}`}>
                    <CheckSquare className={`w-3.5 h-3.5 text-white ${geradoErp ? 'block' : 'hidden'}`} />
                  </div>
                </div>
                <div className="text-slate-800 font-semibold text-sm select-none">
                  Gerado financeiro no ERP
                </div>
              </label>
              <p className="text-xs text-slate-500 mt-1.5 pl-8">
                Confirma que este pedido já foi faturado e registrado no sistema de gestão financeiro principal da empresa.
              </p>
            </div>

          </div>
        </form>

        <DialogFooter className="p-5 border-t border-slate-200 bg-white">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            form="faturamento-form"
            className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all"
          >
            Salvar Faturamento
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
