import dotenv from "dotenv";
dotenv.config();

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import express from "express";
import cors from "cors";
import { criarRotas } from "./api/routes/index.js";
import { FirestoreKeyRepository } from "./core/repositories/firestore.repository.js";
import { FirestoreMovimentacaoRepository } from "./core/repositories/firestore.repository.js";
import { FirestoreSyncRepository } from "./core/repositories/firestore.repository.js";
import { ChavesService } from "./features/chaves/chaves.service.js";
import { SyncService } from "./features/sync/sync.service.js";
import { CheckoutStrategy } from "./features/chaves/strategies/checkout.strategy.js";
import { ReturnStrategy } from "./features/chaves/strategies/return.strategy.js";
import { tratarErros, validarContentType } from "./api/middleware/error.middleware.js";

const app = express();

if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID ?? "coretech-chaves",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "firebase-adminsdk@coretech-chaves.iam.gserviceaccount.com",
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
  };

  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

const keyRepository = new FirestoreKeyRepository(db);
const movimentacaoRepository = new FirestoreMovimentacaoRepository(db);
const syncRepository = new FirestoreSyncRepository(db);

const checkoutStrategy = new CheckoutStrategy(keyRepository);
const returnStrategy = new ReturnStrategy(keyRepository);

const chavesService = new ChavesService(
  keyRepository,
  movimentacaoRepository,
  checkoutStrategy,
  returnStrategy
);

const syncService = new SyncService(syncRepository);

app.use(cors());
app.use(express.json());
app.use(validarContentType);

const rotas = criarRotas(chavesService, syncService);
app.use("/v1", rotas);

app.use(tratarErros);

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export { app, chavesService, syncService };
