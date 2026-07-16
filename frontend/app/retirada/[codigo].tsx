import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RegistroMovimentacaoRequestSchema, CodigoChaveSchema } from "../../src/specs/schemas/chaves.schema";
import { api } from "../../src/services/api";

type FormData = {
  responsavelNome: string;
  responsavelMatricula: string;
};

export default function RetiradaScreen(): React.ReactNode {
  const params = useLocalSearchParams<{ codigo: string }>();
  const codigo = CodigoChaveSchema.parse(params.codigo);
  const [form, setForm] = useState<FormData>({ responsavelNome: "", responsavelMatricula: "" });
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  const handleRetirada = async (): Promise<void> => {
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
      await api.retirarChave(codigo, parsed.data);
      Alert.alert("Sucesso", "Retirada registrada com sucesso.", [
        { text: "OK", onPress: (): void => router.back() },
      ]);
    } catch (error) {
      if (error instanceof Error && "status" in error && (error as Error & { status: number }).status === 409) {
        Alert.alert("Chave indisponível", error.message ?? "Esta chave já está em uso.");
        return;
      }
      Alert.alert("Erro", "Não foi possível registrar a retirada.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Retirada — {codigo}</Text>
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
      <Button title={enviando ? "Registrando..." : "Registrar retirada"} onPress={handleRetirada} disabled={enviando} />
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
