import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const USE_EMULATOR = process.env.USE_FIREBASE_EMULATOR === "true";

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

const db = getFirestore();

if (USE_EMULATOR) {
  db.settings({
    host: "localhost:8080",
    ssl: false,
  });
}

const guardas = [
  { nome: "Carlos", matricula: "2024000001", ativo: true },
  { nome: "Ana", matricula: "2024000002", ativo: true },
  { nome: "João", matricula: "2024000003", ativo: true },
];

const chaves = [
  { codigo: "A/S1", status: "disponivel", responsavelAtual: null, ultimaMovimentacaoEm: null },
  { codigo: "A/S2", status: "em_uso", responsavelAtual: { nome: "Carlos", matricula: "2024000001" }, ultimaMovimentacaoEm: new Date().toISOString() },
  { codigo: "A/S3", status: "disponivel", responsavelAtual: null, ultimaMovimentacaoEm: null },
];

async function seed() {
  console.log("Populando Firestore emulado...");

  for (const guarda of guardas) {
    await db.collection("guardas").doc(guarda.matricula).set(guarda);
    console.log("Guarda cadastrado:", guarda.nome, guarda.matricula);
  }

  for (const chave of chaves) {
    await db.collection("chaves").doc(chave.codigo).set(chave);
    console.log("Chave cadastrada:", chave.codigo, chave.status);
  }

  console.log("Seed concluída!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
