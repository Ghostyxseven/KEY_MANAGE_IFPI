import type { Request, Response, NextFunction } from "express";
import type { SyncService } from "src/features/sync/sync.service";
import { SyncRequestSchema, SyncResponseSchema } from "src/specs/schemas/sync.schema";

export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  sincronizar = async (
    req: Request<unknown, unknown, import("src/specs/schemas/sync.schema").SyncRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const payload = SyncRequestSchema.parse(req.body);

      if (!payload.deviceId || !payload.registros || payload.registros.length === 0) {
        res.status(400).json({
          codigo: "LOTE_INVALIDO",
          mensagem: "Lote de sincronizacao malformado ou vazio.",
        });
        return;
      }

      const resultado = await this.syncService.sincronizar(
        payload.deviceId,
        payload.registros
      );

      const responseValidado = SyncResponseSchema.parse(resultado);
      res.status(200).json(responseValidado);
    } catch (error) {
      next(error);
    }
  };
}
