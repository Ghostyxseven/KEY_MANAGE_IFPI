import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MovimentacaoSchema, CodigoChaveSchema } from "../../src/specs/schemas/chaves.schema";
import { api } from "../../src/services/api";

type Movimentacao = {
  id: string;
  chaveCodigo: string;
  tipo: "retirada" | "devolucao";
  responsavel: { nome: string; matricula: string };
  timestampLocal: string;
  deviceId: string;
  syncStatus: string;
};

export default function HistoricoScreen(): React.ReactNode {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  const carregarHistorico = async (): Promise<void> => {
    try {
      const data = await api.buscarHistorico("A/S9");
      const movimentacoesValidadas = data.map((item: unknown) => MovimentacaoSchema.parse(item));
      setMovimentacoes(movimentacoesValidadas);
    } catch {
      // fallback silencioso para manter funcionamento offline
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, []);

  const abrirDetalhe = (codigo: string): void => {
    const parsed = CodigoChaveSchema.safeParse(codigo);
    if (parsed.success) {
      router.push(`/historico/${codigo}`);
    }
  };

  const renderItem = ({ item }: { item: Movimentacao }): React.ReactElement => (
    <TouchableOpacity style={styles.card} onPress={() => abrirDetalhe(item.chaveCodigo)}>
      <Text style={styles.codigo}>{item.chaveCodigo}</Text>
      <Text style={styles.tipo}>{item.tipo.toUpperCase()}</Text>
      <Text style={styles.responsavel}>
        {item.responsavel.nome} ({item.responsavel.matricula})
      </Text>
      <Text style={styles.data}>{new Date(item.timestampLocal).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  if (carregando) {
    return (
      <View style={styles.center}>
        <Text>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={movimentacoes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
    gap: 4,
  },
  codigo: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tipo: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "bold",
  },
  responsavel: {
    fontSize: 14,
    color: "#374151",
  },
  data: {
    fontSize: 12,
    color: "#6b7280",
  },
});
