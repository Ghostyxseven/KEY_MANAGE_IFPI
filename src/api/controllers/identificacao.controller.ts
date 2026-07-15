import type { Request, Response } from "express";
import type { IdentificacaoRequest, IdentificacaoResponse } from "src/specs/schemas/identificacao.schema";

export class IdentificacaoController {
  registrarIdentificacao = async (
    req: Request<unknown, IdentificacaoResponse, IdentificacaoRequest>,
    res: Response<IdentificacaoResponse>
  ): Promise<void> => {
    const body: IdentificacaoRequest = req.body;

    if (!body.nome || !body.matricula) {
      res.status(400).json({
        identificado: false,
        sessao: {
          nome: body.nome ?? "",
          matricula: body.matricula ?? "",
          iniciadaEm: new Date().toISOString(),
        },
      });
      return;
    }

    const sessao: IdentificacaoResponse = {
      identificado: true,
      sessao: {
        nome: body.nome,
        matricula: body.matricula,
        iniciadaEm: new Date().toISOString(),
      },
    };

    res.status(200).json(sessao);
  };
}
