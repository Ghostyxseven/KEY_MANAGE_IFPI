import { initializeApp, getApps } from "firebase-admin/app";
import dotenv from "dotenv";

dotenv.config();

const USE_EMULATOR = process.env.USE_FIREBASE_EMULATOR === "true";

async function initializeFirebase(): Promise<void> {
  if (!getApps().length) {
    if (USE_EMULATOR) {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID ?? "coretech-chaves",
      });
    } else {
      const { cert } = await import("firebase-admin/app");
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID ?? "coretech-chaves",
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "firebase-adminsdk@coretech-chaves.iam.gserviceaccount.com",
          privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
        }),
      });
    }
  }
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
    await db.collection("chaves").add({ ...chave, codigo: chave.codigo });
    console.log("Chave cadastrada:", chave.codigo, chave.status);
  }

  console.log("Seed concluída!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});