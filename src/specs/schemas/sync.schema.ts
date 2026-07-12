/**
 * specs/schemas/sync.schema.ts
 *
 * Contrato da rota POST /sync.
 * Rastreabilidade: RF07, RF08, RF10, RN07, RNF05, RNF06, UC04, US-09
 * (história mais complexa do backlog).
 *
 * A resolução de conflito (RN07 — "último timestamp vence") e a
 * publicação dos efeitos colaterais (SyncQueueObserver,
 * InventoryLogObserver, EmailNotificationObserver — ADR-0009) ocorrem
 * no serviço, não neste arquivo. Aqui só travamos a FORMA do payload.
 */
import { z } from "zod";
import { MovimentacaoSchema } from "./chaves.schema";

export const SyncRequestSchema = z.object({
  deviceId: z.string().min(1),
  registros: z
    .array(MovimentacaoSchema)
    .min(1, "lote de sincronização não pode ser vazio (ver FA-01 no cliente)"),
});
export type SyncRequest = z.infer<typeof SyncRequestSchema>;

export const SyncItemResultSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["sincronizado", "conflito", "erro"]),
  conflito: z
    .object({
      motivo: z.string(),
      timestampVencedor: z.string().datetime(),
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
  processadosEm: z.string().datetime(),
  resultados: z.array(SyncItemResultSchema),
});
export type SyncResponse = z.infer<typeof SyncResponseSchema>;