import { Firestore, QueryDocumentSnapshot, Timestamp } from "firebase-admin/firestore";
import type { Chave, Movimentacao } from "../types/index.js";

export class FirestoreKeyRepository {
  constructor(private readonly db: Firestore) {}

  async buscarPorCodigo(codigo: string): Promise<Chave | null> {
    const ref = this.db.collection("chaves").doc(codigo);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return null;
    }

    const dados = snapshot.data();
    return this.mapearParaChave(codigo, dados as Record<string, unknown>);
  }

  async listarTodas(): Promise<Chave[]> {
    const snapshot = await this.db.collection("chaves").get();

    return snapshot.docs.map((d: QueryDocumentSnapshot) => {
      const dados = d.data();
      return this.mapearParaChave(d.id, dados as Record<string, unknown>);
    });
  }

  async atualizarStatus(
    codigo: string,
    status: Chave["status"],
    responsavelAtual: Chave["responsavelAtual"]
  ): Promise<Chave> {
    const ref = this.db.collection("chaves").doc(codigo);
    const agora = new Date().toISOString();

    const dados: Partial<Chave> = {
      status,
      responsavelAtual: responsavelAtual ? { ...responsavelAtual } : null,
      ultimaMovimentacaoEm: agora,
    };

    await ref.set(dados as Chave, { merge: true });

    return this.mapearParaChave(codigo, dados as Record<string, unknown>);
  }

  async registrarMovimentacao(movimentacao: Movimentacao): Promise<Movimentacao> {
    const ref = this.db.collection("movimentacoes").doc(movimentacao.id);

    const dados = {
      ...movimentacao,
      timestampLocal: Timestamp.fromDate(new Date(movimentacao.timestampLocal)),
    };

    await ref.set(dados);

    return movimentacao;
  }

  private mapearParaChave(codigo: string, dados: Record<string, unknown>): Chave {
    return {
      codigo,
      status: dados.status as Chave["status"],
      responsavelAtual: dados.responsavelAtual as Chave["responsavelAtual"],
      ultimaMovimentacaoEm: dados.ultimaMovimentacaoEm as string | null,
    };
  }
}

export class FirestoreMovimentacaoRepository {
  constructor(private readonly db: Firestore) {}

  async buscarPorChave(chaveCodigo: string): Promise<Movimentacao[]> {
    const q = this.db.collection("movimentacoes")
      .where("chaveCodigo", "==", chaveCodigo)
      .orderBy("timestampLocal", "desc");

    const snapshot = await q.get();

    return snapshot.docs.map((d: QueryDocumentSnapshot) => {
      const dados = d.data();
      return {
        id: d.id,
        chaveCodigo: dados.chaveCodigo as string,
        tipo: dados.tipo as Movimentacao["tipo"],
        responsavel: dados.responsavel as Movimentacao["responsavel"],
        timestampLocal: dados.timestampLocal?.toDate?.()?.toISOString() ?? dados.timestampLocal as string,
        deviceId: dados.deviceId as string,
        syncStatus: dados.syncStatus as Movimentacao["syncStatus"],
      };
    });
  }
}

export class FirestoreSyncRepository {
  constructor(private readonly db: Firestore) {}

  async buscarPendentesPorChave(chaveCodigo: string): Promise<Movimentacao[]> {
    const q = this.db.collection("movimentacoes")
      .where("chaveCodigo", "==", chaveCodigo)
      .where("syncStatus", "==", "pendente");

    const snapshot = await q.get();

    return snapshot.docs.map((d: QueryDocumentSnapshot) => {
      const dados = d.data();
      return {
        id: d.id,
        chaveCodigo: dados.chaveCodigo as string,
        tipo: dados.tipo as Movimentacao["tipo"],
        responsavel: dados.responsavel as Movimentacao["responsavel"],
        timestampLocal: dados.timestampLocal?.toDate?.()?.toISOString() ?? dados.timestampLocal as string,
        deviceId: dados.deviceId as string,
        syncStatus: dados.syncStatus as Movimentacao["syncStatus"],
      };
    });
  }

  async marcarComoSincronizado(id: string): Promise<void> {
    const ref = this.db.collection("movimentacoes").doc(id);
    await ref.update({ syncStatus: "sincronizado" });
  }

  async marcarComoErro(
    id: string,
    erro: { codigo: string; mensagem: string }
  ): Promise<void> {
    const ref = this.db.collection("movimentacoes").doc(id);
    await ref.update({ syncStatus: "erro", erro });
  }
}
