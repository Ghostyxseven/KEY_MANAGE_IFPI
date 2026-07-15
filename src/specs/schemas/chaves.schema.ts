import { z } from "zod";
import {
  CodigoChaveSchema,
  GuardaSchema,
  StatusChaveSchema,
  SyncStatusSchema,
  TipoMovimentacaoSchema,
} from "./common.schema";

export { CodigoChaveSchema };
export type { CodigoChave } from "./common.schema";

export const ChaveSchema = z.object({
  codigo: CodigoChaveSchema,
  status: StatusChaveSchema,
  responsavelAtual: GuardaSchema.nullable(),
  ultimaMovimentacaoEm: z.string().optional(),
});
export type Chave = z.infer<typeof ChaveSchema>;

export const RegistroMovimentacaoRequestSchema = z.object({
  responsavel: GuardaSchema,
  timestampLocal: z.string(),
  deviceId: z.string().min(1, "deviceId é obrigatório (idempotência, FE-04)"),
});
export type RegistroMovimentacaoRequest = z.infer<
  typeof RegistroMovimentacaoRequestSchema
>;

export const MovimentacaoSchema = z.object({
  id: z.string(),
  chaveCodigo: CodigoChaveSchema,
  tipo: TipoMovimentacaoSchema,
  responsavel: GuardaSchema,
  timestampLocal: z.string(),
  deviceId: z.string(),
  syncStatus: SyncStatusSchema,
});
export type Movimentacao = z.infer<typeof MovimentacaoSchema>;
