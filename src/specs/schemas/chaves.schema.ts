/**
 * specs/schemas/chaves.schema.ts
 *
 * Contrato das rotas GET /chaves, GET /chaves/{codigo},
 * POST /chaves/{codigo}/retirada e POST /chaves/{codigo}/devolucao.
 *
 * Rastreabilidade: RF02, RF03, RF04, RF05, RF06, RF09,
 * RN01, RN03, RN04, RN05, RN06, UC02, UC03.
 *
 * Estes schemas são o contrato de entrada consumido pelas estratégias
 * CheckoutStrategy / ReturnStrategy definidas na ADR-0009 — a validação
 * de forma (Zod) acontece ANTES da validação de regra de negócio
 * (RN01/RN05), que permanece responsabilidade das strategies, não deste
 * arquivo.
 */
import { z } from "zod";
import {
  CodigoChaveSchema,
  GuardaSchema,
  StatusChaveSchema,
  SyncStatusSchema,
  TipoMovimentacaoSchema,
} from "./common.schema";

export const ChaveSchema = z.object({
  codigo: CodigoChaveSchema,
  status: StatusChaveSchema,
  responsavelAtual: GuardaSchema.nullable(),
  ultimaMovimentacaoEm: z.string().datetime().nullable(),
});
export type Chave = z.infer<typeof ChaveSchema>;

/** Body aceito tanto por /retirada quanto por /devolucao (RN02, RN06). */
export const RegistroMovimentacaoRequestSchema = z.object({
  responsavel: GuardaSchema,
  timestampLocal: z.string().datetime(),
  deviceId: z.string().min(1, "deviceId é obrigatório (idempotência, FE-04)"),
});
export type RegistroMovimentacaoRequest = z.infer<
  typeof RegistroMovimentacaoRequestSchema
>;

export const MovimentacaoSchema = z.object({
  id: z.string().uuid(),
  chaveCodigo: CodigoChaveSchema,
  tipo: TipoMovimentacaoSchema,
  responsavel: GuardaSchema,
  timestampLocal: z.string().datetime(),
  deviceId: z.string(),
  syncStatus: SyncStatusSchema,
});
export type Movimentacao = z.infer<typeof MovimentacaoSchema>;