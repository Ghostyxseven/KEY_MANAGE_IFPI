export type Guarda = {
  nome: string;
  matricula: string;
};

export type StatusChave = "disponivel" | "em_uso";

export type TipoMovimentacao = "retirada" | "devolucao";

export type SyncStatus = "pendente" | "sincronizado" | "erro";

export type Chave = {
  codigo: string;
  status: StatusChave;
  responsavelAtual: Guarda | null;
  ultimaMovimentacaoEm: string | null;
};

export type RegistroMovimentacao = {
  responsavel: Guarda;
  timestampLocal: string;
  deviceId: string;
};

export type Movimentacao = {
  id: string;
  chaveCodigo: string;
  tipo: TipoMovimentacao;
  responsavel: Guarda;
  timestampLocal: string;
  deviceId: string;
  syncStatus: SyncStatus;
};

export type ErroPadrao = {
  codigo: string;
  mensagem: string;
};

export type ErroConflito = ErroPadrao & {
  responsavelAtual: Guarda | null;
};

export type ConflitoSync = {
  motivo: string;
  timestampVencedor: string;
};

export type ItemResultadoSync = {
  id: string;
  status: "sincronizado" | "conflito" | "erro";
  conflito: ConflitoSync | null;
  erro: ErroPadrao | null;
};

export type ResultadoSync = {
  processadosEm: string;
  resultados: ItemResultadoSync[];
};
