import { FirebaseError } from "firebase/app";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  where,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  type Firestore,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { ChaveSchema, MovimentacaoSchema } from "../specs/schemas/chaves.schema";
import { IdentificacaoRequestSchema } from "../specs/schemas/identificacao.schema";
import { ensureAnonymousAuth, firebaseServices } from "./firebase";
import { storage } from "./storage";

export type IdentificacaoPayload = { nome: string; matricula: string };

export type MovimentacaoPayload = {
  responsavel: { nome: string; matricula: string };
  timestampLocal: string;
  deviceId: string;
};
export type Chave = {
  codigo: string;
  status: "disponivel" | "em_uso";
  responsavelAtual: { nome: string; matricula: string } | null;
  ultimaMovimentacaoEm: string | null;
};
export type Movimentacao = {
  id: string;
  chaveCodigo: string;
  tipo: "retirada" | "devolucao";
  responsavel: { nome: string; matricula: string };
  timestampLocal: string;
  deviceId: string;
  syncStatus: "pendente" | "sincronizado" | "erro";
};

type TipoMovimentacao = Movimentacao["tipo"];
type ResultadoAplicacao = {
  status: "sincronizado" | "conflito";
  chave: Chave;
  movimentacao: Movimentacao;
};

function criarUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (caractere): string => {
    const aleatorio = Math.floor(Math.random() * 16);
    const valor = caractere === "x" ? aleatorio : (aleatorio & 0x3) | 0x8;
    return valor.toString(16);
  });
}

function paraIso(valor: unknown): string | null {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === "string") return valor;
  if (valor instanceof Timestamp) return valor.toDate().toISOString();
  if (typeof valor === "object" && "toDate" in valor) {
    return (valor as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

function criarErro(codigo: string, mensagem: string, status = 409): Error & { codigo: string; status: number } {
  return Object.assign(new Error(mensagem), { codigo, status });
}

function mapearChave(
  snapshot: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>,
  codigoPadrao?: string,
): Chave {
  const dados = snapshot.data();
  if (!dados) throw criarErro("CHAVE_NAO_ENCONTRADA", "Chave nao cadastrada.", 404);
  return ChaveSchema.parse({
    codigo: typeof dados.codigo === "string" ? dados.codigo : codigoPadrao ?? decodeURIComponent(snapshot.id),
    status: dados.status,
    responsavelAtual: dados.responsavelAtual ?? null,
    ultimaMovimentacaoEm: paraIso(dados.ultimaMovimentacaoEm),
  });
}

function mapearMovimentacao(
  snapshot: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>,
): Movimentacao {
  const dados = snapshot.data();
  if (!dados) throw criarErro("MOVIMENTACAO_NAO_ENCONTRADA", "Movimentacao nao encontrada.", 404);
  return MovimentacaoSchema.parse({
    id: typeof dados.id === "string" ? dados.id : snapshot.id,
    chaveCodigo: dados.chaveCodigo,
    tipo: dados.tipo,
    responsavel: dados.responsavel,
    timestampLocal: paraIso(dados.timestampLocal),
    deviceId: dados.deviceId,
    syncStatus: dados.syncStatus,
  });
}

function falhaDeRede(error: unknown): boolean {
  if (error instanceof FirebaseError) {
    return /unavailable|deadline-exceeded|network-request-failed/.test(error.code);
  }
  return error instanceof TypeError
    || (error instanceof Error && /network|fetch|internet|conex/i.test(error.message));
}

async function bancoAutenticado(): Promise<{ db: Firestore; uid: string }> {
  const uid = await ensureAnonymousAuth();
  return { db: firebaseServices().db, uid };
}

async function resolverChave(db: Firestore, codigo: string): Promise<DocumentReference<DocumentData>> {
  const canonica = doc(db, "chaves", encodeURIComponent(codigo));
  if ((await getDoc(canonica)).exists()) return canonica;
  const legado = await getDocs(query(collection(db, "chaves"), where("codigo", "==", codigo), limit(1)));
  return legado.docs[0]?.ref ?? canonica;
}

function respostaPendente(
  codigo: string,
  tipo: TipoMovimentacao,
  payload: MovimentacaoPayload,
  id: string,
): { chave: Chave; movimentacao: Movimentacao } {
  return {
    chave: {
      codigo,
      status: tipo === "retirada" ? "em_uso" : "disponivel",
      responsavelAtual: tipo === "retirada" ? payload.responsavel : null,
      ultimaMovimentacaoEm: payload.timestampLocal,
    },
    movimentacao: { id, chaveCodigo: codigo, tipo, ...payload, syncStatus: "pendente" },
  };
}

async function enfileirar(
  codigo: string,
  tipo: TipoMovimentacao,
  payload: MovimentacaoPayload,
): Promise<{ chave: Chave; movimentacao: Movimentacao }> {
  const pendencia = await storage.adicionarMovimentacaoPendente({ chaveCodigo: codigo, tipo, payload });
  const resposta = respostaPendente(codigo, tipo, payload, pendencia.id);
  await storage.atualizarChaveCache(resposta.chave);
  return resposta;
}

function motivoConflito(chave: Chave, tipo: TipoMovimentacao, timestamp: string): string | null {
  if (chave.ultimaMovimentacaoEm
    && new Date(chave.ultimaMovimentacaoEm).getTime() > new Date(timestamp).getTime()) {
    return "Existe uma movimentacao mais recente para esta chave.";
  }
  if (tipo === "retirada" && chave.status === "em_uso") return "Esta chave ja esta em uso.";
  if (tipo === "devolucao" && chave.status === "disponivel") return "Esta chave ja esta disponivel.";
  return null;
}

async function executarMovimentacao(
  codigo: string,
  tipo: TipoMovimentacao,
  payload: MovimentacaoPayload,
  id = criarUuid(),
  aceitarConflito = false,
): Promise<ResultadoAplicacao> {
  const { db, uid } = await bancoAutenticado();
  const chaveRef = await resolverChave(db, codigo);
  const movimentacaoRef = doc(db, "movimentacoes", id);

  return runTransaction(db, async (transaction): Promise<ResultadoAplicacao> => {
    const chaveSnapshot = await transaction.get(chaveRef);
    const movimentoSnapshot = await transaction.get(movimentacaoRef);
    if (!chaveSnapshot.exists()) {
      throw criarErro("CHAVE_NAO_ENCONTRADA", `Chave ${codigo} nao cadastrada.`, 404);
    }

    const chave = mapearChave(chaveSnapshot, codigo);
    if (movimentoSnapshot.exists()) {
      return { status: "sincronizado", chave, movimentacao: mapearMovimentacao(movimentoSnapshot) };
    }

    const conflito = motivoConflito(chave, tipo, payload.timestampLocal);
    if (conflito) {
      if (!aceitarConflito) {
        throw criarErro(tipo === "retirada" ? "CHAVE_JA_EM_USO" : "CHAVE_JA_DISPONIVEL", conflito);
      }
      return {
        status: "conflito",
        chave,
        movimentacao: { id, chaveCodigo: codigo, tipo, ...payload, syncStatus: "erro" },
      };
    }

    const timestamp = Timestamp.fromDate(new Date(payload.timestampLocal));
    const chaveAtualizada: Chave = {
      codigo,
      status: tipo === "retirada" ? "em_uso" : "disponivel",
      responsavelAtual: tipo === "retirada" ? payload.responsavel : null,
      ultimaMovimentacaoEm: payload.timestampLocal,
    };
    const movimentacao: Movimentacao = {
      id,
      chaveCodigo: codigo,
      tipo,
      ...payload,
      syncStatus: "sincronizado",
    };

    transaction.update(chaveRef, {
      ...chaveAtualizada,
      ultimaMovimentacaoEm: timestamp,
      ultimaMovimentacaoId: id,
    });
    transaction.set(movimentacaoRef, {
      ...movimentacao,
      autorUid: uid,
      chaveId: chaveRef.id,
      timestampLocal: timestamp,
    });
    return { status: "sincronizado", chave: chaveAtualizada, movimentacao };
  });
}

async function movimentacoesRemotas(codigo?: string): Promise<Movimentacao[]> {
  const { db } = await bancoAutenticado();
  const referencia = collection(db, "movimentacoes");
  const consulta = codigo ? query(referencia, where("chaveCodigo", "==", codigo)) : referencia;
  const snapshot = await getDocs(consulta);
  return snapshot.docs.map(mapearMovimentacao).sort((a, b) => b.timestampLocal.localeCompare(a.timestampLocal));
}

let sincronizando = false;

export const api = {
  async identificar(payload: IdentificacaoPayload): Promise<IdentificacaoPayload> {
    const identificacao = IdentificacaoRequestSchema.parse(payload);
    await bancoAutenticado();
    return identificacao;
  },
  async listarChaves(): Promise<Chave[]> {
    try {
      const { db } = await bancoAutenticado();
      const snapshot = await getDocs(collection(db, "chaves"));
      const chaves = snapshot.docs.map((item) => mapearChave(item)).sort((a, b) => a.codigo.localeCompare(b.codigo));
      await storage.salvarChavesCache(chaves);
      return chaves;
    } catch (error) {
      const cache = await storage.buscarChavesCache();
      if (cache) return cache.map((item) => ChaveSchema.parse(item));
      throw error;
    }
  },

  async buscarChave(codigo: string): Promise<Chave> {
    const { db } = await bancoAutenticado();
    const snapshot = await getDoc(await resolverChave(db, codigo));
    if (!snapshot.exists()) throw criarErro("CHAVE_NAO_ENCONTRADA", `Chave ${codigo} nao cadastrada.`, 404);
    return mapearChave(snapshot, codigo);
  },

  async retirarChave(codigo: string, payload: MovimentacaoPayload): Promise<{ chave: Chave; movimentacao: Movimentacao }> {
    if (!(await storage.getNetworkStatus()).isConnected) return enfileirar(codigo, "retirada", payload);
    try {
      const resultado = await executarMovimentacao(codigo, "retirada", payload);
      await storage.atualizarChaveCache(resultado.chave);
      return resultado;
    } catch (error) {
      if (falhaDeRede(error)) return enfileirar(codigo, "retirada", payload);
      throw error;
    }
  },

  async devolverChave(codigo: string, payload: MovimentacaoPayload): Promise<{ chave: Chave; movimentacao: Movimentacao }> {
    if (!(await storage.getNetworkStatus()).isConnected) return enfileirar(codigo, "devolucao", payload);
    try {
      const resultado = await executarMovimentacao(codigo, "devolucao", payload);
      await storage.atualizarChaveCache(resultado.chave);
      return resultado;
    } catch (error) {
      if (falhaDeRede(error)) return enfileirar(codigo, "devolucao", payload);
      throw error;
    }
  },

  async buscarHistorico(codigo: string): Promise<Movimentacao[]> {
    try {
      const historico = await movimentacoesRemotas(codigo);
      await storage.salvarHistoricoCache(codigo, historico);
      return historico;
    } catch (error) {
      const cache = await storage.buscarHistoricoCache(codigo);
      if (cache) return cache.map((item) => MovimentacaoSchema.parse(item));
      throw error;
    }
  },

  async listarHistorico(): Promise<Movimentacao[]> {
    const [remotas, pendentes] = await Promise.all([movimentacoesRemotas(), storage.buscarMovimentacoesPendentes()]);
    const locais = pendentes.map((item) => MovimentacaoSchema.parse({
      id: item.id,
      chaveCodigo: item.chaveCodigo,
      tipo: item.tipo,
      ...item.payload,
      syncStatus: item.error ? "erro" : "pendente",
    }));
    return [...locais, ...remotas].sort((a, b) => b.timestampLocal.localeCompare(a.timestampLocal));
  },

  async sincronizarPendencias(): Promise<{ sincronizadas: number; falhas: number; conflitos: number }> {
    if (sincronizando || !(await storage.getNetworkStatus()).isConnected) {
      return { sincronizadas: 0, falhas: 0, conflitos: 0 };
    }
    const pendentes = (await storage.buscarMovimentacoesPendentes())
      .filter((item) => !item.error)
      .sort((a, b) => {
        const porData = a.payload.timestampLocal.localeCompare(b.payload.timestampLocal);
        return porData === 0 ? a.id.localeCompare(b.id) : porData;
      });
    if (pendentes.length === 0) return { sincronizadas: 0, falhas: 0, conflitos: 0 };

    sincronizando = true;
    const concluidos: string[] = [];
    let sincronizadas = 0;
    let conflitos = 0;
    try {
      for (const pendencia of pendentes) {
        try {
          const resultado = await executarMovimentacao(
            pendencia.chaveCodigo,
            pendencia.tipo,
            pendencia.payload,
            pendencia.id,
            true,
          );
          if (resultado.status === "sincronizado") {
            concluidos.push(pendencia.id);
            sincronizadas += 1;
          } else {
            const erro = motivoConflito(resultado.chave, pendencia.tipo, pendencia.payload.timestampLocal)
              ?? "Conflito de estado da chave.";
            await storage.marcarMovimentacaoComErro(pendencia.id, erro);
            conflitos += 1;
          }
        } catch (error) {
          console.error(`Falha ao sincronizar ${pendencia.id}:`, error);
        }
      }
      await storage.removerMovimentacoesPendentes(concluidos);
      if (concluidos.length > 0) await api.listarChaves();
      return { sincronizadas, conflitos, falhas: pendentes.length - concluidos.length };
    } finally {
      sincronizando = false;
    }
  },
};
