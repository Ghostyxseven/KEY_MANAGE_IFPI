import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RegistroMovimentacaoRequestSchema, CodigoChaveSchema } from "../../src/specs/schemas/chaves.schema";
import { api } from "../../src/services/api";
import { storage } from "../../src/services/storage";
import { useApp } from "../../src/context/AppContext";
import { AppButton } from "../../src/presentation/components/AppButton";
import { MovementCard } from "../../src/presentation/components/MovementCard";
import { colors } from "../../src/presentation/theme";
import { showToast } from "../../src/presentation/components/Toast";

export default function DevolucaoScreen(): React.ReactNode {
  const params = useLocalSearchParams<{ codigo: string }>();
  const codigoRaw = typeof params.codigo === "string" ? decodeURIComponent(params.codigo) : params.codigo;
  const codigoValidado = CodigoChaveSchema.safeParse(codigoRaw);
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
      showToast("Preencha todos os campos obrigatórios.", "warning");
      return;
    }

    setEnviando(true);
    try {
      await api.devolverChave(codigo, parsed.data);
      showToast("Devolução registrada com sucesso.", "success");
      router.back();
    } catch (error) {
      if (error instanceof Error && "status" in error && (error as Error & { status: number }).status === 409) {
        showToast(error.message ?? "Esta chave já está disponível.", "warning");
        return;
      }
      showToast("Não foi possível registrar a devolução.", "error");
    } finally {
      setEnviando(false);
    }
  };

  if (!codigo) {
    return <View style={styles.container}><Text style={styles.title}>Código de chave inválido.</Text><AppButton label="Voltar" onPress={() => router.back()} /></View>;
  }

  return (
    <MovementCard kind="devolucao" codigo={codigo} nome={nomeGuarda} matricula={matriculaGuarda} loading={enviando} onConfirm={() => void handleDevolucao()} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  operador: { backgroundColor: "#eff6ff", borderRadius: 8, padding: 12, gap: 3 },
  operadorLabel: { color: "#1d4ed8", fontWeight: "700" },
});
