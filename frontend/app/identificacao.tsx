import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { IdentificacaoRequestSchema } from "../src/specs/schemas/identificacao.schema";
import { api } from "../src/services/api";

/** Tipo que representa o formulário de identificação */
type IdentificacaoForm = {
  /** Nome completo do usuário */
  nome: string;
  /** Matrícula ou identificador do usuário */
  matricula: string;
};

/**
 * Tela de identificação do usuário.
 * Solicita nome e matrícula antes de permitir o acesso ao sistema.
 * @returns Componente da tela de identificação
 */
export default function IdentificacaoScreen(): React.ReactNode {
  /** Estado do formulário de identificação */
  const [form, setForm] = useState<IdentificacaoForm>({ nome: "", matricula: "" });
  /** Indica se a requisição está em andamento */
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /**
   * Processa o formulário de identificação.
   * Valida os dados e envia para a API.
   */
  const handleIdentificacao = async (): Promise<void> => {
    const parsed = IdentificacaoRequestSchema.safeParse(form);

    if (!parsed.success) {
      Alert.alert("Validação", "Preencha nome e matrícula.");
      return;
    }

    setLoading(true);
    try {
      await api.identificar(parsed.data);
      router.replace("/(tabs)/quadro");
    } catch (error) {
      Alert.alert("Erro", error instanceof Error ? error.message : "Não foi possível realizar a identificação. Tente novamente.");
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

/** Estilos da tela de identificação */
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
