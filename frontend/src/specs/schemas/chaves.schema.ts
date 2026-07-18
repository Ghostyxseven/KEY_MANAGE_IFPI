import { z } from "zod";

export const CodigoChaveSchema = z
  .string()
  .trim()
  .min(1, "Informe um código")
  .max(60, "O código deve ter no máximo 60 caracteres")
  .transform((codigo) => codigo.replace(/\s+/g, " ").toUpperCase());

export const ChaveSchema = z.object({
  codigo: CodigoChaveSchema,
  nome: z.string().trim().optional(),
  descricao: z.string().trim().optional(),
  status: z.enum(["disponivel", "em_uso"]),
  responsavelAtual: z
    .object({
      nome: z.string().trim().min(2, "O nome do operador deve ter pelo menos 2 caracteres").max(120, "O nome do operador deve ter no máximo 120 caracteres"),
      matricula: z.string().trim().min(1, "Informe a identificação do operador").max(40, "A identificação do operador deve ter no máximo 40 caracteres"),
    })
    .nullable(),
  alunoAtual: z.object({
    nome: z.string().trim().min(2, "O nome do aluno deve ter pelo menos 2 caracteres").max(120, "O nome do aluno deve ter no máximo 120 caracteres"),
    matricula: z.string().trim().max(40, "A matrícula do aluno deve ter no máximo 40 caracteres").optional().default(""),
  }).nullable().default(null),
  ultimaMovimentacaoEm: z.string().datetime({ offset: true }).nullable(),
  arquivada: z.boolean().default(false),
});

export type Chave = z.infer<typeof ChaveSchema>;

export const RegistroMovimentacaoRequestSchema = z.object({
  responsavel: z.object({
    nome: z.string().trim().min(2, "O nome do operador deve ter pelo menos 2 caracteres").max(120, "O nome do operador deve ter no máximo 120 caracteres"),
    matricula: z.string().trim().min(1, "Informe a identificação do operador").max(40, "A identificação do operador deve ter no máximo 40 caracteres"),
  }),
  aluno: z.object({
    nome: z.string().trim().min(2, "O nome do aluno deve ter pelo menos 2 caracteres").max(120, "O nome do aluno deve ter no máximo 120 caracteres"),
    matricula: z.string().trim().max(40, "A matrícula do aluno deve ter no máximo 40 caracteres").optional().default(""),
  }).optional(),
  timestampLocal: z.string().datetime({ offset: true }),
  deviceId: z.string().trim().min(1, "Não foi possível identificar este dispositivo").max(200, "Identificação do dispositivo inválida"),
});

export type RegistroMovimentacaoRequest = z.infer<typeof RegistroMovimentacaoRequestSchema>;

export const MovimentacaoSchema = z.object({
  id: z.string().uuid(),
  chaveCodigo: CodigoChaveSchema,
  tipo: z.enum(["retirada", "devolucao"]),
  responsavel: z.object({
    nome: z.string().trim().min(2, "Nome do operador inválido").max(120, "Nome do operador muito longo"),
    matricula: z.string().trim().min(1, "Identificação do operador ausente").max(40, "Identificação do operador muito longa"),
  }),
  aluno: z.object({
    nome: z.string().trim().min(2, "Nome do aluno inválido").max(120, "Nome do aluno muito longo"),
    matricula: z.string().trim().max(40, "Matrícula do aluno muito longa").optional().default(""),
  }),
  timestampLocal: z.string().datetime({ offset: true }),
  deviceId: z.string().trim().min(1, "Dispositivo não identificado").max(200, "Identificação do dispositivo inválida"),
  syncStatus: z.enum(["pendente", "sincronizado", "erro"]).default("sincronizado"),
});

export type Movimentacao = z.infer<typeof MovimentacaoSchema>;
