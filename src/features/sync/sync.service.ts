import type { Movimentacao, ISyncRepository, ResultadoSync, ItemResultadoSync } from "src/core/interfaces";

export class SyncService {
  constructor(private readonly syncRepository: ISyncRepository) {}

  async sincronizar(
    _deviceId: string,
    registros: Movimentacao[]
  ): Promise<ResultadoSync> {
    const resultados: ItemResultadoSync[] = [];

    const agrupados = this.agruparPorChave(registros);

    for (const chaveCodigo of agrupados.keys()) {
      const registrosChave: Movimentacao[] | undefined = agrupados.get(chaveCodigo);
      if (!registrosChave) {
        continue;
      }
      const pendentes: Movimentacao[] =
        await this.syncRepository.buscarPendentesPorChave(chaveCodigo);

      const todos: Movimentacao[] = [...pendentes, ...registrosChave];
      const ordenados: Movimentacao[] = this.ordenarPorTimestampDesc(todos);

      const vencedora: Movimentacao | undefined = ordenados[0];

      if (!vencedora) {
        continue;
      }

      const vencedorId: string = vencedora.id;

      for (const registro of registrosChave) {
        if (registro.id === vencedorId) {
          try {
            await this.syncRepository.marcarComoSincronizado(registro.id);
            resultados.push({
              id: registro.id,
              status: "sincronizado",
              conflito: null,
              erro: null,
            });
          } catch {
            const codigoErro = "SERVIDOR_INDISPONIVEL";
            const mensagemErro = "Falha ao atualizar status de sincronizacao.";
            await this.syncRepository.marcarComoErro(registro.id, {
              codigo: codigoErro,
              mensagem: mensagemErro,
            });
            resultados.push({
              id: registro.id,
              status: "erro",
              conflito: null,
              erro: {
                codigo: codigoErro,
                mensagem: mensagemErro,
              },
            });
          }
        } else {
          resultados.push({
            id: registro.id,
            status: "conflito",
            conflito: {
              motivo:
                "Timestamp mais recente ja aplicado para esta chave por outro dispositivo.",
              timestampVencedor: vencedora.timestampLocal,
            },
            erro: null,
          });
        }
      }
    }

    return {
      processadosEm: new Date().toISOString(),
      resultados,
    };
  }

  private agruparPorChave(
    registros: Movimentacao[]
  ): Map<string, Movimentacao[]> {
    const mapa = new Map<string, Movimentacao[]>();

    for (const r of registros) {
      const lista = mapa.get(r.chaveCodigo);
      if (lista) {
        lista.push(r);
      } else {
        mapa.set(r.chaveCodigo, [r]);
      }
    }

    return mapa;
  }

  private ordenarPorTimestampDesc(registros: Movimentacao[]): Movimentacao[] {
    return [...registros].sort((a, b) => {
      const ta = new Date(a.timestampLocal).getTime();
      const tb = new Date(b.timestampLocal).getTime();
      return tb - ta;
    });
  }
}
