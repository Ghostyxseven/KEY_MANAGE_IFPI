import { Router } from "express";
import { IdentificacaoController } from "../controllers/identificacao.controller.js";
import { ChavesController } from "../controllers/chaves.controller.js";
import { SyncController } from "../controllers/sync.controller.js";
import type { ChavesService } from "../../features/chaves/chaves.service.js";
import type { SyncService } from "../../features/sync/sync.service.js";

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
