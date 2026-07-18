import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, Animated, Platform, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, shadows } from "../../src/presentation/theme";
import { useApp } from "../../src/context/AppContext";
import { api } from "../../src/services/api";
import { listarGuardas } from "../../src/services/auth";
import { EmptyState, Screen, ScreenHeader } from "../../src/presentation/components/Screen";
import { showToast } from "../../src/presentation/components/Toast";

function AnimatedCard({ children, onPress, delay = 0 }: { children: React.ReactNode; onPress: () => void; delay?: number }): React.ReactElement {
  const scale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay, useNativeDriver: Platform.OS !== "web" }),
    ]).start();
  }, []);

  const onPressIn = (): void => Animated.spring(scale, { toValue: 0.96, useNativeDriver: Platform.OS !== "web" }).start();
  const onPressOut = (): void => Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: Platform.OS !== "web" }).start();

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale }] }}>
      <Pressable style={styles.card} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function AdminScreen(): React.ReactNode {
  const router = useRouter();
  const { perfil } = useApp();
  const [totalChaves, setTotalChaves] = useState<number | null>(null);
  const [totalGuardas, setTotalGuardas] = useState<number | null>(null);
  const [guardasAtivos, setGuardasAtivos] = useState<number | null>(null);
  const [chavesEmUso, setChavesEmUso] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [chaves, guardas] = await Promise.all([api.listarChaves(), listarGuardas()]);
      setTotalChaves(chaves.length);
      setChavesEmUso(chaves.filter((c) => c.status === "em_uso").length);
      setTotalGuardas(guardas.length);
      setGuardasAtivos(guardas.filter((g) => g.ativo).length);
    } catch {
      showToast("Não foi possível atualizar os indicadores.", "error");
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void carregar(); }, [carregar]));

  if (perfil !== "admin") {
    return (
      <Screen><EmptyState icon="shield-lock-outline" title="Acesso restrito" description="Esta área está disponível somente para administradores ativos." /></Screen>
    );
  }

  return (
    <Screen><ScrollView contentContainerStyle={styles.scrollContent}>
      <ScreenHeader eyebrow="Administração" title="Painel de controle" description="Acompanhe a operação e acesse rapidamente as áreas de gestão." />

      {/* Contadores */}
      <View style={styles.counters}>
        <View style={[styles.counterCard, { borderLeftColor: colors.brand }]}>
          {carregando ? <ActivityIndicator size="small" /> : <Text style={[styles.counterValue, { color: colors.brand }]}>{totalChaves ?? "—"}</Text>}
          <Text style={styles.counterLabel}>Chaves</Text>
        </View>
        <View style={[styles.counterCard, { borderLeftColor: "#dc2626" }]}>
          {carregando ? <ActivityIndicator size="small" /> : <Text style={[styles.counterValue, { color: "#dc2626" }]}>{chavesEmUso ?? "—"}</Text>}
          <Text style={styles.counterLabel}>Em uso</Text>
        </View>
        <View style={[styles.counterCard, { borderLeftColor: colors.success }]}>
          {carregando ? <ActivityIndicator size="small" /> : <Text style={[styles.counterValue, { color: colors.success }]}>{guardasAtivos ?? "—"}</Text>}
          <Text style={styles.counterLabel}>Guardas ativos</Text>
        </View>
      </View>

      {/* Cards de ação */}
      <View style={styles.grid}>
        <AnimatedCard onPress={() => router.push("/admin/guardas")} delay={100}>
          <View style={[styles.iconContainer, { backgroundColor: colors.brandSoft }]}>
            <MaterialCommunityIcons name="shield-account" size={32} color={colors.brand} />
          </View>
          <Text style={styles.cardTitle}>Gerenciar Guardas</Text>
          <Text style={styles.cardDesc}>Adicionar, editar ou inativar perfis de acesso</Text>
          {totalGuardas !== null && <Text style={styles.cardBadge}>{totalGuardas} cadastrados</Text>}
        </AnimatedCard>

        <AnimatedCard onPress={() => router.push("/admin/chaves")} delay={200}>
          <View style={[styles.iconContainer, { backgroundColor: "#fef3c7" }]}>
            <MaterialCommunityIcons name="key-variant" size={32} color="#d97706" />
          </View>
          <Text style={styles.cardTitle}>Gerenciar Chaves</Text>
          <Text style={styles.cardDesc}>Cadastrar, editar ou remover chaves do quadro</Text>
          {totalChaves !== null && <Text style={styles.cardBadge}>{totalChaves} cadastradas</Text>}
        </AnimatedCard>
        <AnimatedCard onPress={() => router.push("/admin/auditoria")} delay={300}>
          <View style={[styles.iconContainer, { backgroundColor: colors.brandSoft }]}><MaterialCommunityIcons name="clipboard-text-clock" size={32} color={colors.brand} /></View>
          <Text style={styles.cardTitle}>Auditoria</Text>
          <Text style={styles.cardDesc}>Consultar as últimas ações administrativas</Text>
        </AnimatedCard>
      </View>
    </ScrollView></Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 32 },
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 18, color: colors.danger, fontWeight: "bold" },
  hero: { paddingVertical: 12, gap: 4, marginBottom: 16, paddingHorizontal: 8 },
  heroEyebrow: { color: colors.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1.3 },
  heroTitle: { color: colors.text, fontSize: 27, fontWeight: "800" },
  heroSubtitle: { color: colors.muted, fontSize: 14 },
  counters: { flexDirection: "row", gap: 8, marginBottom: 20 },
  counterCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderLeftWidth: 4, ...shadows.card },
  counterValue: { fontSize: 22, fontWeight: "900" },
  counterLabel: { fontSize: 11, color: colors.muted, fontWeight: "600" },
  grid: { gap: 16, width: "100%", maxWidth: 900, alignSelf: "center" },
  card: {
    backgroundColor: colors.surface, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: colors.border, ...shadows.card,
    flexDirection: "column", alignItems: "flex-start", gap: 8,
  },
  iconContainer: { padding: 12, borderRadius: 12, marginBottom: 4 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: colors.text },
  cardDesc: { fontSize: 14, color: colors.muted },
  cardBadge: { fontSize: 12, fontWeight: "700", color: colors.brand, backgroundColor: colors.brandSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 4 },
});
