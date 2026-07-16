import type { Chave, RegistroMovimentacao, ErroConflito, Movimentacao } from "../types/index.js";

export type { Chave, RegistroMovimentacao, ErroConflito, Movimentacao, ItemResultadoSync, ResultadoSync } from "../types/index.js";

export type IKeyOperationStrategy = {
  executar(
    chave: Chave,
    payload: RegistroMovimentacao
  ): Promise<
    | { sucesso: true; chave: Chave; movimentacao: Movimentacao }
    | { sucesso: false; erro: ErroConflito }
  >;
};

export type IKeyRepository = {
  buscarPorCodigo(codigo: string): Promise<Chave | null>;
  listarTodas(): Promise<Chave[]>;
  atualizarStatus(
    codigo: string,
    status: Chave["status"],
    responsavelAtual: Chave["responsavelAtual"]
  ): Promise<Chave>;
  registrarMovimentacao(movimentacao: Movimentacao): Promise<Movimentacao>;
};

export type IMovimentacaoRepository = {
  buscarPorChave(chaveCodigo: string): Promise<Movimentacao[]>;
};

export type ISyncRepository = {
  buscarPendentesPorChave(chaveCodigo: string): Promise<Movimentacao[]>;
  marcarComoSincronizado(id: string): Promise<void>;
  marcarComoErro(
    id: string,
    erro: { codigo: string; mensagem: string }
  ): Promise<void>;
};

export type IChavesService = {
  listarChaves(): Promise<Chave[]>;
  buscarChave(codigo: string): Promise<Chave | null>;
  buscarHistorico(chaveCodigo: string): Promise<Movimentacao[]>;
  retirarChave(
    codigo: string,
    payload: RegistroMovimentacao
  ): Promise<{ chave: Chave; movimentacao: Movimentacao }>;
  devolverChave(
    codigo: string,
    payload: RegistroMovimentacao
  ): Promise<{ chave: Chave; movimentacao: Movimentacao }>;
};

export type ISyncService = {
  sincronizar(
    deviceId: string,
    registros: Movimentacao[]
  ): Promise<{ processadosEm: string; resultados: import("../types/index.js").ItemResultadoSync[] }>;
};

export type ISyncObserver = {
  atualizar(movimentacao: Movimentacao): void | Promise<void>;
};
