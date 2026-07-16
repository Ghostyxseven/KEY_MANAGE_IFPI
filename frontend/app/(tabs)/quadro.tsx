import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ChaveSchema, CodigoChaveSchema } from "../../src/specs/schemas/chaves.schema";
import { api } from "../../src/services/api";

type Chave = {
  codigo: string;
  status: "disponivel" | "em_uso";
  responsavelAtual: { nome: string; matricula: string } | null;
  ultimaMovimentacaoEm: string | null;
};

export default function QuadroChavesScreen(): React.ReactNode {
  const [chaves, setChaves] = useState<Chave[]>([]);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  const carregarChaves = async (): Promise<void> => {
    try {
      const chavesValidadas = await api.listarChaves().then(data => data.map((item: unknown) => ChaveSchema.parse(item)));
      setChaves(chavesValidadas);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar as chaves.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarChaves();
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
    return (
      <View style={[styles.card, { borderLeftColor: disponivel ? "#16a34a" : "#dc2626" }]}>
        <View style={styles.header}>
          <Text style={styles.codigo}>{item.codigo}</Text>
          <View style={[styles.badge, { backgroundColor: disponivel ? "#dcfce7" : "#fee2e2" }]}>
            <Text style={[styles.badgeText, { color: disponivel ? "#16a34a" : "#dc2626" }]}>
              {disponivel ? "Disponível" : "Em uso"}
            </Text>
          </View>
        </View>

        {!disponivel && item.responsavelAtual && (
          <Text style={styles.responsavel}>
            Responsável: {item.responsavelAtual.nome} ({item.responsavelAtual.matricula})
          </Text>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => abrirRetirada(item.codigo)}
            disabled={!disponivel}
          >
            <Text style={styles.primaryButtonText}>Retirar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => abrirDevolucao(item.codigo)}
            disabled={disponivel}
          >
            <Text style={styles.secondaryButtonText}>Devolver</Text>
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
        <Text>Carregando chaves...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 6,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  codigo: {
    fontSize: 18,
    fontWeight: "bold",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
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
    backgroundColor: "#2563eb",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#f97316",
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
