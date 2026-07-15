import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RegistroMovimentacaoRequestSchema, CodigoChaveSchema } from "../../../src/specs/schemas/chaves.schema";
import { API_BASE_URL } from "../../../constants";

type FormData = {
  responsavelNome: string;
  responsavelMatricula: string;
};

export default function DevolucaoScreen(): React.ReactNode {
  const params = useLocalSearchParams<{ codigo: string }>();
  const codigo = CodigoChaveSchema.parse(params.codigo);
  const [form, setForm] = useState<FormData>({ responsavelNome: "", responsavelMatricula: "" });
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  const handleDevolucao = async (): Promise<void> => {
    const parsed = RegistroMovimentacaoRequestSchema.safeParse({
      responsavel: { nome: form.responsavelNome, matricula: form.responsavelMatricula },
      timestampLocal: new Date().toISOString(),
      deviceId: "expo-device",
    });

    if (!parsed.success) {
      Alert.alert("Validação", "Preencha todos os campos obrigatórios.");
      return;
    }

    setEnviando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/chaves/${codigo}/devolucao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (response.status === 409) {
        const erro = await response.json();
        Alert.alert("Chave indisponível", erro.mensagem ?? "Esta chave já está disponível.");
        return;
      }

      if (!response.ok) {
        throw new Error("Falha na devolução");
      }

      Alert.alert("Sucesso", "Devolução registrada com sucesso.", [
        { text: "OK", onPress: (): void => router.back() },
      ]);
    } catch {
      Alert.alert("Erro", "Não foi possível registrar a devolução.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Devolução — {codigo}</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do responsável"
        value={form.responsavelNome}
        onChangeText={(text) => setForm({ ...form, responsavelNome: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Matrícula do responsável"
        value={form.responsavelMatricula}
        onChangeText={(text) => setForm({ ...form, responsavelMatricula: text })}
      />
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});
