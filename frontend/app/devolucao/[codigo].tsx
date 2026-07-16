import { useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RegistroMovimentacaoRequestSchema, CodigoChaveSchema } from "../../src/specs/schemas/chaves.schema";
import { api } from "../../src/services/api";
import { storage } from "../../src/services/storage";
import { useApp } from "../../src/context/AppContext";

export default function DevolucaoScreen(): React.ReactNode {
  const params = useLocalSearchParams<{ codigo: string }>();
  const codigoValidado = CodigoChaveSchema.safeParse(params.codigo);
  const codigo = codigoValidado.success ? codigoValidado.data : null;
  const { nomeGuarda, matriculaGuarda } = useApp();
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  const handleDevolucao = async (): Promise<void> => {
    if (!codigo) return;
    const deviceId = await storage.getDeviceId();
    const parsed = RegistroMovimentacaoRequestSchema.safeParse({
      responsavel: { nome: nomeGuarda, matricula: matriculaGuarda },
      timestampLocal: new Date().toISOString(),
      deviceId,
    });

    if (!parsed.success) {
      Alert.alert("Validação", "Preencha todos os campos obrigatórios.");
      return;
    }

    setEnviando(true);
    try {
      await api.devolverChave(codigo, parsed.data);
      Alert.alert("Sucesso", "Devolução registrada com sucesso.", [
        { text: "OK", onPress: (): void => router.back() },
      ]);
    } catch (error) {
      if (error instanceof Error && "status" in error && (error as Error & { status: number }).status === 409) {
        Alert.alert("Chave indisponível", error.message ?? "Esta chave já está disponível.");
        return;
      }
      Alert.alert("Erro", "Não foi possível registrar a devolução.");
    } finally {
      setEnviando(false);
    }
  };

  if (!codigo) {
    return <View style={styles.container}><Text style={styles.title}>Código de chave inválido.</Text><Button title="Voltar" onPress={() => router.back()} /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Devolução — {codigo}</Text>
      <View style={styles.operador}><Text style={styles.operadorLabel}>Operador autenticado</Text><Text>{nomeGuarda}</Text><Text>Matrícula: {matriculaGuarda}</Text></View>
      <Button title={enviando ? "Registrando..." : "Registrar devolução"} onPress={handleDevolucao} disabled={enviando} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  operador: { backgroundColor: "#eff6ff", borderRadius: 8, padding: 12, gap: 3 },
  operadorLabel: { color: "#1d4ed8", fontWeight: "700" },
});
