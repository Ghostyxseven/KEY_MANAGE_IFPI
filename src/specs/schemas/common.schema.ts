import { z } from "zod";

export const GuardaSchema = z.object({
  nome: z.string().min(1, "nome é obrigatório"),
  matricula: z.string().min(1, "matrícula é obrigatória"),
});
export type Guarda = z.infer<typeof GuardaSchema>;

export const CodigoChaveSchema = z
  .string()
  .regex(/^[A-Za-z]+\/[A-Za-z0-9]+$/, "código deve seguir o padrão Bloco/Sala, ex: A/S9");
export type CodigoChave = z.infer<typeof CodigoChaveSchema>;

export const StatusChaveSchema = z.enum(["disponivel", "em_uso"]);
export type StatusChave = z.infer<typeof StatusChaveSchema>;

export const TipoMovimentacaoSchema = z.enum(["retirada", "devolucao"]);
export type TipoMovimentacao = z.infer<typeof TipoMovimentacaoSchema>;

export const SyncStatusSchema = z.enum(["pendente", "sincronizado", "erro"]);
export type SyncStatus = z.infer<typeof SyncStatusSchema>;
