import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../src/context/AppContext";
import { api } from "../src/services/api";
import { IdentificacaoRequestSchema } from "../src/specs/schemas/identificacao.schema";

export default function IdentificacaoScreen(): React.ReactElement {
  const [form, setForm] = useState({ nome: "", matricula: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { entrar: salvarSessao } = useApp();

  const entrar = async (): Promise<void> => {
    const parsed = IdentificacaoRequestSchema.safeParse(form);
    if (!parsed.success) {
      Alert.alert("Validação", "Informe nome e matrícula.");
      return;
    }

    setLoading(true);
    try {
      const identificacao = await api.identificar(parsed.data);
      await salvarSessao(identificacao.nome, identificacao.matricula);
      router.replace("/(tabs)/quadro");
    } catch (error) {
      Alert.alert("Erro", error instanceof Error ? error.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Identificação do guarda</Text>
      <Text style={styles.subtitle}>Informe seu nome e matrícula para registrar as operações.</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        value={form.nome}
        onChangeText={(nome) => setForm({ ...form, nome })}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Matrícula"
        value={form.matricula}
        onChangeText={(matricula) => setForm({ ...form, matricula })}
        autoCapitalize="none"
        onSubmitEditing={() => void entrar()}
      />
      <Button title={loading ? "Entrando..." : "Entrar"} onPress={() => void entrar()} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center" },
  subtitle: { textAlign: "center", color: "#475569" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 12, fontSize: 16 },
});
