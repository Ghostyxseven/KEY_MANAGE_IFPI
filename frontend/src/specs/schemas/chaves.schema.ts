import { z } from "zod";

export const CodigoChaveSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z]+\/[A-Za-z0-9]+$/, "Código deve seguir o padrão Bloco/Sala, ex: A/S9")
  .transform((codigo) => codigo.toUpperCase());

export const ChaveSchema = z.object({
  codigo: CodigoChaveSchema,
  nome: z.string().trim().optional(),
  descricao: z.string().trim().optional(),
  status: z.enum(["disponivel", "em_uso"]),
  responsavelAtual: z
    .object({
      nome: z.string().trim().min(2).max(120),
      matricula: z.string().trim().min(1).max(40),
    })
    .nullable(),
  ultimaMovimentacaoEm: z.string().datetime({ offset: true }).nullable(),
});

export type Chave = z.infer<typeof ChaveSchema>;

export const RegistroMovimentacaoRequestSchema = z.object({
  responsavel: z.object({
    nome: z.string().trim().min(2).max(120),
    matricula: z.string().trim().min(1).max(40),
  }),
  timestampLocal: z.string().datetime({ offset: true }),
  deviceId: z.string().trim().min(1).max(200),
});

export type RegistroMovimentacaoRequest = z.infer<typeof RegistroMovimentacaoRequestSchema>;

export const MovimentacaoSchema = z.object({
  id: z.string().uuid(),
  chaveCodigo: CodigoChaveSchema,
  tipo: z.enum(["retirada", "devolucao"]),
  responsavel: z.object({
    nome: z.string().trim().min(2).max(120),
    matricula: z.string().trim().min(1).max(40),
  }),
  timestampLocal: z.string().datetime({ offset: true }),
  deviceId: z.string().trim().min(1).max(200),
  syncStatus: z.enum(["pendente", "sincronizado", "erro"]).default("sincronizado"),
});

export type Movimentacao = z.infer<typeof MovimentacaoSchema>;
