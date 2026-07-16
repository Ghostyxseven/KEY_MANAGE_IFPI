import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function HistoricoDetalheScreen(): React.ReactNode {
  const params = useLocalSearchParams<{ codigo: string }>();
  const codigoValidado = CodigoChaveSchema.safeParse(params.codigo);
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
      <Text style={styles.tipo}>{item.tipo.toUpperCase()}</Text>
      <Text style={styles.responsavel}>
        {item.responsavel.nome} ({item.responsavel.matricula})
      </Text>
      <Text style={styles.data}>{new Date(item.timestampLocal).toLocaleString()}</Text>
    </View>
  );

  if (carregando) {
    return (
      <View style={styles.center}>
        <Text>Carregando histórico...</Text>
      </View>
    );
  }

  if (erro) {
    return <View style={styles.center}><Text>{erro}</Text><Button title="Tentar novamente" onPress={() => void carregarHistorico()} /><Button title="Voltar" onPress={() => router.back()} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={movimentacoes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma movimentação registrada.</Text>}
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
  empty: { textAlign: "center", color: "#6b7280", marginTop: 32 },
});
