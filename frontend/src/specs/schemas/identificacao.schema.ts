import { z } from "zod";

export const IdentificacaoRequestSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome").max(120),
  matricula: z.string().trim().min(1, "Informe a matrícula").max(40),
});

export type IdentificacaoRequest = z.infer<typeof IdentificacaoRequestSchema>;
