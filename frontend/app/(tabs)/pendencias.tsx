import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../../src/services/api";
import { storage, type MovimentacaoPending } from "../../src/services/storage";
import { showToast } from "../../src/presentation/components/Toast";
import { colors, shadows } from "../../src/presentation/theme";
import { confirmAction } from "../../src/presentation/confirmAction";

export default function PendenciasScreen(): React.ReactElement {
  const [itens, setItens] = useState<MovimentacaoPending[]>([]);
  const [sincronizando, setSincronizando] = useState(false);

  const carregar = useCallback(async (): Promise<void> => {
    setItens(await storage.buscarMovimentacoesPendentes());
  }, []);

  useFocusEffect(useCallback((): void => { void carregar(); }, [carregar]));

  const sincronizar = async (id?: string): Promise<void> => {
    setSincronizando(true);
    try {
      if (id) await storage.liberarMovimentacaoParaRetry(id);
      const resultado = await api.sincronizarPendencias();
      await carregar();
      if (resultado.sincronizadas > 0) showToast(`${resultado.sincronizadas} registro(s) sincronizado(s).`, "success");
      else if (resultado.conflitos > 0) showToast("Ainda existem conflitos que precisam de revisão.", "warning");
      else showToast("Nenhum registro pôde ser sincronizado agora.", "info");
    } catch {
      showToast("Falha ao sincronizar. A pendência foi preservada.", "error");
    } finally {
      setSincronizando(false);
    }
  };

  const descartar = (item: MovimentacaoPending): void => {
    confirmAction({ title: "Descartar operação?", message: `A ${item.tipo} da chave ${item.chaveCodigo} será removida somente deste dispositivo. Esta ação não pode ser desfeita.`, confirmLabel: "Descartar", destructive: true, onConfirm: (): void => { void storage.removerMovimentacoesPendentes([item.id]).then(carregar); } });
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View><Text style={s.title}>Pendências offline</Text><Text style={s.subtitle}>{itens.length} operação(ões) preservada(s)</Text></View>
        <TouchableOpacity style={s.syncButton} disabled={sincronizando || itens.length === 0} onPress={() => void sincronizar()}>
          <MaterialCommunityIcons name="sync" size={18} color="#fff" /><Text style={s.syncText}>Sincronizar</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={itens}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        renderItem={({ item }): React.ReactElement => (
          <View style={s.card}>
            <View style={s.cardTop}><Text style={s.code}>{item.chaveCodigo}</Text><Text style={s.kind}>{item.tipo}</Text></View>
            <Text style={s.meta}>{item.payload.responsavel.nome} • {new Date(item.payload.timestampLocal).toLocaleString("pt-BR")}</Text>
            {item.error ? <Text style={s.error}>Conflito: {item.error}</Text> : <Text style={s.waiting}>Aguardando sincronização{item.tentativas ? ` • ${item.tentativas} tentativa(s)` : ""}</Text>}
            <View style={s.actions}>
              <TouchableOpacity style={s.retry} onPress={() => void sincronizar(item.id)}><Text style={s.retryText}>Tentar novamente</Text></TouchableOpacity>
              <TouchableOpacity style={s.discard} onPress={() => descartar(item)}><Text style={s.discardText}>Descartar</Text></TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={s.empty}><MaterialCommunityIcons name="cloud-check" size={48} color={colors.success} /><Text style={s.emptyText}>Tudo sincronizado.</Text></View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background }, header: { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 23, fontWeight: "800", color: colors.text }, subtitle: { color: colors.muted }, syncButton: { flexDirection: "row", gap: 6, backgroundColor: colors.brand, padding: 11, borderRadius: 10 }, syncText: { color: "#fff", fontWeight: "800" },
  list: { padding: 16, gap: 12 }, card: { backgroundColor: colors.surface, padding: 16, borderRadius: 14, gap: 8, ...shadows.card }, cardTop: { flexDirection: "row", justifyContent: "space-between" }, code: { fontSize: 18, fontWeight: "800" }, kind: { textTransform: "capitalize", color: colors.brand, fontWeight: "700" },
  meta: { color: colors.muted }, error: { color: colors.danger, backgroundColor: colors.dangerSoft, padding: 9, borderRadius: 8 }, waiting: { color: colors.warning, backgroundColor: colors.warningSoft, padding: 9, borderRadius: 8 }, actions: { flexDirection: "row", gap: 8 }, retry: { flex: 1, backgroundColor: colors.brandSoft, padding: 10, borderRadius: 8, alignItems: "center" }, retryText: { color: colors.brand, fontWeight: "800" }, discard: { padding: 10, borderRadius: 8, backgroundColor: colors.dangerSoft }, discardText: { color: colors.danger, fontWeight: "800" },
  empty: { alignItems: "center", marginTop: 80, gap: 12 }, emptyText: { color: colors.muted, fontSize: 16 },
});
