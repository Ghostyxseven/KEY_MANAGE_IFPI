import { Router } from "express";
import { IdentificacaoController } from "src/api/controllers/identificacao.controller";
import { ChavesController } from "src/api/controllers/chaves.controller";
import { SyncController } from "src/api/controllers/sync.controller";
import type { ChavesService } from "src/features/chaves/chaves.service";
import type { SyncService } from "src/features/sync/sync.service";

export function criarRotas(
  chavesService: ChavesService,
  syncService: SyncService
): Router {
  const router = Router();
  const identificacaoController = new IdentificacaoController();
  const chavesController = new ChavesController(chavesService);
  const syncController = new SyncController(syncService);

  router.post("/identificacao", identificacaoController.registrarIdentificacao);

  router.get("/chaves", chavesController.listarChaves);
  router.get("/chaves/:codigo", chavesController.buscarChave);
  router.get("/chaves/:codigo/historico", chavesController.buscarHistorico);
  router.post("/chaves/:codigo/retirada", chavesController.retirarChave);
  router.post("/chaves/:codigo/devolucao", chavesController.devolverChave);

  router.post("/sync", syncController.sincronizar);

  return router;
}
