import { describe, it, expect, beforeEach } from "vitest";
import { SyncService } from "../../src/features/sync/sync.service";
import type { ISyncRepository } from "../../src/core/interfaces";
import type { ItemResultadoSync, Movimentacao } from "../../src/core/types";

/// <reference types="vitest/globals" />

describe("SyncService — Contratos de Negocio (RN07)", () => {
  let mockSyncRepo: ISyncRepository;
  let syncService: SyncService;

  const baseRegistro = (params: Partial<Movimentacao> = {}): Movimentacao => ({
    id: "123e4567-e89b-12d3-a456-426614174000",
    chaveCodigo: "A/S9",
    tipo: "retirada",
    responsavel: { nome: "Carlos", matricula: "2024000001" },
    timestampLocal: "2026-06-16T10:00:00.000Z",
    deviceId: "device-001",
    syncStatus: "pendente",
    ...params,
  });

  beforeEach(() => {
    mockSyncRepo = {
      buscarPendentesPorChave: async () => [],
      marcarComoSincronizado: async () => {},
      marcarComoErro: async () => {},
    } as ISyncRepository;

    syncService = new SyncService(mockSyncRepo);
  });

  it("aplica LWW: o registro com timestamp mais recente vence (RN07)", async () => {
    const guarda1 = baseRegistro({
      id: "11111111-1111-1111-1111-111111111111",
      timestampLocal: "2026-06-16T10:00:00.000Z",
      deviceId: "device-guarda-1",
      responsavel: { nome: "Guarda 1", matricula: "2024000001" },
    });

    const guarda2 = baseRegistro({
      id: "22222222-2222-2222-2222-222222222222",
      timestampLocal: "2026-06-16T10:05:00.000Z",
      deviceId: "device-guarda-2",
      responsavel: { nome: "Guarda 2", matricula: "2024000002" },
    });

    mockSyncRepo.buscarPendentesPorChave = async () => [guarda1];

    const resultado = await syncService.sincronizar("device-central", [guarda2]);

    const sincronizado = resultado.resultados.find((r: ItemResultadoSync) => r.id === guarda2.id);

    expect(sincronizado).toBeDefined();
    expect(sincronizado!.status).toBe("sincronizado");
  });

  it("retorna per-item resultados, nunca sucesso generico de lote", async () => {
    const r1 = baseRegistro({
      id: "11111111-1111-1111-1111-111111111111",
      chaveCodigo: "A/S9",
    });

    const r2 = baseRegistro({
      id: "22222222-2222-2222-2222-222222222222",
      chaveCodigo: "L/B2",
    });

    const resultado = await syncService.sincronizar("device-central", [r1, r2]);

    expect(resultado.resultados).toHaveLength(2);
    expect(resultado.processadosEm).toBeDefined();
    expect(new Date(resultado.processadosEm).getTime()).not.toBeNaN();
  });

  it("rejeita lote vazio com 400", async () => {
    const resultado = await syncService.sincronizar("device-central", []);

    expect(resultado.resultados).toHaveLength(0);
  });
});
