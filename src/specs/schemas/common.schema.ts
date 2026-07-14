/**
 * specs/schemas/common.schema.ts
 *
 * Contratos de dados compartilhados (Zod) — fonte da verdade para
 * validação em runtime no backend. Espelha 1:1 os schemas do
 * openapi.yaml (components.schemas). Qualquer alteração aqui exige
 * PR revisado por par (ADR-0001) e atualização do OpenAPI correspondente.
 *
 * Rastreabilidade: RF01, RN02, RN04, RN06.
 */
import { z } from "zod";

/** Responsável identificado por nome + matrícula (RF01, RN02). */
export const GuardaSchema = z.object({
  nome: z
    .string()
    .min(3, "nome deve ter ao menos 3 caracteres")
    .describe("Nome completo do responsável"),
  matricula: z
    .string()
    .regex(/^[A-Za-z0-9]+$/, "matrícula deve ser alfanumérica")
    .describe("Matrícula institucional do responsável"),
});
export type Guarda = z.infer<typeof GuardaSchema>;

/** Padrão de código de chave já utilizado no campus, ex. "A/S9" (RN04). */
export const CodigoChaveSchema = z
  .string()
  .regex(/^[A-Za-z]+\/[A-Za-z0-9]+$/, "código deve seguir o padrão Bloco/Sala, ex: A/S9");

/** verde = disponivel · vermelho = em_uso (RF03). */
export const StatusChaveSchema = z.enum(["disponivel", "em_uso"]);
export type StatusChave = z.infer<typeof StatusChaveSchema>;

export const TipoMovimentacaoSchema = z.enum(["retirada", "devolucao"]);
export type TipoMovimentacao = z.infer<typeof TipoMovimentacaoSchema>;

export const SyncStatusSchema = z.enum(["pendente", "sincronizado", "erro"]);
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

export const ErroPadraoSchema = z.object({
  codigo: z.string(),
  mensagem: z.string(),
});
export type ErroPadrao = z.infer<typeof ErroPadraoSchema>;

export const ErroConflitoSchema = ErroPadraoSchema.extend({
  responsavelAtual: GuardaSchema.nullable().optional(),
});
export type ErroConflito = z.infer<typeof ErroConflitoSchema>;