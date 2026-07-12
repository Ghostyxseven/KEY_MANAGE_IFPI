/**
 * specs/schemas/identificacao.schema.ts
 *
 * Contrato da rota POST /identificacao.
 * Rastreabilidade: RF01, RN02, UC01, US-01, US-02.
 */
import { z } from "zod";
import { GuardaSchema } from "./common.schema";

export const IdentificacaoRequestSchema = GuardaSchema;
export type IdentificacaoRequest = z.infer<typeof IdentificacaoRequestSchema>;

export const IdentificacaoResponseSchema = z.object({
  identificado: z.boolean(),
  sessao: z.object({
    nome: z.string(),
    matricula: z.string(),
    iniciadaEm: z.string().datetime(),
  }),
});
export type IdentificacaoResponse = z.infer<typeof IdentificacaoResponseSchema>;