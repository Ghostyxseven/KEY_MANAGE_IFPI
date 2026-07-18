import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MovimentacaoSchema, CodigoChaveSchema } from "../../src/specs/schemas/chaves.schema";
import { api } from "../../src/services/api";
import { AppButton } from "../../src/presentation/components/AppButton";
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

export default function HistoricoDetalheScreen(): React.ReactNode {
  const params = useLocalSearchParams<{ codigo: string }>();
  const codigoRaw = typeof params.codigo === "string" ? decodeURIComponent(params.codigo) : params.codigo;
  const codigoValidado = CodigoChaveSchema.safeParse(codigoRaw);
  const codigo = codigoValidado.success ? codigoValidado.data : null;
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const router = useRouter();

  const carregarHistorico = async (): Promise<void> => {
    if (!codigo) {
      setErro("Código de chave inválido.");
      setCarregando(false);
      return;
    }
    setErro("");
    try {
      const data = await api.buscarHistorico(codigo);
      const movimentacoesValidadas = data.map((item: unknown) => MovimentacaoSchema.parse(item));
      setMovimentacoes(movimentacoesValidadas);
    } catch {
      setErro("Não foi possível carregar o histórico.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, [codigo]);

  const renderItem = ({ item }: { item: Movimentacao }): React.ReactElement => (
    <View style={styles.card}>
      <View style={[styles.timelineDot, { backgroundColor: item.tipo === "retirada" ? colors.warning : colors.success }]} />
      <View style={styles.cardContent}><Text style={[styles.tipo, { color: item.tipo === "retirada" ? colors.warning : colors.success }]}>{item.tipo === "retirada" ? "RETIRADA" : "DEVOLUÇÃO"}</Text><Text style={styles.responsavel}>{item.aluno.nome}</Text>{item.aluno.matricula ? <Text style={styles.meta}>Matrícula do aluno: {item.aluno.matricula}</Text> : null}<Text style={styles.meta}>Operador: {item.responsavel.nome}</Text><Text style={styles.data}>{new Date(item.timestampLocal).toLocaleString("pt-BR")}</Text></View>
    </View>
  );

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} size="large" /><Text style={styles.loadingText}>Carregando histórico...</Text>
      </View>
    );
  }

  if (erro) {
    return <View style={styles.center}><Text style={styles.errorTitle}>Não conseguimos carregar</Text><Text style={styles.loadingText}>{erro}</Text><AppButton label="Tentar novamente" onPress={() => void carregarHistorico()} /><AppButton label="Voltar" variant="ghost" onPress={() => router.back()} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={movimentacoes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<View style={styles.hero}><Text style={styles.kicker}>LINHA DO TEMPO</Text><Text style={styles.heroTitle}>Chave {codigo}</Text><Text style={styles.heroSubtitle}>{movimentacoes.length} movimentações registradas</Text></View>}
        ListEmptyComponent={<View style={styles.emptyCard}><Text style={styles.emptyTitle}>Sem movimentações</Text><Text style={styles.empty}>Esta chave ainda não possui registros.</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 24,
  },
  list: {
    padding: 16,
    gap: 12,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  hero: { paddingVertical: 10, gap: 3 }, kicker: { color: colors.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1.3 }, heroTitle: { color: colors.text, fontSize: 28, fontWeight: "800" }, heroSubtitle: { color: colors.muted },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 }, cardContent: { flex: 1, gap: 3 },
  tipo: {
    fontSize: 12,
    fontWeight: "bold",
  },
  responsavel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "700",
  },
  meta: { color: colors.muted, fontSize: 12 },
  data: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  loadingText: { color: colors.muted, textAlign: "center" }, errorTitle: { color: colors.text, fontSize: 21, fontWeight: "800" }, emptyCard: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 16, padding: 28, borderWidth: 1, borderColor: colors.border }, emptyTitle: { color: colors.text, fontWeight: "800", fontSize: 17 }, empty: { textAlign: "center", color: colors.muted, marginTop: 5 },
});
