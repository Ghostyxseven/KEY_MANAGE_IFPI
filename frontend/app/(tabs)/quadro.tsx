import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ChaveSchema, CodigoChaveSchema } from "../../src/specs/schemas/chaves.schema";
import { api } from "../../src/services/api";
import { storage } from "../../src/services/storage";

type Chave = {
  codigo: string;
  status: "disponivel" | "em_uso";
  responsavelAtual: { nome: string; matricula: string } | null;
  ultimaMovimentacaoEm: string | null;
};

export default function QuadroChavesScreen(): React.ReactNode {
  const [chaves, setChaves] = useState<Chave[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [offline, setOffline] = useState(false);
  const router = useRouter();

  const verificarConexao = async (): Promise<void> => {
    const { isOffline } = await storage.getNetworkStatus();
    setOffline(isOffline);
  };

  const carregarChaves = async (): Promise<void> => {
    try {
      await verificarConexao();
      const chavesValidadas = await api.listarChaves().then(data => data.map((item: unknown) => ChaveSchema.parse(item)));
      setChaves(chavesValidadas);
    } catch (error) {
      console.error("Erro ao carregar chaves:", error);
      // Tenta carregar do cache mesmo assim
      const cached = await storage.buscarChavesCache();
      if (cached) {
        setChaves(cached as Chave[]);
        Alert.alert("Modo Offline", "Exibindo dados em cache. Algumas funcionalidades podem estar limitadas.");
      } else {
        Alert.alert("Erro", "Não foi possível carregar as chaves.");
      }
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarChaves();
    
    // Verifica conexão periodicamente
    const interval = setInterval(verificarConexao, 5000);
    return () => clearInterval(interval);
  }, []);

  const abrirRetirada = (codigo: string): void => {
    const parsed = CodigoChaveSchema.safeParse(codigo);
    if (!parsed.success) {
      Alert.alert("Código inválido", "O código da chave não segue o padrão A/S9.");
      return;
    }
    router.push(`/retirada/${codigo}`);
  };

  const abrirDevolucao = (codigo: string): void => {
    const parsed = CodigoChaveSchema.safeParse(codigo);
    if (!parsed.success) {
      Alert.alert("Código inválido", "O código da chave não segue o padrão A/S9.");
      return;
    }
    router.push(`/devolucao/${codigo}`);
  };

  const abrirHistorico = (codigo: string): void => {
    router.push(`/historico/${codigo}`);
  };

  const renderChave = ({ item }: { item: Chave }): React.ReactElement => {
    const disponivel = item.status === "disponivel";
    const cardColor = disponivel ? "#dcfce7" : "#fee2e2";

    return (
      <View style={[styles.card, { backgroundColor: cardColor, borderLeftColor: disponivel ? "#16a34a" : "#dc2626" }]}>
        <View style={styles.header}>
          <Text style={[styles.codigo, { color: "#111827" }]}>{item.codigo}</Text>
          <View style={[styles.badge, { backgroundColor: disponivel ? "#16a34a" : "#dc2626" }]}>
            <Text style={styles.badgeText}>{disponivel ? "Disponível" : "Em uso"}</Text>
          </View>
        </View>

        {!disponivel && item.responsavelAtual && (
          <Text style={styles.responsavel}>
            Responsável: {item.responsavelAtual.nome} ({item.responsavelAtual.matricula})
          </Text>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, disponivel ? styles.primaryButton : styles.disabledButton]}
            onPress={() => abrirRetirada(item.codigo)}
            disabled={!disponivel}
          >
            <Text style={[styles.buttonText, disponivel && styles.primaryButtonText]}>Retirar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, !disponivel ? styles.secondaryButton : styles.disabledButton]}
            onPress={() => abrirDevolucao(item.codigo)}
            disabled={disponivel}
          >
            <Text style={[styles.buttonText, !disponivel && styles.secondaryButtonText]}>Devolver</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.ghostButton]} onPress={() => abrirHistorico(item.codigo)}>
            <Text style={styles.ghostButtonText}>Histórico</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Carregando chaves...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {offline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>📴 Modo Offline - Dados em cache</Text>
        </View>
      )}
      <FlatList
        data={chaves}
        keyExtractor={(item) => item.codigo}
        renderItem={renderChave}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  offlineBanner: {
    backgroundColor: "#fbbf24",
    padding: 10,
    alignItems: "center",
  },
  offlineText: {
    color: "#78350f",
    fontWeight: "bold",
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 8,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  codigo: {
    fontSize: 20,
    fontWeight: "bold",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#fff",
  },
  responsavel: {
    fontSize: 14,
    color: "#374151",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  button: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#16a34a",
  },
  secondaryButton: {
    backgroundColor: "#dc2626",
  },
  disabledButton: {
    backgroundColor: "#d1d5db",
  },
  buttonText: {
    color: "#6b7280",
    fontWeight: "bold",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  ghostButton: {
    backgroundColor: "#e5e7eb",
  },
  ghostButtonText: {
    color: "#111827",
    fontWeight: "bold",
  },
});
