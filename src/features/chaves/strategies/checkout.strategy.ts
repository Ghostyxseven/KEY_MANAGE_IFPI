import type { Chave, RegistroMovimentacao, ErroConflito, Movimentacao, IKeyRepository } from "src/core/interfaces";
import { v4 as uuidv4 } from "uuid";

export class CheckoutStrategy {
  constructor(private readonly repositorio: IKeyRepository) {}

  async executar(
    chave: Chave,
    payload: RegistroMovimentacao
  ): Promise<
    | { sucesso: true; chave: Chave; movimentacao: Movimentacao }
    | { sucesso: false; erro: ErroConflito }
  > {
    if (chave.status === "em_uso") {
      return {
        sucesso: false,
        erro: {
          codigo: "CHAVE_JA_EM_USO",
          mensagem: `A chave ${chave.codigo} ja esta em uso e nao pode ser retirada novamente.`,
          responsavelAtual: chave.responsavelAtual,
        },
      };
    }

    const chaveAtualizada: Chave = await this.repositorio.atualizarStatus(
      chave.codigo,
      "em_uso",
      payload.responsavel
    );

    const movimentacao: Movimentacao = {
      id: uuidv4(),
      chaveCodigo: chave.codigo,
      tipo: "retirada",
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
