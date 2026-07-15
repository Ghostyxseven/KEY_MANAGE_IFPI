import { z } from "zod";

export const IdentificacaoRequestSchema = z.object({
  nome: z.string().min(1, "nome é obrigatório"),
  matricula: z.string().min(1, "matrícula é obrigatória"),
});
export type IdentificacaoRequest = z.infer<typeof IdentificacaoRequestSchema>;

export const IdentificacaoResponseSchema = z.object({
  identificado: z.boolean(),
  sessao: z.object({
    nome: z.string(),
    matricula: z.string(),
    iniciadaEm: z.string(),
  }),
});
export type IdentificacaoResponse = z.infer<typeof IdentificacaoResponseSchema>;
