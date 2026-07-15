import { z } from "zod";

export const IdentificacaoRequestSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  matricula: z.string().min(1, "Matrícula é obrigatória"),
});

export type IdentificacaoRequest = z.infer<typeof IdentificacaoRequestSchema>;
