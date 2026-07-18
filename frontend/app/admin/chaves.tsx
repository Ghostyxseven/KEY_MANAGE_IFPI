import { useState, useCallback, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, ActivityIndicator, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api, type Chave } from "../../src/services/api";
import { SearchBar } from "../../src/presentation/components/SearchBar";
import { showToast } from "../../src/presentation/components/Toast";
import { colors, shadows } from "../../src/presentation/theme";
import { confirmAction } from "../../src/presentation/confirmAction";

function mensagemErro(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function GerenciarChavesScreen(): React.ReactNode {
  const [chaves, setChaves] = useState<Chave[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [codigoInput, setCodigoInput] = useState("");
  const [nomeInput, setNomeInput] = useState("");
  const [descricaoInput, setDescricaoInput] = useState("");
  const [chaveEditando, setChaveEditando] = useState<Chave | null>(null);
  const [busca, setBusca] = useState("");
  const [arquivando, setArquivando] = useState<string | null>(null);

  const carregarChaves = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listarChaves();
      setChaves(data);
    } catch {
      showToast("Falha ao carregar chaves.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void carregarChaves(); }, [carregarChaves]);

  const filtradas = chaves.filter((c) => {
    if (!busca.trim()) return true;
    const q = busca.toLowerCase();
    return c.codigo.toLowerCase().includes(q) || (c.nome?.toLowerCase().includes(q) ?? false) || (c.descricao?.toLowerCase().includes(q) ?? false);
  });

  const handleSalvar = async (): Promise<void> => {
    if (!codigoInput.trim()) return;
    try {
      if (chaveEditando) {
        await api.editarChave(chaveEditando.codigo, codigoInput.trim(), nomeInput.trim(), descricaoInput.trim());
        showToast("Chave atualizada com sucesso!", "success");
      } else {
        await api.cadastrarChave(codigoInput.trim(), nomeInput.trim(), descricaoInput.trim());
        showToast("Chave cadastrada com sucesso!", "success");
      }
      setModalVisible(false);
      void carregarChaves();
    } catch (error: unknown) {
      showToast(mensagemErro(error, "Falha ao salvar a chave."), "error");
    }
  };

  const handleApagar = (codigo: string): void => {
    confirmAction({ title: "Desativar chave?", message: `A chave ${codigo} deixará de aparecer no quadro, mas seu histórico será preservado.`, confirmLabel: "Desativar", destructive: true, onConfirm: (): void => { void (async (): Promise<void> => {
      setArquivando(codigo);
      try {
        await api.apagarChave(codigo);
        showToast("Chave desativada com sucesso!", "success");
        await carregarChaves();
      } catch (error: unknown) {
        showToast(mensagemErro(error, "Falha ao desativar a chave."), "error");
      } finally {
        setArquivando(null);
      }
    })(); } });
  };

  const renderItem = ({ item }: { item: Chave }): React.ReactElement => {
    const disponivel = item.status === "disponivel";
    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={[styles.statusDot, { backgroundColor: disponivel ? "#16a34a" : "#dc2626" }]} />
          <View style={styles.cardInfo}>
            <Text style={styles.codigo}>{item.codigo}</Text>
            {!!item.nome && <Text style={styles.nomeChave}>{item.nome}</Text>}
            {!!item.descricao && <Text style={styles.descricaoChave}>{item.descricao}</Text>}
            <View style={[styles.statusBadge, { backgroundColor: disponivel ? colors.successSoft : colors.dangerSoft }]}>
              <Text style={[styles.statusText, { color: disponivel ? colors.success : colors.danger }]}>{disponivel ? "Disponível" : "Em uso"}</Text>
            </View>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => {
            setChaveEditando(item);
            setCodigoInput(item.codigo);
            setNomeInput(item.nome ?? "");
            setDescricaoInput(item.descricao ?? "");
            setModalVisible(true);
          }}>
            <MaterialCommunityIcons name="pencil" size={20} color={colors.brand} />
          </TouchableOpacity>
          <TouchableOpacity accessibilityLabel={`Desativar chave ${item.codigo}`} disabled={arquivando === item.codigo} style={styles.iconBtn} onPress={() => handleApagar(item.codigo)}>
            {arquivando === item.codigo ? <ActivityIndicator size={20} color={colors.danger} /> : <MaterialCommunityIcons name="archive-arrow-down-outline" size={20} color={colors.danger} />}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciar Chaves</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => {
          setChaveEditando(null); setCodigoInput(""); setNomeInput(""); setDescricaoInput(""); setModalVisible(true);
        }}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Nova</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar chave..." />
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} color={colors.brand} />
      ) : (
        <FlatList
          data={filtradas}
          keyExtractor={(item) => item.codigo}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="key-remove" size={40} color={colors.muted} />
              <Text style={styles.empty}>{busca ? "Nenhuma chave encontrada." : "Nenhuma chave cadastrada."}</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>{chaveEditando ? "Editar Chave" : "Nova Chave"}</Text>
            <TextInput style={styles.input} placeholder="Código (ex.: Sala 2 ou A/S3) *" value={codigoInput} onChangeText={setCodigoInput} autoCapitalize="characters" editable={!chaveEditando} />
            {chaveEditando && <Text style={styles.helper}>O código é a identidade histórica da chave e não pode ser alterado.</Text>}
            <TextInput style={styles.input} placeholder="Nome (Ex: Lab Info)" value={nomeInput} onChangeText={setNomeInput} />
            <TextInput style={[styles.input, { marginBottom: 24 }]} placeholder="Descrição" value={descricaoInput} onChangeText={setDescricaoInput} />
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
  card: { backgroundColor: colors.surface, padding: 16, borderRadius: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", ...shadows.card },
  cardLeft: { flexDirection: "row", alignItems: "flex-start", gap: 12, flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 8 },
  cardInfo: { flex: 1, gap: 2 },
  codigo: { fontSize: 17, fontWeight: "bold", color: colors.text },
  nomeChave: { fontSize: 13, fontWeight: "600", color: "#374151" },
  descricaoChave: { fontSize: 12, color: colors.muted },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  statusText: { fontSize: 11, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 8 },
  iconBtn: { padding: 8, backgroundColor: colors.background, borderRadius: 8 },
  emptyContainer: { alignItems: "center", marginTop: 40, gap: 12 },
  empty: { textAlign: "center", color: colors.muted },
  modalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: 16 },
  modalContent: { maxHeight: "90%", backgroundColor: colors.surface, borderRadius: 16, ...shadows.card }, modalScroll: { padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 12 },
  helper: { color: colors.muted, fontSize: 12, marginTop: -6, marginBottom: 12 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  modalBtnCancel: { padding: 12 },
  modalBtnTextCancel: { color: colors.muted, fontWeight: "bold" },
  modalBtnSave: { backgroundColor: colors.brand, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  modalBtnTextSave: { color: "#fff", fontWeight: "bold" },
});
