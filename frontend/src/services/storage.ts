import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';

const CHAVES_CACHE_KEY = '@coretech:chaves_cache';
const MOVIMENTACOES_PENDING_KEY = '@coretech:movimentacoes_pending';

export type MovimentacaoPending = {
  chaveCodigo: string;
  tipo: 'retirada' | 'devolucao';
  payload: {
    responsavel: { nome: string; matricula: string };
    timestampLocal: string;
    deviceId: string;
  };
};

export const storage = {
  async getNetworkStatus(): Promise<{ isConnected: boolean; isOffline: boolean }> {
    const networkState = await Network.getNetworkStateAsync();
    const isConnected = networkState.isConnected ?? false;
    return { isConnected, isOffline: !isConnected };
  },

  async salvarChavesCache(chaves: unknown[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CHAVES_CACHE_KEY, JSON.stringify(chaves));
    } catch (error) {
      console.error('Erro ao salvar cache de chaves:', error);
    }
  },

  async buscarChavesCache(): Promise<unknown[] | null> {
    try {
      const data = await AsyncStorage.getItem(CHAVES_CACHE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao buscar cache de chaves:', error);
      return null;
    }
  },

  async adicionarMovimentacaoPendente(movimentacao: MovimentacaoPending): Promise<void> {
    try {
      const pendentes = await this.buscarMovimentacoesPendentes();
      pendentes.push(movimentacao);
      await AsyncStorage.setItem(MOVIMENTACOES_PENDING_KEY, JSON.stringify(pendentes));
    } catch (error) {
      console.error('Erro ao adicionar movimentação pendente:', error);
    }
  },

  async buscarMovimentacoesPendentes(): Promise<MovimentacaoPending[]> {
    try {
      const data = await AsyncStorage.getItem(MOVIMENTACOES_PENDING_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao buscar movimentações pendentes:', error);
      return [];
    }
  },

  async limparMovimentacoesPendentes(): Promise<void> {
    try {
      await AsyncStorage.removeItem(MOVIMENTACOES_PENDING_KEY);
    } catch (error) {
      console.error('Erro ao limpar movimentações pendentes:', error);
    }
  },

  async limparCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([CHAVES_CACHE_KEY, MOVIMENTACOES_PENDING_KEY]);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  },
};
