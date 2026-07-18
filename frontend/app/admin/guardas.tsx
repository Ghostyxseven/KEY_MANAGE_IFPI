import { useState, useCallback, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, ActivityIndicator, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { listarGuardas, cadastrarGuarda, editarNomeGuarda, alterarStatusGuarda, type Usuario } from "../../src/services/auth";
import { SearchBar } from "../../src/presentation/components/SearchBar";
import { showToast } from "../../src/presentation/components/Toast";
import { colors, shadows } from "../../src/presentation/theme";
import { confirmAction } from "../../src/presentation/confirmAction";
import { FilterChips } from "../../src/presentation/components/FilterChips";

function mensagemErro(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

const AVATAR_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316"];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function GerenciarGuardasScreen(): React.ReactNode {
  const [guardas, setGuardas] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [pin, setPin] = useState("");
  const [guardaEditando, setGuardaEditando] = useState<Usuario | null>(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"ativos" | "excluidos">("ativos");

  const carregarGuardas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarGuardas();
      setGuardas(data);
    } catch {
      showToast("Falha ao carregar guardas.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void carregarGuardas(); }, [carregarGuardas]);

  const filtrados = guardas.filter((g) => {
    if (filtro === "ativos" && !g.ativo) return false;
    if (filtro === "excluidos" && g.ativo) return false;
    if (!busca.trim()) return true;
    const q = busca.toLowerCase();
    return g.nome.toLowerCase().includes(q) || g.matricula.toLowerCase().includes(q);
  });

  const handleSalvar = async (): Promise<void> => {
    if (!nome.trim() || !matricula.trim()) {
      showToast("Preencha nome e matrícula.", "warning");
      return;
    }
    try {
      if (guardaEditando) {
        await editarNomeGuarda(guardaEditando, nome);
        showToast("Guarda atualizado com sucesso!", "success");
      } else {
        if (!pin.trim() || pin.length !== 6) {
          showToast("Para novos guardas, informe um PIN de 6 dígitos.", "warning");
          return;
        }
        await cadastrarGuarda(nome, matricula, pin);
        showToast("Guarda cadastrado com sucesso!", "success");
      }
      setModalVisible(false);
      void carregarGuardas();
    } catch (error: unknown) {
      showToast(mensagemErro(error, "Falha ao salvar o guarda."), "error");
    }
  };

  const handleReativar = async (guarda: Usuario): Promise<void> => {
    try {
      await alterarStatusGuarda(guarda, true);
      showToast(`${guarda.nome} foi reativado!`, "success");
      void carregarGuardas();
    } catch (error: unknown) {
      showToast(mensagemErro(error, "Falha ao reativar guarda."), "error");
    }
  };

  const handleBloquear = async (guarda: Usuario): Promise<void> => {
    try {
      await alterarStatusGuarda(guarda, false);
      showToast(`${guarda.nome} foi excluído da lista ativa.`, "info");
      void carregarGuardas();
    } catch (error: unknown) {
      showToast(mensagemErro(error, "Falha ao excluir guarda."), "error");
    }
  };

  const confirmarBloqueio = (guarda: Usuario): void => {
    confirmAction({ title: "Excluir guarda?", message: `${guarda.nome} perderá o acesso e sairá da lista ativa. O histórico será preservado e o guarda poderá ser restaurado.`, confirmLabel: "Excluir", destructive: true, onConfirm: (): void => { void handleBloquear(guarda); } });
  };

  const renderItem = ({ item }: { item: Usuario }): React.ReactElement => {
    const bgColor = avatarColor(item.nome);
    return (
      <View style={[styles.card, !item.ativo && styles.cardInativo]}>
        <View style={styles.cardLeft}>
          <View style={[styles.avatar, { backgroundColor: bgColor }]}>
            <Text style={styles.avatarText}>{item.nome.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.matricula}>Matrícula: {item.matricula}</Text>
            <View style={[styles.statusBadge, { backgroundColor: item.ativo ? colors.successSoft : colors.dangerSoft }]}>
              <View style={[styles.statusDot, { backgroundColor: item.ativo ? colors.success : colors.danger }]} />
              <Text style={[styles.statusText, { color: item.ativo ? colors.success : colors.danger }]}>{item.ativo ? "Ativo" : "Inativo"}</Text>
            </View>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => {
            setGuardaEditando(item);
            setNome(item.nome);
            setMatricula(item.matricula);
            setPin("");
            setModalVisible(true);
          }}>
            <MaterialCommunityIcons name="pencil" size={18} color={colors.brand} />
          </TouchableOpacity>
          {item.ativo ? (
            <TouchableOpacity style={styles.iconBtn} onPress={() => confirmarBloqueio(item)}>
              <MaterialCommunityIcons name="account-remove" size={18} color={colors.danger} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.successSoft }]} onPress={() => void handleReativar(item)}>
              <MaterialCommunityIcons name="account-check" size={18} color={colors.success} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciar Guardas</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => {
          setGuardaEditando(null); setNome(""); setMatricula(""); setPin(""); setModalVisible(true);
        }}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Novo</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar guarda..." />
        <FilterChips chips={[{ label: "Ativos", value: "ativos" }, { label: "Excluídos", value: "excluidos" }]} selected={filtro} onSelect={(value) => setFiltro(value as "ativos" | "excluidos")} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} color={colors.brand} />
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={(item) => item.uid}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="account-off" size={40} color={colors.muted} />
              <Text style={styles.empty}>{busca ? "Nenhum guarda encontrado." : filtro === "ativos" ? "Nenhum guarda ativo." : "Nenhum guarda excluído."}</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>{guardaEditando ? "Editar Guarda" : "Novo Guarda"}</Text>
            <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
            <TextInput style={styles.input} placeholder="Matrícula" value={matricula} onChangeText={setMatricula} autoCapitalize="none" editable={!guardaEditando} />
            {guardaEditando && <Text style={styles.helper}>A matrícula é a identidade de acesso e não pode ser alterada.</Text>}
            {!guardaEditando && (
              <TextInput style={styles.input} placeholder="PIN (6 dígitos)" value={pin} onChangeText={setPin} keyboardType="numeric" maxLength={6} secureTextEntry />
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={handleSalvar}>
                <Text style={styles.modalBtnTextSave}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", color: colors.text },
  addButton: { flexDirection: "row", alignItems: "center", backgroundColor: colors.brand, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, gap: 4 },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: colors.surface, padding: 14, borderRadius: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", ...shadows.card },
  cardInativo: { opacity: 0.6 },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "900" },
  cardInfo: { flex: 1, gap: 2 },
  nome: { fontSize: 16, fontWeight: "bold", color: colors.text },
  matricula: { fontSize: 13, color: colors.muted },
  statusBadge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "700" },
  actions: { flexDirection: "column", gap: 6 },
  iconBtn: { padding: 7, backgroundColor: colors.background, borderRadius: 8 },
  emptyContainer: { alignItems: "center", marginTop: 40, gap: 12 },
  empty: { textAlign: "center", color: colors.muted },
  modalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: 16 },
  modalContent: { maxHeight: "90%", backgroundColor: colors.surface, borderRadius: 16, ...shadows.card }, modalScroll: { padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 12 },
  helper: { color: colors.muted, fontSize: 12, marginTop: -6, marginBottom: 12 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 8 },
  modalBtnCancel: { padding: 12 },
  modalBtnTextCancel: { color: colors.muted, fontWeight: "bold" },
  modalBtnSave: { backgroundColor: colors.brand, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  modalBtnTextSave: { color: "#fff", fontWeight: "bold" },
});
