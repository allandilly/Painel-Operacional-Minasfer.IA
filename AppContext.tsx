import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

// Unified Status and Stages
export type StatusGeral = 'Orçamento Criado' | 'Aguardando Cliente' | 'Confirmado' | 'Expirado' | 'Aguardando Faturamento' | 'Aguardando Conciliação' | 'Encerrado' | 'Fila Mínima' | 'Recebido pela produção' | 'Atrasado' | 'Produção concluída' | 'Aguardando separação' | 'Pronto para retirada' | 'Em rota' | 'Concluído operacionalmente';
export type EtapaAtual = 'Caixa' | 'Financeiro' | 'Produção' | 'Logística' | 'Finalizado';
export type Criticidade = 'alta' | 'atencao' | 'normal' | 'baixa' | 'inativo';
export type PrioridadeProducao = 'Urgente' | 'Alta' | 'Normal';

// Unified Pedido entity for Future Database structure
export interface Pedido {
  id: string; // "PV-2042"
  cliente: string;
  telefone: string;
  cidade: string;
  vendedor: string;
  origem: string;
  modalidade: string; // "Entrega", "Balcão", "Retirada Galpão"
  status_atual: StatusGeral;
  etapa_atual: EtapaAtual;
  valor: string;
  data_prometida: string;
  responsavel_atual: string;
  pendencias: string[];
  necessidade_producao: boolean;
  forma_pagamento: string;
  condicao_parcelamento?: string;
  condicao_vencimento?: string;
  condicao_fechamento?: string;
  
  // Financeiro
  pagamento: string;
  nf: string;
  boleto: string;
  financeiro_erp?: boolean;
  oc?: string;
  
  // Produção
  producao_itens: string;
  producao_prioridade: PrioridadeProducao;
  
  // Logística
  rota_logistica: string;
  motorista: string;
  caminhao: string;
  
  // Metadados
  observacao_operacional: string;
  proxima_acao: string;
  data_criacao: string;
  data_atualizacao: string;
  criticidade: Criticidade;
}

// For retrocompatibility with views
export type OrcamentoStatus = 'Orçamento Criado' | 'Aguardando Cliente' | 'Confirmado' | 'Expirado';
export type ProducaoStatus = 'Fila Mínima' | 'Recebido pela produção' | 'Atrasado' | 'Produção concluída';
export type LogisticaStatus = 'Aguardando separação' | 'Pronto para retirada' | 'Liberado para entrega' | 'Em rota' | 'Concluído operacionalmente';
export type FinanceiroStatus = 'Aguardando Faturamento' | 'Aguardando Conciliação' | 'Encerrado';

export interface Orcamento {
  id: string;
  cliente: string;
  vendedor: string;
  valor: string;
  saida: string;
  producao: string;
  validade: string;
  status: OrcamentoStatus;
  criticidade: Criticidade;
}

export interface Financeiro {
  id: string;
  cliente: string;
  saida: string;
  pagamento: string;
  oc: string;
  nf: string;
  boleto: string;
  status: FinanceiroStatus;
  warning?: string;
}

export interface Producao {
  id: string;
  cliente: string;
  itens: string;
  prazo: string;
  prioridade: PrioridadeProducao;
  status: ProducaoStatus;
}

export interface Logistica {
  id: string;
  cliente: string;
  cidade: string;
  saida: string;
  rota: string;
  caminhao: string;
  motorista: string;
  status: LogisticaStatus;
}

export interface Alerta {
  id: string;
  cliente: string;
  setor: string;
  motivo: string;
  status: 'Crítico' | 'Atenção' | 'Travado';
  tempo: string;
}

export interface DadosNovoOrcamento {
  id?: string;
  cliente: string;
  telefone: string;
  vendedor: string;
  origem: string;
  cidade: string;
  modalidade: string;
  necessidade_producao: boolean;
  valor: string;
  data_prometida: string;
  producao_prioridade: PrioridadeProducao;
  etapa_inicial?: string;
  responsavel_atual?: string;
  observacao_operacional: string;
  criticidade: Criticidade;
  rota_logistica?: string;
  oc?: string;
  forma_pagamento: string;
  condicao_parcelamento?: string;
  condicao_vencimento?: string;
  condicao_fechamento?: string;
}

interface AppContextData {
  pedidos: Pedido[];
  orcamentos: Orcamento[];
  financeiro: Financeiro[];
  producao: Producao[];
  logistica: Logistica[];
  alertas: Alerta[];
  isLoading: boolean;
  
  criarOrcamento: (dados: DadosNovoOrcamento) => void;
  atualizarPedido: (id: string, updates: Partial<Pedido>) => void;
  
  aprovarOrcamento: (id: string) => void;
  faturarPedido: (id: string, updates?: Partial<Pedido>) => void;
  conciliarPedido: (id: string) => void;
  concluirProducao: (id: string) => void;
  desfazerProducao: (id: string) => void;
  avancarLogistica: (id: string) => void;
  
  selectedOrderId: string | null;
  openOrderDetails: (id: string) => void;
  closeOrderDetails: () => void;
}

const AppContext = createContext<AppContextData>({} as AppContextData);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c032a97c`;

  const fetchPedidos = async () => {
    try {
      const res = await fetch(`${API_URL}/pedidos`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      const data = await res.json();
      
      const initialPedidos = getInitialPedidos();
      
      if (data.pedidos && data.pedidos.length > 0) {
        setPedidos(data.pedidos);
        
        // Verifica se os pedidos simulados principais já existem, se não, faz um merge e salva
        if (!data.pedidos.some((p: Pedido) => p.id === 'PV-2061')) {
          console.log('Faltam pedidos simulados, complementando a base...');
          try {
            await fetch(`${API_URL}/pedidos/seed`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`
              },
              body: JSON.stringify({ pedidos: initialPedidos })
            });
            // Re-fetch para garantir
            const res2 = await fetch(`${API_URL}/pedidos`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` }});
            const data2 = await res2.json();
            if (data2.pedidos) setPedidos(data2.pedidos);
          } catch (e) {}
        }
      } else {
        // Se a base estiver vazia, lançar os pedidos simulados no servidor automaticamente
        try {
          await fetch(`${API_URL}/pedidos/seed`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({ pedidos: initialPedidos })
          });
          console.log('Pedidos simulados lançados na base de dados com sucesso.');
          
          const res2 = await fetch(`${API_URL}/pedidos`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` }});
          const data2 = await res2.json();
          if (data2.pedidos) setPedidos(data2.pedidos);
        } catch (seedErr) {
          console.error('Erro ao lançar pedidos simulados na base:', seedErr);
          setPedidos(initialPedidos);
        }
      }
    } catch (err) {
      console.error('Failed to fetch from real DB, falling back to local state:', err);
      setPedidos(getInitialPedidos());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const getInitialPedidos = (): Pedido[] => [
    {
      id: "PV-2042",
      cliente: "Via Norte Engenharia",
      telefone: "(31) 98888-1111",
      cidade: "Belo Horizonte",
      vendedor: "Carlos",
      origem: "WhatsApp",
      modalidade: "Entrega",
      status_atual: "Aguardando Cliente",
      etapa_atual: "Caixa",
      valor: "R$ 57.200,00",
      data_prometida: "Expirou há 2 dias",
      responsavel_atual: "Carlos",
      pendencias: ["Aguardando resposta do cliente no WhatsApp"],
      necessidade_producao: true,
      pagamento: "A Definir",
      nf: "-",
      boleto: "-",
      producao_itens: "Vergalhões e Chapas Base",
      producao_prioridade: "Alta",
      rota_logistica: "Zona Norte",
      motorista: "-",
      caminhao: "-",
      observacao_operacional: "Cliente pediu desconto extra, em avaliação pela diretoria.",
      proxima_acao: "Ligar para cliente",
      data_criacao: "2023-10-01T10:00:00Z",
      data_atualizacao: "2023-10-02T14:30:00Z",
      criticidade: "alta"
    },
    {
      id: "PV-2045",
      cliente: "Obras Horizonte Sul",
      telefone: "(31) 99999-2222",
      cidade: "Contagem",
      vendedor: "Marina",
      origem: "Email",
      modalidade: "Retirada Galpão",
      status_atual: "Confirmado",
      etapa_atual: "Caixa",
      valor: "R$ 24.300,00",
      data_prometida: "Hoje",
      responsavel_atual: "Marina",
      pendencias: [],
      necessidade_producao: false,
      pagamento: "PIX",
      nf: "-",
      boleto: "-",
      producao_itens: "-",
      producao_prioridade: "Normal",
      rota_logistica: "-",
      motorista: "Cliente",
      caminhao: "-",
      observacao_operacional: "Material separado, aguardando caminhão do cliente.",
      proxima_acao: "Faturar pedido",
      data_criacao: "2023-10-02T09:00:00Z",
      data_atualizacao: "2023-10-03T09:15:00Z",
      criticidade: "normal"
    },
    {
      id: "PV-2048",
      cliente: "Serralheria Dois Irmãos",
      telefone: "(31) 97777-3333",
      cidade: "Betim",
      vendedor: "Carlos",
      origem: "Balcão",
      modalidade: "Balcão",
      status_atual: "Orçamento Criado",
      etapa_atual: "Caixa",
      valor: "R$ 3.150,00",
      data_prometida: "7 dias",
      responsavel_atual: "Carlos",
      pendencias: [],
      necessidade_producao: false,
      pagamento: "Cartão",
      nf: "-",
      boleto: "-",
      producao_itens: "-",
      producao_prioridade: "Normal",
      rota_logistica: "-",
      motorista: "-",
      caminhao: "-",
      observacao_operacional: "-",
      proxima_acao: "Aguardar aprovação",
      data_criacao: "2023-10-03T11:00:00Z",
      data_atualizacao: "2023-10-03T11:00:00Z",
      criticidade: "baixa"
    },
    {
      id: "PV-2051",
      cliente: "Indústria Metálica Forte",
      telefone: "(31) 93333-5555",
      cidade: "Nova Lima",
      vendedor: "Fernanda",
      origem: "Email",
      modalidade: "Transportadora",
      status_atual: "Aguardando Faturamento",
      etapa_atual: "Financeiro",
      valor: "R$ 45.600,00",
      data_prometida: "Amanhã",
      responsavel_atual: "Ana (Financeiro)",
      pendencias: ["Aguardando liberação de crédito"],
      necessidade_producao: false,
      pagamento: "Faturado 28dd",
      nf: "-",
      boleto: "-",
      producao_itens: "-",
      producao_prioridade: "Normal",
      rota_logistica: "-",
      motorista: "-",
      caminhao: "-",
      observacao_operacional: "Faturar assim que o crédito for aprovado.",
      proxima_acao: "Aprovar Crédito",
      data_criacao: "2023-10-04T08:00:00Z",
      data_atualizacao: "2023-10-04T10:00:00Z",
      criticidade: "atencao"
    },
    {
      id: "PV-2055",
      cliente: "Concreto & Cia",
      telefone: "(31) 91111-2222",
      cidade: "Belo Horizonte",
      vendedor: "Roberto",
      origem: "WhatsApp",
      modalidade: "Entrega",
      status_atual: "Aguardando Conciliação",
      etapa_atual: "Financeiro",
      valor: "R$ 15.200,00",
      data_prometida: "Hoje",
      responsavel_atual: "João (Financeiro)",
      pendencias: [],
      necessidade_producao: false,
      pagamento: "Boleto Antecipado",
      nf: "NF-1030",
      boleto: "BOL-510",
      producao_itens: "-",
      producao_prioridade: "Normal",
      rota_logistica: "Centro",
      motorista: "-",
      caminhao: "-",
      observacao_operacional: "Aguardando compensação bancária para liberar entrega.",
      proxima_acao: "Baixar boleto",
      data_criacao: "2023-10-04T13:00:00Z",
      data_atualizacao: "2023-10-04T14:30:00Z",
      criticidade: "normal"
    },
    {
      id: "PV-2030",
      cliente: "Construtora Alfa",
      telefone: "(31) 96666-4444",
      cidade: "Belo Horizonte",
      vendedor: "Marina",
      origem: "Licitação",
      modalidade: "Entrega",
      status_atual: "Recebido pela produção",
      etapa_atual: "Produção",
      valor: "R$ 112.400,00",
      data_prometida: "Hoje, 14:00",
      responsavel_atual: "Chefe de Produção",
      pendencias: ["Falta insumo de corte"],
      necessidade_producao: true,
      pagamento: "Boleto 30/60",
      nf: "-",
      boleto: "-",
      producao_itens: "3 Ton - Perfis de Aço 6m (Corte)",
      producao_prioridade: "Alta",
      rota_logistica: "Zona Sul",
      motorista: "Roberto",
      caminhao: "Truck 01",
      observacao_operacional: "Urgência na entrega, obra parada.",
      proxima_acao: "Concluir corte",
      data_criacao: "2023-09-25T08:00:00Z",
      data_atualizacao: "2023-10-03T10:00:00Z",
      criticidade: "atencao"
    },
    {
      id: "PV-2060",
      cliente: "Estruturas Metálicas X",
      telefone: "(31) 99888-7777",
      cidade: "Contagem",
      vendedor: "Marina",
      origem: "Email",
      modalidade: "Entrega",
      status_atual: "Fila Mínima",
      etapa_atual: "Produção",
      valor: "R$ 32.500,00",
      data_prometida: "Semana que vem",
      responsavel_atual: "Chefe de Produção",
      pendencias: [],
      necessidade_producao: true,
      pagamento: "Sinal 50% pago",
      nf: "-",
      boleto: "-",
      producao_itens: "Chapas cortadas e dobradas",
      producao_prioridade: "Normal",
      rota_logistica: "Contagem/Industrial",
      motorista: "-",
      caminhao: "-",
      observacao_operacional: "Aguardando programação de corte na guilhotina.",
      proxima_acao: "Programar máquina",
      data_criacao: "2023-10-05T09:00:00Z",
      data_atualizacao: "2023-10-05T09:00:00Z",
      criticidade: "normal"
    },
    {
      id: "PV-2012",
      cliente: "Via Norte Engenharia",
      telefone: "(31) 98888-1111",
      cidade: "Betim",
      vendedor: "Carlos",
      origem: "Telefone",
      modalidade: "Entrega",
      status_atual: "Em rota",
      etapa_atual: "Logística",
      valor: "R$ 89.000,00",
      data_prometida: "Hoje",
      responsavel_atual: "Marcos (Motorista)",
      pendencias: [],
      necessidade_producao: true,
      pagamento: "Faturado",
      nf: "NF-1024",
      boleto: "BOL-505",
      producao_itens: "Estruturas Metálicas",
      producao_prioridade: "Normal",
      rota_logistica: "Região Metropolitana",
      motorista: "Marcos",
      caminhao: "VUC 03 (MGL-2020)",
      observacao_operacional: "Acompanhar recebimento na obra.",
      proxima_acao: "Confirmar entrega",
      data_criacao: "2023-09-20T09:00:00Z",
      data_atualizacao: "2023-10-03T12:00:00Z",
      criticidade: "normal"
    },
    {
      id: "PV-2061",
      cliente: "Construtora Mariana Sul",
      telefone: "(31) 98888-6666",
      cidade: "Mariana",
      vendedor: "Carlos",
      origem: "WhatsApp",
      modalidade: "Entrega",
      status_atual: "Aguardando separação",
      etapa_atual: "Logística",
      valor: "R$ 45.000,00",
      data_prometida: "Amanhã",
      responsavel_atual: "Expedição",
      pendencias: [],
      necessidade_producao: false,
      pagamento: "Faturado",
      nf: "NF-2061",
      boleto: "BOL-2061",
      producao_itens: "-",
      producao_prioridade: "Normal",
      rota_logistica: "Mariana / Centro",
      motorista: "-",
      caminhao: "-",
      observacao_operacional: "Prioridade para entrega matutina",
      proxima_acao: "Roteirizar",
      data_criacao: "2023-10-05T09:00:00Z",
      data_atualizacao: "2023-10-05T10:00:00Z",
      criticidade: "normal",
      forma_pagamento: "Faturado 28dd"
    },
    {
      id: "PV-2062",
      cliente: "Mineração Santa Bárbara",
      telefone: "(31) 99999-7777",
      cidade: "Santa Bárbara",
      vendedor: "Marina",
      origem: "Email",
      modalidade: "Entrega",
      status_atual: "Pronto para retirada",
      etapa_atual: "Logística",
      valor: "R$ 78.500,00",
      data_prometida: "Hoje",
      responsavel_atual: "Expedição",
      pendencias: [],
      necessidade_producao: true,
      pagamento: "Sinal Pago",
      nf: "NF-2062",
      boleto: "-",
      producao_itens: "Estruturas pesadas",
      producao_prioridade: "Alta",
      rota_logistica: "Distrito Industrial SB",
      motorista: "-",
      caminhao: "-",
      observacao_operacional: "Requer caminhão truck e conferência de peso extra",
      proxima_acao: "Roteirizar",
      data_criacao: "2023-10-04T09:00:00Z",
      data_atualizacao: "2023-10-05T14:00:00Z",
      criticidade: "atencao",
      forma_pagamento: "Sinal + Boleto"
    },
    {
      id: "PV-2063",
      cliente: "Serralheria Cachoeira",
      telefone: "(31) 97777-8888",
      cidade: "Cachoeira do Campo",
      vendedor: "Fernanda",
      origem: "Telefone",
      modalidade: "Transportadora",
      status_atual: "Aguardando separação",
      etapa_atual: "Logística",
      valor: "R$ 12.300,00",
      data_prometida: "Quinta-feira",
      responsavel_atual: "Expedição",
      pendencias: [],
      necessidade_producao: false,
      pagamento: "Cartão",
      nf: "NF-2063",
      boleto: "-",
      producao_itens: "-",
      producao_prioridade: "Normal",
      rota_logistica: "Cachoeira / BR",
      motorista: "-",
      caminhao: "-",
      observacao_operacional: "Transportadora parceira passará para coletar no galpão",
      proxima_acao: "Roteirizar",
      data_criacao: "2023-10-05T11:00:00Z",
      data_atualizacao: "2023-10-05T11:30:00Z",
      criticidade: "baixa",
      forma_pagamento: "Cartão de Crédito"
    },
    {
      id: "PV-2064",
      cliente: "Ouro Branco Edificações",
      telefone: "(31) 95555-9999",
      cidade: "Ouro Branco",
      vendedor: "Roberto",
      origem: "Licitação",
      modalidade: "Entrega",
      status_atual: "Aguardando separação",
      etapa_atual: "Logística",
      valor: "R$ 145.000,00",
      data_prometida: "Sexta-feira",
      responsavel_atual: "Expedição",
      pendencias: [],
      necessidade_producao: true,
      pagamento: "PIX Antecipado",
      nf: "NF-2064",
      boleto: "-",
      producao_itens: "Lote completo de tubos",
      producao_prioridade: "Urgente",
      rota_logistica: "Ouro Branco / Siderúrgica",
      motorista: "-",
      caminhao: "-",
      observacao_operacional: "Volume muito alto, requer carregamento via ponte rolante",
      proxima_acao: "Roteirizar",
      data_criacao: "2023-10-03T16:00:00Z",
      data_atualizacao: "2023-10-05T15:00:00Z",
      criticidade: "alta",
      forma_pagamento: "PIX"
    }
  ];

  const safePedidos = pedidos ?? [];

  // Derived States mapping to original views
  const orcamentos: Orcamento[] = safePedidos
    .filter(p => ['Caixa', 'Financeiro'].includes(p.etapa_atual) || p.status_atual === 'Expirado')
    .map(p => ({
      id: p.id,
      cliente: p.cliente,
      vendedor: p.vendedor,
      valor: p.valor,
      saida: p.modalidade,
      producao: p.necessidade_producao ? "Sim" : "Não",
      validade: p.data_prometida,
      status: (['Orçamento Criado', 'Aguardando Cliente', 'Confirmado', 'Expirado'].includes(p.status_atual) ? p.status_atual : 'Confirmado') as OrcamentoStatus,
      criticidade: p.criticidade
  }));

  const financeiro: Financeiro[] = safePedidos
    .filter(p => ['Aguardando Faturamento', 'Aguardando Conciliação', 'Encerrado'].includes(p.status_atual as string) || (p.etapa_atual === 'Financeiro' || p.etapa_atual === 'Produção' || p.etapa_atual === 'Logística'))
    .map(p => {
      let fStatus: FinanceiroStatus = 'Aguardando Faturamento';
      if (p.nf !== '-') fStatus = 'Aguardando Conciliação';
      if (p.status_atual === 'Encerrado') fStatus = 'Encerrado';
      
      return {
        id: p.id,
        cliente: p.cliente,
        saida: p.modalidade,
        pagamento: p.pagamento,
        oc: p.oc || "-",
        nf: p.nf,
        boleto: p.boleto,
        status: fStatus,
        warning: p.pendencias.length > 0 ? p.pendencias[0] : undefined
      };
    });

  const producao: Producao[] = safePedidos
    .filter(p => p.necessidade_producao && (p.etapa_atual === 'Produção' || p.etapa_atual === 'Logística'))
    .map(p => {
      let pStatus: ProducaoStatus = 'Recebido pela produção';
      if (p.status_atual === 'Fila Mínima' || p.status_atual === 'Atrasado' || p.status_atual === 'Produção concluída' || p.status_atual === 'Recebido pela produção') {
        pStatus = p.status_atual as ProducaoStatus;
      } else if (p.etapa_atual === 'Logística' || p.etapa_atual === 'Finalizado') {
        pStatus = 'Produção concluída';
      }
      return {
        id: p.id,
        cliente: p.cliente,
        itens: p.producao_itens,
        prazo: p.data_prometida,
        prioridade: p.producao_prioridade,
        status: pStatus
      }
    });

  const logistica: Logistica[] = safePedidos
    .filter(p => p.etapa_atual === 'Logística' || p.etapa_atual === 'Produção')
    .map(p => {
      let lStatus: LogisticaStatus = 'Aguardando separação';
      if (['Aguardando separação', 'Pronto para retirada', 'Liberado para entrega', 'Em rota', 'Concluído operacionalmente'].includes(p.status_atual as string)) {
        lStatus = p.status_atual as LogisticaStatus;
      }
      return {
        id: p.id,
        cliente: p.cliente,
        cidade: p.cidade,
        saida: p.modalidade,
        rota: p.rota_logistica,
        caminhao: p.caminhao,
        motorista: p.motorista,
        status: lStatus
      }
    });

  const alertas: Alerta[] = [
    { id: "PV-2030", cliente: "Construtora Alfa", setor: "Produção", motivo: "Material insuficiente para corte", status: "Atenção", tempo: "Há 2 horas" },
    { id: "PV-2042", cliente: "Via Norte Engenharia", setor: "Comercial", motivo: "Aguardando aprovação de desconto", status: "Crítico", tempo: "Há 45 min" },
  ];

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const openOrderDetails = (id: string) => setSelectedOrderId(id);
  const closeOrderDetails = () => setSelectedOrderId(null);

  // Actions
  const atualizarPedido = async (id: string, updates: Partial<Pedido>) => {
    try {
      const prevPedido = (pedidos || []).find(p => p.id === id);
      
      const res = await fetch(`${API_URL}/pedidos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(updates)
      });
      
      if (res.ok) {
        const { pedido } = await res.json();
        setPedidos(prev => (prev || []).map(p => p.id === id ? pedido : p));
        
        // Intelligent Notification
        if (prevPedido && updates.etapa_atual && prevPedido.etapa_atual !== updates.etapa_atual) {
          toast.success(`Pedido ${id} movido da etapa ${prevPedido.etapa_atual} para ${updates.etapa_atual}!`);
        } else {
          toast.success(`Pedido ${id} atualizado com sucesso.`);
        }
      } else {
        // Fallback for local changes
        setPedidos(prev => (prev || []).map(p => p.id === id ? { ...p, ...updates, data_atualizacao: new Date().toISOString() } : p));
        toast.success(`Pedido ${id} atualizado localmente.`);
      }
    } catch (err) {
      console.error(err);
      setPedidos(prev => (prev || []).map(p => p.id === id ? { ...p, ...updates, data_atualizacao: new Date().toISOString() } : p));
      toast.success(`Pedido ${id} atualizado localmente.`);
    }
  };

  const criarOrcamento = async (dados: DadosNovoOrcamento) => {
    const id = dados.id || `PV-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const novoPedido: Pedido = {
      id,
      cliente: dados.cliente,
      telefone: dados.telefone || "-",
      cidade: dados.cidade || "-",
      vendedor: dados.vendedor,
      origem: dados.origem || "Novo",
      modalidade: dados.modalidade,
      status_atual: 'Orçamento Criado',
      etapa_atual: (dados.etapa_inicial || 'Caixa') as EtapaAtual,
      valor: dados.valor,
      data_prometida: dados.data_prometida,
      responsavel_atual: dados.responsavel_atual || dados.vendedor,
      pendencias: [],
      necessidade_producao: dados.necessidade_producao,
      forma_pagamento: dados.forma_pagamento,
      condicao_parcelamento: dados.condicao_parcelamento,
      condicao_vencimento: dados.condicao_vencimento,
      condicao_fechamento: dados.condicao_fechamento,
      pagamento: dados.forma_pagamento,
      nf: '-',
      boleto: '-',
      oc: dados.oc || '-',
      producao_itens: '-',
      producao_prioridade: dados.producao_prioridade,
      rota_logistica: dados.rota_logistica || '-',
      motorista: '-',
      caminhao: '-',
      observacao_operacional: dados.observacao_operacional || '',
      proxima_acao: 'Aguardar aprovação',
      data_criacao: new Date().toISOString(),
      data_atualizacao: new Date().toISOString(),
      criticidade: dados.criticidade
    };

    try {
      const res = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(novoPedido)
      });
      
      if (res.ok) {
        setPedidos(prev => [novoPedido, ...(prev || [])]);
      } else {
        setPedidos(prev => [novoPedido, ...(prev || [])]);
      }
    } catch (err) {
      setPedidos(prev => [novoPedido, ...(prev || [])]);
    }
    
    toast.success(`Orçamento ${id} criado com sucesso para ${dados.cliente}!`);
  };

  const aprovarOrcamento = (id: string) => {
    const p = (pedidos || []).find(ped => ped.id === id);
    if (p) {
      atualizarPedido(id, {
        status_atual: 'Aguardando Faturamento',
        etapa_atual: p.necessidade_producao ? 'Produção' : 'Financeiro',
        criticidade: 'normal'
      });
    }
  };

  const faturarPedido = (id: string, updates: Partial<Pedido> = {}) => {
    atualizarPedido(id, {
      status_atual: 'Aguardando Conciliação',
      ...updates
    });
  };

  const conciliarPedido = (id: string) => {
    const p = (pedidos || []).find(ped => ped.id === id);
    if (p) {
      atualizarPedido(id, {
        status_atual: 'Encerrado', // Financeiramente
        etapa_atual: p.necessidade_producao ? 'Produção' : 'Logística'
      });
    }
  };

  const concluirProducao = (id: string) => {
    atualizarPedido(id, {
      status_atual: 'Aguardando separação',
      etapa_atual: 'Logística'
    });
  };

  const desfazerProducao = (id: string) => {
    atualizarPedido(id, {
      status_atual: 'Recebido pela produção',
      etapa_atual: 'Produção'
    });
  };

  const avancarLogistica = (id: string) => {
    const p = (pedidos || []).find(ped => ped.id === id);
    if (p) {
      let novoStatus: StatusGeral = p.status_atual;
      let novaEtapa: EtapaAtual = p.etapa_atual;

      if (p.status_atual === 'Aguardando separação') {
        novoStatus = p.modalidade === 'Entrega' || p.modalidade === 'Transportadora' ? 'Liberado para entrega' : 'Pronto para retirada';
      } else if (p.status_atual === 'Liberado para entrega') {
        novoStatus = 'Em rota';
      } else if (p.status_atual === 'Em rota' || p.status_atual === 'Pronto para retirada') {
        novoStatus = 'Aguardando Conciliação';
        novaEtapa = 'Financeiro';
      }

      atualizarPedido(id, {
        status_atual: novoStatus,
        etapa_atual: novaEtapa
      });
    }
  };

  return (
    <AppContext.Provider value={{
      pedidos,
      orcamentos,
      financeiro,
      producao,
      logistica,
      alertas,
      isLoading,
      criarOrcamento,
      atualizarPedido,
      aprovarOrcamento,
      faturarPedido,
      conciliarPedido,
      concluirProducao,
      desfazerProducao,
      avancarLogistica,
      selectedOrderId,
      openOrderDetails,
      closeOrderDetails
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}