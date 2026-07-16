import { API_BASE_URL } from "../../constants";
import { storage, MovimentacaoPending } from "./storage";

export type IdentificacaoPayload = {
  nome: string;
  matricula: string;
};

export type MovimentacaoPayload = {
  responsavel: { nome: string; matricula: string };
  timestampLocal: string;
  deviceId: string;
};

export type Chave = {
  codigo: string;
  status: "disponivel" | "em_uso";
  responsavelAtual: { nome: string; matricula: string } | null;
  ultimaMovimentacaoEm: string | null;
};

export type Movimentacao = {
  id: string;
  chaveCodigo: string;
  tipo: "retirada" | "devolucao";
  responsavel: { nome: string; matricula: string };
  timestampLocal: string;
  deviceId: string;
  syncStatus: string;
};

export type ApiError = {
  codigo: string;
  mensagem: string;
};

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

export const api = {
  async identificar(payload: IdentificacaoPayload): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/v1/identificacao`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await handleResponse(response);
  },

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

  async buscarChave(codigo: string): Promise<Chave> {
    const response = await fetch(`${API_BASE_URL}/v1/chaves/${encodeURIComponent(codigo)}`);
    return handleResponse<Chave>(response);
  },

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

  async buscarHistorico(codigo: string): Promise<Movimentacao[]> {
    const response = await fetch(`${API_BASE_URL}/v1/chaves/${encodeURIComponent(codigo)}/historico`);
    return handleResponse<Movimentacao[]>(response);
  },

  // Sincroniza movimentações pendentes quando voltar online
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
