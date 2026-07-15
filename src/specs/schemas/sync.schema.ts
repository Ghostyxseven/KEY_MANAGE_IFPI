import { z } from "zod";
import { MovimentacaoSchema } from "./chaves.schema";

export const SyncRequestSchema = z.object({
  deviceId: z.string().min(1, "deviceId é obrigatório"),
  registros: z.array(MovimentacaoSchema).min(1, "registros não pode ser vazio"),
});
export type SyncRequest = z.infer<typeof SyncRequestSchema>;

export const SyncItemResultSchema = z.object({
  id: z.string(),
  status: z.enum(["sincronizado", "conflito", "erro"]),
  conflito: z
    .object({
      motivo: z.string(),
      timestampVencedor: z.string(),
    })
    .nullable()
    .optional(),
  erro: z
    .object({
      codigo: z.string(),
      mensagem: z.string(),
    })
    .nullable()
    .optional(),
});
export type SyncItemResult = z.infer<typeof SyncItemResultSchema>;

export const SyncResponseSchema = z.object({
  processadosEm: z.string(),
  resultados: z.array(SyncItemResultSchema),
});
export type SyncResponse = z.infer<typeof SyncResponseSchema>;
