import type { Chave, RegistroMovimentacao, ErroConflito, Movimentacao, IKeyRepository } from "../../../core/interfaces/index.js";
import { v4 as uuidv4 } from "uuid";

export class ReturnStrategy {
  constructor(private readonly repositorio: IKeyRepository) {}

  async executar(
    chave: Chave,
    payload: RegistroMovimentacao
  ): Promise<
    | { sucesso: true; chave: Chave; movimentacao: Movimentacao }
    | { sucesso: false; erro: ErroConflito }
  > {
    if (chave.status === "disponivel") {
      return {
        sucesso: false,
        erro: {
          codigo: "CHAVE_JA_DISPONIVEL",
          mensagem: `A chave ${chave.codigo} ja esta disponivel; nao ha devolucao pendente para registrar.`,
          responsavelAtual: null,
        },
      };
    }

    const chaveAtualizada: Chave = await this.repositorio.atualizarStatus(
      chave.codigo,
      "disponivel",
      null
    );

    const movimentacao: Movimentacao = {
      id: uuidv4(),
      chaveCodigo: chave.codigo,
      tipo: "devolucao",
      responsavel: payload.responsavel,
      timestampLocal: payload.timestampLocal,
      deviceId: payload.deviceId,
      syncStatus: "pendente",
    };

    const movimentacaoRegistrada: Movimentacao =
      await this.repositorio.registrarMovimentacao(movimentacao);

    return {
      sucesso: true,
      chave: chaveAtualizada,
      movimentacao: movimentacaoRegistrada,
    };
  }
}
