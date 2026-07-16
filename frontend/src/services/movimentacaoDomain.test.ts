import { describe, expect, it } from "vitest";
import { aplicarMovimentacao, criarOperacaoId } from "./movimentacaoDomain";

const payload = { responsavel: { nome: "Ana", matricula: "123" }, timestampLocal: "2026-07-16T12:00:00.000Z", deviceId: "device-1" };

describe("movimentações", () => {
  it("retira e devolve preservando o contrato da chave", () => {
    const retirada = aplicarMovimentacao({ codigo: "A1", status: "disponivel", responsavelAtual: null, ultimaMovimentacaoEm: null }, "retirada", payload);
    expect(retirada.status).toBe("em_uso");
    expect(aplicarMovimentacao(retirada, "devolucao", payload).status).toBe("disponivel");
  });

  it("rejeita transições conflitantes", () => {
    expect(() => aplicarMovimentacao({ codigo: "A1", status: "em_uso", responsavelAtual: payload.responsavel, ultimaMovimentacaoEm: null }, "retirada", payload)).toThrow("já está em uso");
  });

  it("gera id idempotente e estável", () => {
    expect(criarOperacaoId("d1", payload.timestampLocal, "retirada", "A1")).toBe(criarOperacaoId("d1", payload.timestampLocal, "retirada", "A1"));
  });
});
