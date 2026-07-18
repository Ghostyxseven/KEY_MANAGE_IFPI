import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from "expo-network";

const CHAVES_CACHE_KEY = "@coretech:chaves_cache";
const HISTORICO_CACHE_KEY = "@coretech:historico_cache";
const MOVIMENTACOES_PENDING_KEY = "@coretech:movimentacoes_pending";
const DEVICE_ID_KEY = "@coretech:device_id";

export type MovimentacaoPending = {
  id: string;
  ownerUid?: string;
  chaveCodigo: string;
  tipo: "retirada" | "devolucao";
  payload: {
    responsavel: { nome: string; matricula: string };
    timestampLocal: string;
    deviceId: string;
  };
  error?: string;
  tentativas?: number;
  proximaTentativaEm?: string;
};

type ChaveCache = {
  codigo: string;
  status: "disponivel" | "em_uso";
  responsavelAtual: { nome: string; matricula: string } | null;
  ultimaMovimentacaoEm: string | null;
  arquivada?: boolean;
};

let filaDeEscrita: Promise<void> = Promise.resolve();

function serializarEscrita(operacao: () => Promise<void>): Promise<void> {
  const proxima = filaDeEscrita.then(operacao, operacao);
  filaDeEscrita = proxima.catch(() => undefined);
  return proxima;
}

function criarId(prefixo: string): string {
  return `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function criarUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (caractere): string => {
    const aleatorio = Math.floor(Math.random() * 16);
    const valor = caractere === "x" ? aleatorio : (aleatorio & 0x3) | 0x8;
    return valor.toString(16);
  });
}

function idMovimentacaoValido(id: string | undefined): id is string {
  return typeof id === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function normalizarPendencia(item: Partial<MovimentacaoPending>): MovimentacaoPending | null {
  if (!item.chaveCodigo || !item.tipo || !item.payload) return null;
  return {
    id: idMovimentacaoValido(item.id) ? item.id : criarUuid(),
    ownerUid: item.ownerUid,
    chaveCodigo: item.chaveCodigo,
    tipo: item.tipo,
    payload: item.payload,
    error: item.error,
    tentativas: item.tentativas ?? 0,
    proximaTentativaEm: item.proximaTentativaEm,
  };
}

export const storage = {
  async getNetworkStatus(): Promise<{ isConnected: boolean; isOffline: boolean }> {
    const estado = await Network.getNetworkStateAsync();
    const isConnected = (estado.isConnected ?? false) && estado.isInternetReachable !== false;
    return { isConnected, isOffline: !isConnected };
  },

  async getDeviceId(): Promise<string> {
    const existente = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existente) return existente;
    const criado = criarId("device");
    await serializarEscrita(async () => {
      const atual = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (!atual) await AsyncStorage.setItem(DEVICE_ID_KEY, criado);
    });
    return (await AsyncStorage.getItem(DEVICE_ID_KEY)) ?? criado;
  },

  async salvarChavesCache(chaves: ChaveCache[]): Promise<void> {
    await AsyncStorage.setItem(CHAVES_CACHE_KEY, JSON.stringify(chaves));
  },

  async buscarChavesCache(): Promise<unknown[] | null> {
    const data = await AsyncStorage.getItem(CHAVES_CACHE_KEY);
    if (!data) return null;
    try {
      const parsed: unknown = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },

  async atualizarChaveCache(chave: ChaveCache): Promise<void> {
    await serializarEscrita(async () => {
      const atuais = await this.buscarChavesCache();
      if (!atuais) return;
      const atualizadas = atuais.map((item) => {
        if (typeof item !== "object" || item === null || !("codigo" in item)) return item;
        return item.codigo === chave.codigo ? chave : item;
      });
      await AsyncStorage.setItem(CHAVES_CACHE_KEY, JSON.stringify(atualizadas));
    });
  },

  async salvarHistoricoCache(codigo: string, historico: unknown[]): Promise<void> {
    await serializarEscrita(async () => {
      const data = await AsyncStorage.getItem(HISTORICO_CACHE_KEY);
      let cache: Record<string, unknown[]> = {};
      try {
        cache = data ? (JSON.parse(data) as Record<string, unknown[]>) : {};
      } catch {
        cache = {};
      }
      cache[codigo] = historico;
      await AsyncStorage.setItem(HISTORICO_CACHE_KEY, JSON.stringify(cache));
    });
  },

  async buscarHistoricoCache(codigo: string): Promise<unknown[] | null> {
    const data = await AsyncStorage.getItem(HISTORICO_CACHE_KEY);
    if (!data) return null;
    try {
      const cache = JSON.parse(data) as Record<string, unknown[]>;
      return Array.isArray(cache[codigo]) ? cache[codigo] : null;
    } catch {
      return null;
    }
  },

  async adicionarMovimentacaoPendente(
    movimentacao: Omit<MovimentacaoPending, "id"> & { id?: string },
  ): Promise<MovimentacaoPending> {
    const pendencia: MovimentacaoPending = {
      ...movimentacao,
      id: idMovimentacaoValido(movimentacao.id) ? movimentacao.id : criarUuid(),
    };
    await serializarEscrita(async () => {
      const pendentes = await this.buscarMovimentacoesPendentes();
      pendentes.push(pendencia);
      await AsyncStorage.setItem(MOVIMENTACOES_PENDING_KEY, JSON.stringify(pendentes));
    });
    return pendencia;
  },

  async buscarMovimentacoesPendentes(): Promise<MovimentacaoPending[]> {
    const data = await AsyncStorage.getItem(MOVIMENTACOES_PENDING_KEY);
    if (!data) return [];
    try {
      const parsed: unknown = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item) => normalizarPendencia(item as Partial<MovimentacaoPending>))
        .filter((item): item is MovimentacaoPending => item !== null);
    } catch {
      return [];
    }
  },

  async removerMovimentacoesPendentes(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await serializarEscrita(async () => {
      const pendentes = await this.buscarMovimentacoesPendentes();
      const idsRemovidos = new Set(ids);
      const restantes = pendentes.filter((item) => !idsRemovidos.has(item.id));
      await AsyncStorage.setItem(MOVIMENTACOES_PENDING_KEY, JSON.stringify(restantes));
    });
  },

  async marcarMovimentacaoComErro(id: string, error: string): Promise<void> {
    await serializarEscrita(async () => {
      const pendentes = await this.buscarMovimentacoesPendentes();
      const atualizados = pendentes.map(item => 
        item.id === id ? { ...item, error } : item
      );
      await AsyncStorage.setItem(MOVIMENTACOES_PENDING_KEY, JSON.stringify(atualizados));
    });
  },

  async agendarNovaTentativa(id: string): Promise<void> {
    await serializarEscrita(async () => {
      const pendentes = await this.buscarMovimentacoesPendentes();
      const atualizados = pendentes.map((item) => {
        if (item.id !== id) return item;
        const tentativas = (item.tentativas ?? 0) + 1;
        const atraso = Math.min(5 * 60_000, 2 ** Math.min(tentativas, 8) * 1_000);
        return { ...item, tentativas, proximaTentativaEm: new Date(Date.now() + atraso).toISOString() };
      });
      await AsyncStorage.setItem(MOVIMENTACOES_PENDING_KEY, JSON.stringify(atualizados));
    });
  },

  async liberarMovimentacaoParaRetry(id: string): Promise<void> {
    await serializarEscrita(async () => {
      const pendentes = await this.buscarMovimentacoesPendentes();
      const atualizados = pendentes.map((item) => item.id === id
        ? { ...item, error: undefined, proximaTentativaEm: undefined }
        : item);
      await AsyncStorage.setItem(MOVIMENTACOES_PENDING_KEY, JSON.stringify(atualizados));
    });
  },

  async limparCache(): Promise<void> {
    await AsyncStorage.multiRemove([CHAVES_CACHE_KEY, HISTORICO_CACHE_KEY, MOVIMENTACOES_PENDING_KEY]);
  },
};
