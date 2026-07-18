import { useCallback, useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput, ScrollView } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Network from "expo-network";
import { ChaveSchema, CodigoChaveSchema, RegistroMovimentacaoRequestSchema } from "../../src/specs/schemas/chaves.schema";
import { useApp } from "../../src/context/AppContext";
import { api } from "../../src/services/api";
import { storage } from "../../src/services/storage";
import { SearchBar } from "../../src/presentation/components/SearchBar";
import { FilterChips } from "../../src/presentation/components/FilterChips";
import { showToast } from "../../src/presentation/components/Toast";
import { colors, shadows } from "../../src/presentation/theme";

type Chave = {
  codigo: string;
  nome?: string;
  descricao?: string;
  status: "disponivel" | "em_uso";
  responsavelAtual: { nome: string; matricula: string } | null;
  alunoAtual: { nome: string; matricula?: string } | null;
  ultimaMovimentacaoEm: string | null;
  arquivada: boolean;
};

const FILTROS = [
  { label: "Todas", value: "todas" },
  { label: "🟢 Disponíveis", value: "disponivel" },
  { label: "🔴 Em uso", value: "em_uso" },
];

export default function QuadroChavesScreen(): React.ReactNode {
  const [chaves, setChaves] = useState<Chave[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [offline, setOffline] = useState(false);
  const [pendentes, setPendentes] = useState(0);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const router = useRouter();
  const { nomeGuarda, matriculaGuarda } = useApp();
  const [retirando, setRetirando] = useState<string | null>(null);
  const [devolvendo, setDevolvendo] = useState<string | null>(null);
  const [chaveRetirada, setChaveRetirada] = useState<Chave | null>(null);
  const [nomeAluno, setNomeAluno] = useState("");
  const [matriculaAluno, setMatriculaAluno] = useState("");

  const carregarChaves = useCallback(async (): Promise<void> => {
    try {
      const { isOffline, isConnected } = await storage.getNetworkStatus();
      setOffline(isOffline);
      if (isConnected) {
        const resultado = await api.sincronizarPendencias();
        if (resultado.conflitos > 0) {
          showToast(`${resultado.conflitos} operação(ões) com conflito de sincronização.`, "warning");
        }
        if (resultado.sincronizadas > 0) {
          showToast(`${resultado.sincronizadas} registro(s) sincronizado(s).`, "success");
        }
      }
      setPendentes((await storage.buscarMovimentacoesPendentes()).length);
      const chavesValidadas = await api.listarChaves().then(data => data.map((item: unknown) => ChaveSchema.parse(item)));
      setChaves(chavesValidadas);
    } catch (error) {
      console.error("Erro ao carregar chaves:", error);
      const cached = await storage.buscarChavesCache();
      if (cached) {
        setChaves(cached as Chave[]);
        showToast("Exibindo dados em cache (modo offline).", "info");
      } else {
        showToast("Não foi possível carregar as chaves.", "error");
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback((): void => {
    void carregarChaves();
  }, [carregarChaves]));

  useEffect(() => {
    const interval = setInterval(() => void carregarChaves(), 30000);
    const subscription = Network.addNetworkStateListener((estado): void => {
      if (estado.isConnected && estado.isInternetReachable !== false) void carregarChaves();
    });
    return (): void => { clearInterval(interval); subscription.remove(); };
  }, [carregarChaves]);

  // Filtragem
  const chavesFiltradas = chaves.filter((chave) => {
    if (filtro !== "todas" && chave.status !== filtro) return false;
    if (busca.trim()) {
      const q = busca.toLowerCase();
      return (
        chave.codigo.toLowerCase().includes(q) ||
        (chave.nome?.toLowerCase().includes(q) ?? false) ||
        (chave.descricao?.toLowerCase().includes(q) ?? false) ||
        (chave.responsavelAtual?.nome.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const totalDisponivel = chaves.filter((c) => c.status === "disponivel").length;
  const totalEmUso = chaves.filter((c) => c.status === "em_uso").length;

  const handleRetirada = (codigo: string): void => {
    const parsed = CodigoChaveSchema.safeParse(codigo);
    if (!parsed.success) { showToast("Código de chave inválido.", "error"); return; }

    const executar = async (): Promise<void> => {
      const deviceId = await storage.getDeviceId();
      const payload = RegistroMovimentacaoRequestSchema.safeParse({
        responsavel: { nome: nomeGuarda, matricula: matriculaGuarda },
        aluno: { nome: nomeAluno, matricula: matriculaAluno },
        timestampLocal: new Date().toISOString(),
        deviceId,
      });
      if (!payload.success) { showToast(payload.error.issues[0]?.message ?? "Informe o nome do aluno.", "warning"); return; }
      setRetirando(codigo);
      try {
        await api.retirarChave(codigo, payload.data);
        showToast("Retirada registrada com sucesso.", "success");
        setChaveRetirada(null); setNomeAluno(""); setMatriculaAluno("");
        void carregarChaves();
      } catch (error) {
        if (error instanceof Error && "status" in error && (error as Error & { status: number }).status === 409) {
          showToast(error.message ?? "Esta chave já está em uso.", "warning");
        } else {
          showToast(error instanceof Error ? error.message : "Não foi possível registrar a retirada.", "error");
        }
      } finally {
        setRetirando(null);
      }
    };

    void executar();
  };

  const handleDevolucao = (chave: Chave): void => {
    const codigo = chave.codigo;
    const parsed = CodigoChaveSchema.safeParse(codigo);
    if (!parsed.success) { showToast("Código de chave inválido.", "error"); return; }

    const executar = async (): Promise<void> => {
      const deviceId = await storage.getDeviceId();
      const payload = RegistroMovimentacaoRequestSchema.safeParse({
        responsavel: { nome: nomeGuarda, matricula: matriculaGuarda },
        aluno: chave.alunoAtual ?? chave.responsavelAtual ?? undefined,
        timestampLocal: new Date().toISOString(),
        deviceId,
      });
      if (!payload.success) { showToast("Preencha a identificação antes.", "error"); return; }
      setDevolvendo(codigo);
      try {
        await api.devolverChave(codigo, payload.data);
        showToast("Devolução registrada com sucesso.", "success");
        void carregarChaves();
      } catch (error) {
        if (error instanceof Error && "status" in error && (error as Error & { status: number }).status === 409) {
          showToast(error.message ?? "Esta chave já está disponível.", "warning");
        } else {
          showToast(error instanceof Error ? error.message : "Não foi possível registrar a devolução.", "error");
        }
      } finally {
        setDevolvendo(null);
      }
    };

    void executar();
  };

  const abrirHistorico = (codigo: string): void => {
    router.push(`/historico/${encodeURIComponent(codigo)}`);
  };

  const renderChave = ({ item }: { item: Chave }): React.ReactElement => {
    const disponivel = item.status === "disponivel";
    return (
      <View style={[styles.card, { backgroundColor: disponivel ? colors.successSoft : colors.dangerSoft, borderColor: disponivel ? "#BCE5D5" : "#F2C6CD" }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.keyIcon, { backgroundColor: disponivel ? "#16a34a" : "#dc2626" }]}>
              <MaterialCommunityIcons name={disponivel ? "key-variant" : "key-remove"} size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.codigo}>{item.codigo}</Text>
              {!!item.nome && <Text style={styles.nomeChave}>{item.nome}</Text>}
              {!!item.descricao && <Text style={styles.descricaoChave}>{item.descricao}</Text>}
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: disponivel ? "#16a34a" : "#dc2626" }]}>
            <Text style={styles.badgeText}>{disponivel ? "Disponível" : "Em uso"}</Text>
          </View>
        </View>

        {!disponivel && item.responsavelAtual && (
          <View style={styles.responsavelRow}>
            <MaterialCommunityIcons name="account" size={16} color="#374151" />
            <Text style={styles.responsavel}>
              {item.alunoAtual?.nome ?? item.responsavelAtual.nome}{item.alunoAtual?.matricula ? ` • Matrícula ${item.alunoAtual.matricula}` : ""}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, disponivel ? styles.primaryButton : styles.disabledButton]}
            onPress={() => { setChaveRetirada(item); setNomeAluno(""); setMatriculaAluno(""); }}
            disabled={!disponivel || retirando === item.codigo}
          >
            {retirando === item.codigo ? (
              <ActivityIndicator size={16} color="#fff" />
            ) : (
              <MaterialCommunityIcons name="arrow-up-circle" size={16} color={disponivel ? "#fff" : "#9ca3af"} />
            )}
            <Text style={[styles.buttonText, disponivel && styles.primaryButtonText]}>{retirando === item.codigo ? "Retirando..." : "Retirar"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, !disponivel ? styles.secondaryButton : styles.disabledButton]}
            onPress={() => handleDevolucao(item)}
            disabled={disponivel || devolvendo === item.codigo}
          >
            {devolvendo === item.codigo ? (
              <ActivityIndicator size={16} color="#fff" />
            ) : (
              <MaterialCommunityIcons name="arrow-down-circle" size={16} color={!disponivel ? "#fff" : "#9ca3af"} />
            )}
            <Text style={[styles.buttonText, !disponivel && styles.secondaryButtonText]}>{devolvendo === item.codigo ? "Devolvendo..." : "Devolver"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.ghostButton]} onPress={() => abrirHistorico(item.codigo)}>
            <MaterialCommunityIcons name="history" size={16} color="#111827" />
            <Text style={styles.ghostButtonText}>Histórico</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={{ marginTop: 10, color: colors.muted }}>Carregando chaves...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {(offline || pendentes > 0) && (
        <View style={styles.offlineBanner}>
          <MaterialCommunityIcons name={offline ? "wifi-off" : "sync"} size={16} color="#78350f" />
          <Text style={styles.offlineText}>
            {offline ? "Modo offline" : "Sincronização pendente"} — {pendentes} registro(s)
          </Text>
        </View>
      )}
      <FlatList
        data={chavesFiltradas}
        keyExtractor={(item) => item.codigo}
        renderItem={renderChave}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.hero}>
              <Text style={styles.heroEyebrow}>VISÃO GERAL</Text>
              <Text style={styles.heroTitle}>Quadro de chaves</Text>
            </View>

            <View style={styles.counters}>
              <View style={[styles.counterCard, { borderLeftColor: colors.brand }]}>
                <Text style={[styles.counterValue, { color: colors.brand }]}>{chaves.length}</Text>
                <Text style={styles.counterLabel}>Total</Text>
              </View>
              <View style={[styles.counterCard, { borderLeftColor: "#16a34a" }]}>
                <Text style={[styles.counterValue, { color: "#16a34a" }]}>{totalDisponivel}</Text>
                <Text style={styles.counterLabel}>Disponíveis</Text>
              </View>
              <View style={[styles.counterCard, { borderLeftColor: "#dc2626" }]}>
                <Text style={[styles.counterValue, { color: "#dc2626" }]}>{totalEmUso}</Text>
                <Text style={styles.counterLabel}>Em uso</Text>
              </View>
            </View>

            <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar chave, nome ou responsável..." />
            <FilterChips chips={FILTROS} selected={filtro} onSelect={setFiltro} />
          </View>
        }
        refreshing={carregando}
        onRefresh={() => void carregarChaves()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="key-remove" size={48} color={colors.muted} />
            <Text style={styles.empty}>{busca || filtro !== "todas" ? "Nenhuma chave encontrada com esses filtros." : "Nenhuma chave cadastrada."}</Text>
          </View>
        }
      />
      <Modal visible={chaveRetirada !== null} transparent animationType="slide" onRequestClose={() => setChaveRetirada(null)}>
        <View style={styles.modalBackdrop}>
          <ScrollView style={styles.modalCard} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.modalIcon}><MaterialCommunityIcons name="account-arrow-right" size={26} color={colors.brand} /></View>
            <Text style={styles.modalTitle}>Registrar retirada</Text>
            <Text style={styles.modalSubtitle}>Chave {chaveRetirada?.codigo} • informe quem ficará com a chave.</Text>
            <Text style={styles.fieldLabel}>Nome do aluno *</Text>
            <TextInput style={styles.input} value={nomeAluno} onChangeText={setNomeAluno} placeholder="Nome completo" autoCapitalize="words" autoFocus />
            <Text style={styles.fieldLabel}>Matrícula do aluno (opcional)</Text>
            <TextInput style={styles.input} value={matriculaAluno} onChangeText={setMatriculaAluno} placeholder="Matrícula" autoCapitalize="characters" returnKeyType="done" onSubmitEditing={() => chaveRetirada && handleRetirada(chaveRetirada.codigo)} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setChaveRetirada(null)}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} disabled={retirando !== null} onPress={() => chaveRetirada && handleRetirada(chaveRetirada.codigo)}>{retirando ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Confirmar retirada</Text>}</TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  offlineBanner: { backgroundColor: "#fbbf24", padding: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  offlineText: { color: "#78350f", fontWeight: "bold", fontSize: 14 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16, gap: 12, width: "100%", maxWidth: 900, alignSelf: "center" },
  listHeader: { gap: 12, marginBottom: 8 },
  hero: { paddingVertical: 4, gap: 2 },
  heroEyebrow: { color: colors.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1.3 },
  heroTitle: { color: colors.text, fontSize: 27, fontWeight: "800" },
  counters: { flexDirection: "row", gap: 8 },
  counterCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderLeftWidth: 4, ...shadows.card },
  counterValue: { fontSize: 24, fontWeight: "900" },
  counterLabel: { fontSize: 11, color: colors.muted, fontWeight: "600" },
  emptyContainer: { alignItems: "center", marginTop: 40, gap: 12 },
  empty: { textAlign: "center", color: colors.muted },
  card: { borderRadius: 18, padding: 18, borderWidth: 1, gap: 10, ...shadows.card },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerLeft: { flexDirection: "row", alignItems: "flex-start", gap: 10, flex: 1 },
  keyIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  codigo: { fontSize: 21, fontWeight: "800", color: "#111827" },
  nomeChave: { fontSize: 15, fontWeight: "600", color: "#374151", marginTop: 1 },
  descricaoChave: { fontSize: 13, color: "#6b7280", marginTop: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: "bold", color: "#fff" },
  responsavelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  responsavel: { fontSize: 14, color: "#374151" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  button: { flex: 1, minWidth: 80, paddingVertical: 10, borderRadius: 11, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 4 },
  primaryButton: { backgroundColor: "#16a34a" },
  secondaryButton: { backgroundColor: "#dc2626" },
  disabledButton: { backgroundColor: "#d1d5db" },
  buttonText: { color: "#6b7280", fontWeight: "bold", fontSize: 13 },
  primaryButtonText: { color: "#fff" },
  secondaryButtonText: { color: "#fff" },
  ghostButton: { backgroundColor: "#e5e7eb" },
  ghostButtonText: { color: "#111827", fontWeight: "bold", fontSize: 13 },
  modalBackdrop: { flex: 1, justifyContent: "center", padding: 18, backgroundColor: "rgba(11,41,74,0.55)" },
  modalCard: { maxHeight: "90%", width: "100%", maxWidth: 500, alignSelf: "center", backgroundColor: colors.surface, borderRadius: 20 },
  modalContent: { padding: 24, gap: 10 }, modalIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: colors.brandSoft, alignItems: "center", justifyContent: "center" },
  modalTitle: { color: colors.text, fontSize: 23, fontWeight: "900", marginTop: 4 }, modalSubtitle: { color: colors.muted, lineHeight: 20, marginBottom: 8 },
  fieldLabel: { color: colors.text, fontSize: 13, fontWeight: "800" }, input: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, color: colors.text, backgroundColor: "#FBFCFE", marginBottom: 6 },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 10 }, cancelButton: { minHeight: 48, paddingHorizontal: 18, justifyContent: "center", alignItems: "center", borderRadius: 12, backgroundColor: colors.background }, cancelText: { color: colors.muted, fontWeight: "800" },
  confirmButton: { minHeight: 48, flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 12, backgroundColor: colors.brand }, confirmText: { color: "#fff", fontWeight: "900" },
});
