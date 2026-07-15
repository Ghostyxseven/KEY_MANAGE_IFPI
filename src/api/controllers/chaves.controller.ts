import type { Request, Response, NextFunction } from "express";
import type { ChavesService } from "src/features/chaves/chaves.service";
import { RegistroMovimentacaoRequestSchema, CodigoChaveSchema } from "src/specs/schemas/chaves.schema";
import { ChaveSchema } from "src/specs/schemas/chaves.schema";

export class ChavesController {
  constructor(private readonly chavesService: ChavesService) {}

  listarChaves = async (_req: Request, res: Response): Promise<void> => {
    const chaves = await this.chavesService.listarChaves();
    res.status(200).json(chaves.map((c) => ChaveSchema.parse(c)));
  };

  buscarChave = async (
    req: Request<{ codigo: string }, unknown, unknown>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const codigo = CodigoChaveSchema.parse(req.params.codigo);
      const chave = await this.chavesService.buscarChave(codigo);

      if (!chave) {
        res.status(404).json({
          codigo: "CHAVE_NAO_ENCONTRADA",
          mensagem: `Chave ${codigo} nao cadastrada no padrao do campus (RN04).`,
        });
        return;
      }

      res.status(200).json(ChaveSchema.parse(chave));
    } catch (error) {
      next(error);
    }
  };

  buscarHistorico = async (
    req: Request<{ codigo: string }, unknown, unknown>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const codigo = CodigoChaveSchema.parse(req.params.codigo);
      const historico = await this.chavesService.buscarHistorico(codigo);
      res.status(200).json(historico);
    } catch (error) {
      next(error);
    }
  };

  retirarChave = async (
    req: Request<{ codigo: string }, unknown, import("src/specs/schemas/chaves.schema").RegistroMovimentacaoRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const codigo = CodigoChaveSchema.parse(req.params.codigo);
      const payload = RegistroMovimentacaoRequestSchema.parse(req.body);

      const resultado = await this.chavesService.retirarChave(codigo, payload);
      res.status(201).json(resultado.movimentacao);
    } catch (error) {
      next(error);
    }
  };

  devolverChave = async (
    req: Request<{ codigo: string }, unknown, import("src/specs/schemas/chaves.schema").RegistroMovimentacaoRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const codigo = CodigoChaveSchema.parse(req.params.codigo);
      const payload = RegistroMovimentacaoRequestSchema.parse(req.body);

      const resultado = await this.chavesService.devolverChave(codigo, payload);
      res.status(201).json(resultado.movimentacao);
    } catch (error) {
      next(error);
    }
  };
}
