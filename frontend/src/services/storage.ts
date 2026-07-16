import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';

/** Chave usada para armazenar o cache das chaves no AsyncStorage */
const CHAVES_CACHE_KEY = '@coretech:chaves_cache';
/** Chave usada para armazenar movimentações pendentes de sincronização */
const MOVIMENTACOES_PENDING_KEY = '@coretech:movimentacoes_pending';

/**
 * Tipo que representa uma movimentação pendente de sincronização.
 * Usada quando o aplicativo está offline e precisa salvar operações para depois.
 */
export type MovimentacaoPending = {
  /** Código identificador da chave */
  chaveCodigo: string;
  /** Tipo da operação: retirada ou devolução */
  tipo: 'retirada' | 'devolucao';
  /** Dados da movimentação a serem enviados ao servidor */
  payload: {
    /** Nome e matrícula do responsável pela operação */
    responsavel: { nome: string; matricula: string };
    /** Data/hora local da operação em formato ISO */
    timestampLocal: string;
    /** Identificador único do dispositivo que realizou a operação */
    deviceId: string;
  };
};

/**
 * Serviço de armazenamento local e gerenciamento de conexão de rede.
 * Responsável por cachear dados e gerenciar operações offline.
 */
export const storage = {
  /**
   * Verifica o status atual da conexão de rede.
   * @returns Objeto com status de conexão (isConnected) e modo offline (isOffline)
   */
  async getNetworkStatus(): Promise<{ isConnected: boolean; isOffline: boolean }> {
    const networkState = await Network.getNetworkStateAsync();
    const isConnected = networkState.isConnected ?? false;
    return { isConnected, isOffline: !isConnected };
  },

  /**
   * Salva a lista de chaves no cache local.
   * @param chaves - Array de objetos de chaves a serem cacheados
   */
  async salvarChavesCache(chaves: unknown[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CHAVES_CACHE_KEY, JSON.stringify(chaves));
    } catch (error) {
      console.error('Erro ao salvar cache de chaves:', error);
    }
  },

  /**
   * Recupera a lista de chaves armazenada em cache.
   * @returns Array de chaves cacheadas ou null se não existir cache
   */
  async buscarChavesCache(): Promise<unknown[] | null> {
    try {
      const data = await AsyncStorage.getItem(CHAVES_CACHE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao buscar cache de chaves:', error);
      return null;
    }
  },

  /**
   * Adiciona uma movimentação à fila de pendências para sincronização futura.
   * @param movimentacao - Objeto da movimentação pendente
   */
  async adicionarMovimentacaoPendente(movimentacao: MovimentacaoPending): Promise<void> {
    try {
      const pendentes = await this.buscarMovimentacoesPendentes();
      pendentes.push(movimentacao);
      await AsyncStorage.setItem(MOVIMENTACOES_PENDING_KEY, JSON.stringify(pendentes));
    } catch (error) {
      console.error('Erro ao adicionar movimentação pendente:', error);
    }
  },

  /**
   * Recupera todas as movimentações pendentes de sincronização.
   * @returns Array de movimentações pendentes
   */
  async buscarMovimentacoesPendentes(): Promise<MovimentacaoPending[]> {
    try {
      const data = await AsyncStorage.getItem(MOVIMENTACOES_PENDING_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao buscar movimentações pendentes:', error);
      return [];
    }
  },

  /**
   * Limpa todas as movimentações pendentes após sincronização bem-sucedida.
   */
  async limparMovimentacoesPendentes(): Promise<void> {
    try {
      await AsyncStorage.removeItem(MOVIMENTACOES_PENDING_KEY);
    } catch (error) {
      console.error('Erro ao limpar movimentações pendentes:', error);
    }
  },

  /**
   * Limpa todo o cache armazenado localmente (chaves e pendências).
   */
  async limparCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([CHAVES_CACHE_KEY, MOVIMENTACOES_PENDING_KEY]);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  },
};
