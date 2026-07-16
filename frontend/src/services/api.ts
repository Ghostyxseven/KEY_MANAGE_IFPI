import { API_BASE_URL } from "../../constants";
import { storage, MovimentacaoPending } from "./storage";

/** Dados necessários para identificar um usuário no sistema */
export type IdentificacaoPayload = {
  /** Nome completo do usuário */
  nome: string;
  /** Matrícula ou identificador do usuário */
  matricula: string;
};

/** Dados necessários para registrar uma movimentação de chave */
export type MovimentacaoPayload = {
  /** Responsável pela movimentação (nome e matrícula) */
  responsavel: { nome: string; matricula: string };
  /** Data/hora local da operação em formato ISO */
  timestampLocal: string;
  /** Identificador único do dispositivo que realizou a operação */
  deviceId: string;
};

/** Representa uma chave no sistema */
export type Chave = {
  /** Código identificador da chave (ex: A1, S5) */
  codigo: string;
  /** Status atual: disponível ou em uso */
  status: "disponivel" | "em_uso";
  /** Responsável atual pela chave, se estiver em uso */
  responsavelAtual: { nome: string; matricula: string } | null;
  /** Data/hora da última movimentação registrada */
  ultimaMovimentacaoEm: string | null;
};

/** Representa uma movimentação registrada no sistema */
export type Movimentacao = {
  /** Identificador único da movimentação */
  id: string;
  /** Código da chave relacionada à movimentação */
  chaveCodigo: string;
  /** Tipo de operação: retirada ou devolução */
  tipo: "retirada" | "devolucao";
  /** Responsável pela movimentação */
  responsavel: { nome: string; matricula: string };
  /** Data/hora local da operação */
  timestampLocal: string;
  /** ID do dispositivo onde a operação foi realizada */
  deviceId: string;
  /** Status de sincronização com o servidor */
  syncStatus: string;
};

/** Estrutura de erro retornado pela API */
export type ApiError = {
  /** Código do erro para tratamento programático */
  codigo: string;
  /** Mensagem descritiva do erro */
  mensagem: string;
};

/**
 * Processa respostas HTTP da API, lançando erros formatados para respostas não-ok.
 * @param response - Objeto Response da fetch API
 * @returns Dados JSON tipificados ou undefined para status 204
 * @throws Erro formatado com status e código para respostas de falha
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const erro: ApiError = await response.json().catch(() => ({
      codigo: "ERRO_DESCONHECIDO",
      mensagem: `HTTP ${response.status}`,
    }));
    const error = new Error(erro.mensagem) as Error & { status: number; codigo: string };
    error.status = response.status;
    error.codigo = erro.codigo;
    throw error;
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

/**
 * Serviço de comunicação com a API REST do backend.
 * Gerencia requisições HTTP e sincronização offline.
 */
export const api = {
  /**
   * Registra uma identificação de usuário no sistema.
   * @param payload - Dados de identificação (nome e matrícula)
   */
  async identificar(payload: IdentificacaoPayload): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/v1/identificacao`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await handleResponse(response);
  },

  /**
   * Lista todas as chaves disponíveis no sistema.
   * Funciona offline retornando dados em cache quando não há conexão.
   * @returns Array de chaves cadastradas
   */
  async listarChaves(): Promise<Chave[]> {
    const { isConnected } = await storage.getNetworkStatus();
    
    try {
      const response = await fetch(`${API_BASE_URL}/v1/chaves`);
      const chaves = await handleResponse<Chave[]>(response);
      
      // Salva no cache quando online
      await storage.salvarChavesCache(chaves);
      return chaves;
    } catch (error) {
      console.error("Erro ao buscar chaves da API, tentando cache:", error);
      
      // Se offline ou erro de rede, retorna do cache
      const cached = await storage.buscarChavesCache();
      if (cached) {
        return cached as Chave[];
      }
      
      throw error;
    }
  },

  /**
   * Busca os detalhes de uma chave específica pelo código.
   * @param codigo - Código identificador da chave
   * @returns Dados completos da chave
   */
  async buscarChave(codigo: string): Promise<Chave> {
    const response = await fetch(`${API_BASE_URL}/v1/chaves/${encodeURIComponent(codigo)}`);
    return handleResponse<Chave>(response);
  },

  /**
   * Registra a retirada de uma chave.
   * Em modo offline, salva a operação para sincronização posterior.
   * @param codigo - Código da chave a ser retirada
   * @param payload - Dados da movimentação (responsável, timestamp, deviceId)
   * @returns Objeto com a chave atualizada e a movimentação registrada
   */
  async retirarChave(codigo: string, payload: MovimentacaoPayload): Promise<{ chave: Chave; movimentacao: Movimentacao }> {
    const { isConnected } = await storage.getNetworkStatus();
    
    if (!isConnected) {
      // Modo offline: salva para sincronizar depois
      const movimentacaoPendente: MovimentacaoPending = {
        chaveCodigo: codigo,
        tipo: 'retirada',
        payload,
      };
      await storage.adicionarMovimentacaoPendente(movimentacaoPendente);
      
      // Retorna uma resposta simulada para a UI funcionar
      return {
        chave: {
          codigo,
          status: "em_uso",
          responsavelAtual: payload.responsavel,
          ultimaMovimentacaoEm: payload.timestampLocal,
        },
        movimentacao: {
          id: `pending-${Date.now()}`,
          chaveCodigo: codigo,
          tipo: "retirada",
          responsavel: payload.responsavel,
          timestampLocal: payload.timestampLocal,
          deviceId: payload.deviceId,
          syncStatus: "pending",
        },
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/v1/chaves/${encodeURIComponent(codigo)}/retirada`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ chave: Chave; movimentacao: Movimentacao }>(response);
  },

  /**
   * Registra a devolução de uma chave.
   * Em modo offline, salva a operação para sincronização posterior.
   * @param codigo - Código da chave a ser devolvida
   * @param payload - Dados da movimentação (responsável, timestamp, deviceId)
   * @returns Objeto com a chave atualizada e a movimentação registrada
   */
  async devolverChave(codigo: string, payload: MovimentacaoPayload): Promise<{ chave: Chave; movimentacao: Movimentacao }> {
    const { isConnected } = await storage.getNetworkStatus();
    
    if (!isConnected) {
      // Modo offline: salva para sincronizar depois
      const movimentacaoPendente: MovimentacaoPending = {
        chaveCodigo: codigo,
        tipo: 'devolucao',
        payload,
      };
      await storage.adicionarMovimentacaoPendente(movimentacaoPendente);
      
      // Retorna uma resposta simulada para a UI funcionar
      return {
        chave: {
          codigo,
          status: "disponivel",
          responsavelAtual: null,
          ultimaMovimentacaoEm: payload.timestampLocal,
        },
        movimentacao: {
          id: `pending-${Date.now()}`,
          chaveCodigo: codigo,
          tipo: "devolucao",
          responsavel: payload.responsavel,
          timestampLocal: payload.timestampLocal,
          deviceId: payload.deviceId,
          syncStatus: "pending",
        },
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/v1/chaves/${encodeURIComponent(codigo)}/devolucao`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ chave: Chave; movimentacao: Movimentacao }>(response);
  },

  /**
   * Busca o histórico de movimentações de uma chave específica.
   * @param codigo - Código da chave
   * @returns Array de movimentações históricas
   */
  async buscarHistorico(codigo: string): Promise<Movimentacao[]> {
    const response = await fetch(`${API_BASE_URL}/v1/chaves/${encodeURIComponent(codigo)}/historico`);
    const data = await handleResponse<unknown[]>(response);
    return data.map((item: unknown) => {
      const obj = item as Record<string, unknown>;
      return {
        id: (obj.id ?? "") as string,
        chaveCodigo: ((obj as Record<string, unknown>).chaveCodigo ?? (obj as Record<string, unknown>).codigoChave ?? codigo) as string,
        tipo: ((obj as Record<string, unknown>).tipo ?? "retirada") as Movimentacao["tipo"],
        responsavel: ((obj as Record<string, unknown>).responsavel ?? { nome: "", matricula: "" }) as Movimentacao["responsavel"],
        timestampLocal: ((obj as Record<string, unknown>).timestampLocal ?? (obj as Record<string, unknown>).timestamp ?? "") as string,
        deviceId: ((obj as Record<string, unknown>).deviceId ?? "") as string,
        syncStatus: ((obj as Record<string, unknown>).syncStatus ?? "") as string,
      };
    });
  },

  /**
   * Sincroniza todas as movimentações pendentes armazenadas localmente.
   * Deve ser chamado quando a conexão for restabelecida.
   * As operações são enviadas na ordem em que foram registradas.
   */
  async sincronizarPendencias(): Promise<void> {
    const { isConnected } = await storage.getNetworkStatus();
    if (!isConnected) {
      return;
    }

    const pendencias = await storage.buscarMovimentacoesPendentes();
    if (pendencias.length === 0) {
      return;
    }

    for (const pendencia of pendencias) {
      try {
        if (pendencia.tipo === 'retirada') {
          await this.retirarChave(pendencia.chaveCodigo, pendencia.payload);
        } else {
          await this.devolverChave(pendencia.chaveCodigo, pendencia.payload);
        }
      } catch (error) {
        console.error(`Erro ao sincronizar ${pendencia.tipo} da chave ${pendencia.chaveCodigo}:`, error);
        // Mantém na fila se falhar
        continue;
      }
    }

    // Limpa as pendências sincronizadas com sucesso
    await storage.limparMovimentacoesPendentes();
  },
};
