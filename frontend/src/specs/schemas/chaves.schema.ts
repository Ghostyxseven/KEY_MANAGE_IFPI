import { z } from "zod";

export const CodigoChaveSchema = z.string().regex(/^[A-S][0-9]{1,2}$/, "Código inválido");

export const ChaveSchema = z.object({
  codigo: CodigoChaveSchema,
  status: z.enum(["disponivel", "em_uso"]),
  responsavelAtual: z
    .object({
      nome: z.string(),
      matricula: z.string(),
    })
    .nullable(),
  ultimaMovimentacaoEm: z.string().nullable(),
});

export type Chave = z.infer<typeof ChaveSchema>;

export const RegistroMovimentacaoRequestSchema = z.object({
  responsavel: z.object({
    nome: z.string().min(1),
    matricula: z.string().min(1),
  }),
  timestampLocal: z.string(),
  deviceId: z.string(),
});

export type RegistroMovimentacaoRequest = z.infer<typeof RegistroMovimentacaoRequestSchema>;

export const MovimentacaoSchema = z.object({
  id: z.string(),
  codigoChave: CodigoChaveSchema,
  tipo: z.enum(["retirada", "devolucao"]),
  responsavel: z.object({
    nome: z.string(),
    matricula: z.string(),
  }),
  timestamp: z.string(),
  deviceId: z.string(),
});

export type Movimentacao = z.infer<typeof MovimentacaoSchema>;
