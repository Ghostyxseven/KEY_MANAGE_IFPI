import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

async function main(): Promise<void> {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID ?? "coretech-chaves",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "firebase-adminsdk-fbsvc@coretech-chaves.iam.gserviceaccount.com",
        privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
      }),
    });
  }

  const db = getFirestore();

  const chaves = [
    { codigo: "A/S1", status: "disponivel", responsavelAtual: null, ultimaMovimentacaoEm: null },
    { codigo: "A/S2", status: "em_uso", responsavelAtual: { nome: "Carlos", matricula: "2024000001" }, ultimaMovimentacaoEm: new Date().toISOString() },
    { codigo: "A/S3", status: "disponivel", responsavelAtual: null, ultimaMovimentacaoEm: null },
    { codigo: "A/S4", status: "disponivel", responsavelAtual: null, ultimaMovimentacaoEm: null },
    { codigo: "A/S5", status: "em_uso", responsavelAtual: { nome: "Ana", matricula: "2024000002" }, ultimaMovimentacaoEm: new Date().toISOString() },
    { codigo: "L/B1", status: "disponivel", responsavelAtual: null, ultimaMovimentacaoEm: null },
    { codigo: "L/B2", status: "em_uso", responsavelAtual: { nome: "João", matricula: "2024000003" }, ultimaMovimentacaoEm: new Date().toISOString() },
  ];

  console.log("Populando Firestore de produção com chaves...");

  for (const chave of chaves) {
    await db.collection("chaves").doc(chave.codigo).set(chave);
    console.log("Chave cadastrada:", chave.codigo, chave.status);
  }

  console.log("Seed de produção concluída!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro no seed de produção:", err);
  process.exit(1);
});