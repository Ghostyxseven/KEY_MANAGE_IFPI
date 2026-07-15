import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { IdentificacaoRequestSchema } from "../src/specs/schemas/identificacao.schema";
import { API_BASE_URL } from "../constants";

type IdentificacaoForm = {
  nome: string;
  matricula: string;
};

export default function IdentificacaoScreen(): React.ReactNode {
  const [form, setForm] = useState<IdentificacaoForm>({ nome: "", matricula: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleIdentificacao = async (): Promise<void> => {
    const parsed = IdentificacaoRequestSchema.safeParse(form);

    if (!parsed.success) {
      Alert.alert("Validação", "Preencha nome e matrícula.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/identificacao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        throw new Error("Falha na identificação");
      }

      router.replace("/(tabs)/quadro");
    } catch {
      Alert.alert("Erro", "Não foi possível realizar a identificação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Identificação do Guarda</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={form.nome}
        onChangeText={(text) => setForm({ ...form, nome: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Matrícula"
        value={form.matricula}
        onChangeText={(text) => setForm({ ...form, matricula: text })}
      />
      <Button title={loading ? "Entrando..." : "Entrar"} onPress={handleIdentificacao} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});
