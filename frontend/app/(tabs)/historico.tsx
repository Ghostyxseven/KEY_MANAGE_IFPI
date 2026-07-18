import { useState, useEffect, useMemo, type ComponentProps } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CodigoChaveSchema } from "../../src/specs/schemas/chaves.schema";
import { api } from "../../src/services/api";
import { SearchBar } from "../../src/presentation/components/SearchBar";
import { showToast } from "../../src/presentation/components/Toast";
import { colors, shadows } from "../../src/presentation/theme";

type Movimentacao = {
  id: string;
  chaveCodigo: string;
  tipo: "retirada" | "devolucao";
  responsavel: { nome: string; matricula: string };
  aluno: { nome: string; matricula?: string };
  timestampLocal: string;
  deviceId: string;
  syncStatus: string;
};

type SectionItem = { type: "header"; title: string } | { type: "item"; data: Movimentacao };
type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

function labelData(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diff === 0 && date.getDate() === now.getDate()) return "Hoje";
  if (diff <= 1) return "Ontem";
  if (diff <= 6) return "Esta semana";
  if (diff <= 29) return "Este mês";
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export default function HistoricoScreen(): React.ReactNode {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const router = useRouter();

  const carregarHistorico = async (): Promise<void> => {
    try {
      const data = await api.listarHistorico();
      setMovimentacoes(data);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      showToast("Não foi possível carregar o histórico.", "error");
      setMovimentacoes([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { void carregarHistorico(); }, []);

  const filtradas = useMemo(() => {
    if (!busca.trim()) return movimentacoes;
    const q = busca.toLowerCase();
    return movimentacoes.filter((m) =>
      m.chaveCodigo.toLowerCase().includes(q) ||
      m.responsavel.nome.toLowerCase().includes(q) ||
      m.responsavel.matricula.toLowerCase().includes(q) ||
      m.aluno.nome.toLowerCase().includes(q) ||
      (m.aluno.matricula?.toLowerCase().includes(q) ?? false)
    );
  }, [movimentacoes, busca]);

  const sections = useMemo((): SectionItem[] => {
    const result: SectionItem[] = [];
    let lastHeader = "";
    for (const item of filtradas) {
      const header = labelData(item.timestampLocal);
      if (header !== lastHeader) {
        result.push({ type: "header", title: header });
        lastHeader = header;
      }
      result.push({ type: "item", data: item });
    }
    return result;
  }, [filtradas]);

  const abrirDetalhe = (codigo: string): void => {
    const parsed = CodigoChaveSchema.safeParse(codigo);
    if (parsed.success) router.push(`/historico/${encodeURIComponent(codigo)}`);
  };

  const renderItem = ({ item }: { item: SectionItem }): React.ReactElement => {
    if (item.type === "header") {
      return <Text style={styles.sectionHeader}>{item.title}</Text>;
    }

    const mov = item.data;
    const isRetirada = mov.tipo === "retirada";
    const syncIcon: IconName = mov.syncStatus === "sincronizado" ? "cloud-check" : mov.syncStatus === "pendente" ? "clock-outline" : "alert-circle";
    const syncColor = mov.syncStatus === "sincronizado" ? colors.success : mov.syncStatus === "pendente" ? colors.warning : colors.danger;

    return (
      <TouchableOpacity style={styles.card} onPress={() => abrirDetalhe(mov.chaveCodigo)} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={[styles.tipoBadge, { backgroundColor: isRetirada ? colors.dangerSoft : colors.successSoft }]}>
            <MaterialCommunityIcons name={isRetirada ? "arrow-up-circle" : "arrow-down-circle"} size={16} color={isRetirada ? colors.danger : colors.success} />
            <Text style={[styles.tipoText, { color: isRetirada ? colors.danger : colors.success }]}>{isRetirada ? "Retirada" : "Devolução"}</Text>
          </View>
          <MaterialCommunityIcons name={syncIcon} size={16} color={syncColor} />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.codeRow}>
            <MaterialCommunityIcons name="key-variant" size={16} color={colors.brand} />
            <Text style={styles.codigo}>{mov.chaveCodigo}</Text>
          </View>
          <View style={styles.codeRow}>
            <MaterialCommunityIcons name="account" size={16} color={colors.muted} />
            <Text style={styles.responsavel}>Aluno: {mov.aluno.nome}{mov.aluno.matricula ? ` • ${mov.aluno.matricula}` : ""}</Text>
          </View>
          <Text style={styles.operador}>Registrado por {mov.responsavel.nome}</Text>
        </View>

        <Text style={styles.data}>
          {new Date(mov.timestampLocal).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </Text>
      </TouchableOpacity>
    );
  };

  if (carregando) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.muted }}>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.type === "header" ? `h-${item.title}` : `i-${item.data.id}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.hero}>
              <Text style={styles.heroEyebrow}>MOVIMENTAÇÕES</Text>
              <Text style={styles.heroTitle}>Histórico recente</Text>
              <Text style={styles.heroSubtitle}>{movimentacoes.length} registros encontrados</Text>
            </View>
            <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar por chave, aluno ou operador..." />
          </View>
        }
        refreshing={carregando}
        onRefresh={() => void carregarHistorico()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="history" size={48} color={colors.muted} />
            <Text style={styles.empty}>{busca ? "Nenhum resultado para a busca." : "Nenhuma movimentação registrada."}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16, gap: 8, width: "100%", maxWidth: 900, alignSelf: "center" },
  listHeader: { gap: 12, marginBottom: 8 },
  hero: { paddingVertical: 4, gap: 2 },
  heroEyebrow: { color: colors.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1.3 },
  heroTitle: { color: colors.text, fontSize: 27, fontWeight: "800" },
  heroSubtitle: { color: colors.muted },
  sectionHeader: { fontSize: 13, fontWeight: "800", color: colors.muted, textTransform: "uppercase", letterSpacing: 1, marginTop: 16, marginBottom: 4 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 8, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tipoBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tipoText: { fontSize: 12, fontWeight: "800" },
  cardBody: { gap: 4 },
  codeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  codigo: { fontSize: 16, fontWeight: "bold", color: colors.text },
  responsavel: { fontSize: 13, color: "#374151" },
  operador: { fontSize: 12, color: colors.muted, marginLeft: 22 },
  data: { fontSize: 12, color: colors.muted },
  emptyContainer: { alignItems: "center", marginTop: 40, gap: 12 },
  empty: { textAlign: "center", color: colors.muted },
});
