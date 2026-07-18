import type { Chave, MovimentacaoPayload } from "./api";

export type TipoMovimentacao = "retirada" | "devolucao";

export function aplicarMovimentacao(chave: Chave, tipo: TipoMovimentacao, payload: MovimentacaoPayload): Chave {
  if (tipo === "retirada" && chave.status !== "disponivel") {
    throw Object.assign(new Error("Esta chave já está em uso."), { status: 409, codigo: "CHAVE_INDISPONIVEL" });
  }
  if (tipo === "devolucao" && chave.status !== "em_uso") {
    throw Object.assign(new Error("Esta chave já está disponível."), { status: 409, codigo: "CHAVE_JA_DISPONIVEL" });
  }
  return {
    ...chave,
    status: tipo === "retirada" ? "em_uso" : "disponivel",
    responsavelAtual: tipo === "retirada" ? payload.responsavel : null,
    alunoAtual: tipo === "retirada" ? payload.aluno ?? null : null,
    ultimaMovimentacaoEm: payload.timestampLocal,
  };
}

export function criarOperacaoId(deviceId: string, timestampLocal: string, tipo: TipoMovimentacao, codigo: string): string {
  const base = `${deviceId}-${timestampLocal}-${tipo}-${codigo}`;
  let hash = 0;
  for (let index = 0; index < base.length; index += 1) hash = Math.imul(31, hash) + base.charCodeAt(index) | 0;
  return `op-${Math.abs(hash)}-${timestampLocal.replace(/\D/g, "")}`;
}
