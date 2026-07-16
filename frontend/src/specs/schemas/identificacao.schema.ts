import { z } from "zod";

export const IdentificacaoRequestSchema = z.object({
  matricula: z.string().trim().min(1, "Informe a matrícula").max(40),
  pin: z.string().regex(/^\d{6}$/, "O PIN deve possuir 6 dígitos"),
});

export type IdentificacaoRequest = z.infer<typeof IdentificacaoRequestSchema>;
