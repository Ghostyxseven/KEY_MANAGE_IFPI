import { API_BASE_URL } from "../../constants";

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
    const response = await fetch(`${API_BASE_URL}/v1/chaves`);
    return handleResponse<Chave[]>(response);
  },

  async buscarChave(codigo: string): Promise<Chave> {
    const response = await fetch(`${API_BASE_URL}/v1/chaves/${encodeURIComponent(codigo)}`);
    return handleResponse<Chave>(response);
  },

  async retirarChave(codigo: string, payload: MovimentacaoPayload): Promise<{ chave: Chave; movimentacao: Movimentacao }> {
    const response = await fetch(`${API_BASE_URL}/v1/chaves/${encodeURIComponent(codigo)}/retirada`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ chave: Chave; movimentacao: Movimentacao }>(response);
  },

  async devolverChave(codigo: string, payload: MovimentacaoPayload): Promise<{ chave: Chave; movimentacao: Movimentacao }> {
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
};