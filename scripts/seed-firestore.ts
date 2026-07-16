import dotenv from "dotenv";
import { initializeFirebaseAdmin } from "./lib/firebase-admin.js";
import { codificarCodigoChave } from "./lib/firestore-key.js";

dotenv.config();

const USE_EMULATOR = process.env.USE_FIREBASE_EMULATOR === "true";

async function initializeFirebase(): Promise<void> {
  initializeFirebaseAdmin({ useEmulator: USE_EMULATOR });
}

async function main(): Promise<void> {
  await initializeFirebase();

  const { getFirestore } = await import("firebase-admin/firestore");
  const db = getFirestore();

  if (USE_EMULATOR) {
    db.settings({
      host: "localhost:8080",
      ssl: false,
    });
  }

  const chaves = [
    { codigo: "A/S1", status: "disponivel", responsavelAtual: null, ultimaMovimentacaoEm: null },
    { codigo: "A/S2", status: "em_uso", responsavelAtual: { nome: "Carlos", matricula: "2024000001" }, ultimaMovimentacaoEm: new Date().toISOString() },
    { codigo: "A/S3", status: "disponivel", responsavelAtual: null, ultimaMovimentacaoEm: null },
    { codigo: "A/S4", status: "disponivel", responsavelAtual: null, ultimaMovimentacaoEm: null },
    { codigo: "A/S5", status: "em_uso", responsavelAtual: { nome: "Ana", matricula: "2024000002" }, ultimaMovimentacaoEm: new Date().toISOString() },
  ];

  console.log("Populando Firestore emulado com chaves...");

  for (const chave of chaves) {
    await db.collection("chaves").doc(codificarCodigoChave(chave.codigo)).set(chave);
    console.log("Chave cadastrada:", chave.codigo, chave.status);
  }

  console.log("Seed concluída!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
