import { describe, it, expect, beforeEach } from "vitest";
import { ChavesService } from "../../src/features/chaves/chaves.service";
import { CheckoutStrategy } from "../../src/features/chaves/strategies/checkout.strategy";
import { ReturnStrategy } from "../../src/features/chaves/strategies/return.strategy";
import type { Chave, IKeyRepository, IMovimentacaoRepository } from "../../src/core/interfaces";
import { StatusChave } from "../../src/core/types";

describe("ChavesService — Contratos de Negócio", () => {
  let mockKeyRepo: IKeyRepository;
  let mockMovRepo: IMovimentacaoRepository;
  let chavesService: ChavesService;

  const chaveDisponivel: Chave = {
    codigo: "A/S9",
    status: "disponivel",
    responsavelAtual: null,
    ultimaMovimentacaoEm: null,
  };

  const chaveEmUso: Chave = {
    codigo: "A/S9",
    status: "em_uso",
    responsavelAtual: {
      nome: "Ana Rosa",
      matricula: "2024010456",
    },
    ultimaMovimentacaoEm: "2026-06-16T10:00:00.000Z",
  };

  beforeEach(() => {
    mockKeyRepo = {
      buscarPorCodigo: async () => null,
      listarTodas: async () => [],
      atualizarStatus: async (_codigo: string, status: StatusChave, _responsavelAtual: Chave["responsavelAtual"]) => {
        const base = chaveDisponivel;
        return {
          ...base,
          status,
          responsavelAtual: _responsavelAtual,
          ultimaMovimentacaoEm: new Date().toISOString(),
        };
      },
      registrarMovimentacao: async (m) => m,
    } as IKeyRepository;

    mockMovRepo = {
      buscarPorChave: async () => [],
    } as IMovimentacaoRepository;

    const checkoutStrategy = new CheckoutStrategy(mockKeyRepo);
    const returnStrategy = new ReturnStrategy(mockKeyRepo);

    chavesService = new ChavesService(
      mockKeyRepo,
      mockMovRepo,
      checkoutStrategy,
      returnStrategy
    );
  });

  describe("RN01 — bloqueio de retirada de chave ja em uso", () => {
    it("bloqueia a segunda retirada com 409 CHAVE_JA_EM_USO", async () => {
      mockKeyRepo.buscarPorCodigo = async () => chaveEmUso;

      const payload = {
        responsavel: { nome: "Carlos", matricula: "2024000001" },
        timestampLocal: new Date().toISOString(),
        deviceId: "device-001",
      };

      await expect(chavesService.retirarChave("A/S9", payload)).rejects.toMatchObject({
        status: 409,
        codigo: "CHAVE_JA_EM_USO",
      });
    });
  });

  describe("RN02 — retirada deve estar vinculada a nome e matricula", () => {
    it("aceita retirada quando nome e matricula estao presentes", async () => {
      mockKeyRepo.buscarPorCodigo = async () => chaveDisponivel;

      const payload = {
        responsavel: { nome: "Carlos", matricula: "2024000001" },
        timestampLocal: new Date().toISOString(),
        deviceId: "device-001",
      };

      const resultado = await chavesService.retirarChave("A/S9", payload);
      expect(resultado.chave.status).toBe("em_uso");
      expect(resultado.movimentacao.responsavel.nome).toBe("Carlos");
    });
  });

  describe("RN05 — bloqueio de devolucao de chave ja disponivel", () => {
    it("bloqueia a devolucao com 409 CHAVE_JA_DISPONIVEL", async () => {
      mockKeyRepo.buscarPorCodigo = async () => chaveDisponivel;

      const payload = {
        responsavel: { nome: "Carlos", matricula: "2024000001" },
        timestampLocal: new Date().toISOString(),
        deviceId: "device-001",
      };

      await expect(chavesService.devolverChave("A/S9", payload)).rejects.toMatchObject({
        status: 409,
        codigo: "CHAVE_JA_DISPONIVEL",
      });
    });
  });

  describe("RN03 — devolucao atualiza status para disponivel", () => {
    it("atualiza status para disponivel apos devolucao valida", async () => {
      mockKeyRepo.buscarPorCodigo = async () => chaveEmUso;

      const payload = {
        responsavel: { nome: "Carlos", matricula: "2024000001" },
        timestampLocal: new Date().toISOString(),
        deviceId: "device-001",
      };

      const resultado = await chavesService.devolverChave("A/S9", payload);
      expect(resultado.chave.status).toBe("disponivel");
      expect(resultado.movimentacao.tipo).toBe("devolucao");
    });
  });

  describe("RN06 — horario registrado e o do dispositivo", () => {
    it("registra timestampLocal no formato ISO", async () => {
      mockKeyRepo.buscarPorCodigo = async () => chaveDisponivel;

      const agora = new Date().toISOString();
      const payload = {
        responsavel: { nome: "Carlos", matricula: "2024000001" },
        timestampLocal: agora,
        deviceId: "device-001",
      };

      const resultado = await chavesService.retirarChave("A/S9", payload);
      expect(resultado.movimentacao.timestampLocal).toBe(agora);
    });
  });
});
