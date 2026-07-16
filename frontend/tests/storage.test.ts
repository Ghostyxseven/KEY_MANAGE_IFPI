import { beforeEach, describe, expect, it, vi } from "vitest";

const dados = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", (): object => ({
  default: {
    getItem: async (chave: string): Promise<string | null> => dados.get(chave) ?? null,
    setItem: async (chave: string, valor: string): Promise<void> => {
      dados.set(chave, valor);
    },
    removeItem: async (chave: string): Promise<void> => {
      dados.delete(chave);
    },
    multiRemove: async (chaves: string[]): Promise<void> => {
      chaves.forEach((chave): void => {
        dados.delete(chave);
      });
    },
  },
}));

vi.mock("expo-network", (): object => ({
  getNetworkStateAsync: async (): Promise<object> => ({
    isConnected: true,
    isInternetReachable: true,
  }),
}));

import { storage } from "../src/services/storage";

describe("storage offline", (): void => {
  beforeEach((): void => {
    dados.clear();
  });

  it("mantém um deviceId estável", async (): Promise<void> => {
    const primeiro = await storage.getDeviceId();
    const segundo = await storage.getDeviceId();
    expect(segundo).toBe(primeiro);
  });

  it("gera UUID e remove somente movimentações confirmadas", async (): Promise<void> => {
    const payload = {
      responsavel: { nome: "Guarda Teste", matricula: "123" },
      timestampLocal: new Date().toISOString(),
      deviceId: await storage.getDeviceId(),
    };
    const primeira = await storage.adicionarMovimentacaoPendente({ chaveCodigo: "A/S1", tipo: "retirada", payload });
    const segunda = await storage.adicionarMovimentacaoPendente({ chaveCodigo: "A/S2", tipo: "retirada", payload });

    expect(primeira.id).toMatch(/^[0-9a-f-]{36}$/i);
    await storage.removerMovimentacoesPendentes([primeira.id]);
    const restantes = await storage.buscarMovimentacoesPendentes();
    expect(restantes.map((item) => item.id)).toEqual([segunda.id]);
  });
});
