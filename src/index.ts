import dotenv from "dotenv";
dotenv.config();

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import express from "express";
import cors from "cors";
import { criarRotas } from "src/api/routes";
import { FirestoreKeyRepository } from "src/core/repositories/firestore.repository";
import { FirestoreMovimentacaoRepository } from "src/core/repositories/firestore.repository";
import { FirestoreSyncRepository } from "src/core/repositories/firestore.repository";
import { ChavesService } from "src/features/chaves/chaves.service";
import { SyncService } from "src/features/sync/sync.service";
import { CheckoutStrategy } from "src/features/chaves/strategies/checkout.strategy";
import { ReturnStrategy } from "src/features/chaves/strategies/return.strategy";
import { tratarErros, validarContentType } from "src/api/middleware/error.middleware";

const app = express();

if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID ?? "coretech-chaves",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "firebase-adminsdk@coretech-chaves.iam.gserviceaccount.com",
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
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
