import type {
  Chave,
  RegistroMovimentacao,
  Movimentacao,
  IKeyRepository,
  IMovimentacaoRepository,
  IKeyOperationStrategy,
} from "src/core/interfaces";

export class ChavesService {
  constructor(
    private readonly keyRepository: IKeyRepository,
    private readonly movimentacaoRepository: IMovimentacaoRepository,
    private readonly checkoutStrategy: IKeyOperationStrategy,
    private readonly returnStrategy: IKeyOperationStrategy
  ) {}

  async listarChaves(): Promise<Chave[]> {
    return this.keyRepository.listarTodas();
  }

  async buscarChave(codigo: string): Promise<Chave | null> {
    return this.keyRepository.buscarPorCodigo(codigo);
  }

  async buscarHistorico(chaveCodigo: string): Promise<Movimentacao[]> {
    return this.movimentacaoRepository.buscarPorChave(chaveCodigo);
  }

  async retirarChave(
    codigo: string,
    payload: RegistroMovimentacao
  ): Promise<{ chave: Chave; movimentacao: Movimentacao }> {
    const chave: Chave | null = await this.keyRepository.buscarPorCodigo(codigo);

    if (!chave) {
      throw {
        status: 404 as const,
        codigo: "CHAVE_NAO_ENCONTRADA",
        mensagem: `Chave ${codigo} nao cadastrada no padrao do campus (RN04).`,
      };
    }

    const resultado = await this.checkoutStrategy.executar(chave, payload);

    if (!resultado.sucesso) {
      const erro: { codigo: string; mensagem: string; responsavelAtual: Chave["responsavelAtual"] } = resultado.erro;
      throw {
        status: 409 as const,
        codigo: erro.codigo,
        mensagem: erro.mensagem,
        responsavelAtual: erro.responsavelAtual,
      };
    }

    return { chave: resultado.chave, movimentacao: resultado.movimentacao };
  }

  async devolverChave(
    codigo: string,
    payload: RegistroMovimentacao
  ): Promise<{ chave: Chave; movimentacao: Movimentacao }> {
    const chave: Chave | null = await this.keyRepository.buscarPorCodigo(codigo);

    if (!chave) {
      throw {
        status: 404 as const,
        codigo: "CHAVE_NAO_ENCONTRADA",
        mensagem: `Chave ${codigo} nao cadastrada no padrao do campus (RN04).`,
      };
    }

    const resultado = await this.returnStrategy.executar(chave, payload);

    if (!resultado.sucesso) {
      const erro: { codigo: string; mensagem: string; responsavelAtual: Chave["responsavelAtual"] } = resultado.erro;
      throw {
        status: 409 as const,
        codigo: erro.codigo,
        mensagem: erro.mensagem,
        responsavelAtual: erro.responsavelAtual,
      };
    }

    return { chave: resultado.chave, movimentacao: resultado.movimentacao };
  }
}
