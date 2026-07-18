import { useState, useEffect, useRef } from "react";
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useApp } from "../src/context/AppContext";
import { IdentificacaoRequestSchema } from "../src/specs/schemas/identificacao.schema";
import { AppButton } from "../src/presentation/components/AppButton";
import { showToast } from "../src/presentation/components/Toast";
import { colors, shadows } from "../src/presentation/theme";

export default function IdentificacaoScreen(): React.ReactElement {
  const [form, setForm] = useState({ matricula: "", pin: "" });
  const [loading, setLoading] = useState(false);
  const [mostrarPin, setMostrarPin] = useState(false);
  const router = useRouter();
  const { entrarComoGuarda } = useApp();

  // Animação de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: Platform.OS !== "web" }),
    ]).start();
  }, []);

  const matriculaValida = form.matricula.trim().length >= 1;
  const pinValido = /^\d{6}$/.test(form.pin);

  const entrar = async (): Promise<void> => {
    const parsed = IdentificacaoRequestSchema.safeParse(form);
    if (!parsed.success) {
      showToast("Informe a matrícula e um PIN de 6 dígitos.", "warning");
      return;
    }
    setLoading(true);
    try {
      await entrarComoGuarda(parsed.data.matricula, parsed.data.pin);
      showToast("Login realizado com sucesso!", "success");
      router.replace("/(tabs)/quadro");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Não foi possível entrar.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.brand}>
          <View style={styles.mark}><Text style={styles.markText}>IF</Text></View>
          <View>
            <Text style={styles.brandName}>Controle de Chaves</Text>
            <Text style={styles.brandUnit}>IFPI • Campus Piripiri</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.eyebrow}>ACESSO SEGURO</Text>
        <Text style={styles.title}>Olá, guarda</Text>
        <Text style={styles.subtitle}>Use sua matrícula e o PIN fornecido pela administração.</Text>

        <View style={[styles.inputContainer, matriculaValida && form.matricula.length > 0 && styles.inputValid]}>
          <MaterialCommunityIcons name="card-account-details-outline" size={20} color={matriculaValida && form.matricula.length > 0 ? colors.success : colors.muted} />
          <TextInput
            style={styles.input}
            placeholder="Matrícula"
            placeholderTextColor={colors.muted}
            value={form.matricula}
            onChangeText={(matricula) => setForm({ ...form, matricula })}
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.inputContainer, pinValido && styles.inputValid, form.pin.length > 0 && !pinValido && styles.inputError]}>
          <MaterialCommunityIcons name="lock-outline" size={20} color={pinValido ? colors.success : form.pin.length > 0 ? colors.danger : colors.muted} />
          <TextInput
            style={styles.input}
            placeholder="PIN de 6 dígitos"
            placeholderTextColor={colors.muted}
            value={form.pin}
            onChangeText={(pin) => setForm({ ...form, pin: pin.replace(/\D/g, "") })}
            keyboardType="number-pad"
            secureTextEntry={!mostrarPin}
            maxLength={6}
            onSubmitEditing={() => void entrar()}
          />
          <Pressable onPress={() => setMostrarPin(!mostrarPin)} hitSlop={10}>
            <MaterialCommunityIcons name={mostrarPin ? "eye-off" : "eye"} size={20} color={colors.muted} />
          </Pressable>
        </View>

        <AppButton label="Entrar no sistema" onPress={() => void entrar()} loading={loading} />
        <Pressable onPress={() => router.push("/admin-login")}>
          <Text style={styles.link}>Acessar área administrativa</Text>
        </Pressable>
      </Animated.View>
      <Text style={styles.footer}>CoreTech • Gestão responsável e rastreável</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background }, container: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 24 },
  brand: { width: "100%", maxWidth: 460, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 12 },
  mark: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  markText: { color: "#fff", fontSize: 19, fontWeight: "900" },
  brandName: { color: colors.brandDark, fontSize: 18, fontWeight: "800" },
  brandUnit: { color: colors.muted, fontSize: 13 },
  card: { width: "100%", maxWidth: 460, alignSelf: "center", backgroundColor: colors.surface, borderRadius: 24, padding: 28, gap: 14, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: "800", letterSpacing: 1.4 },
  title: { fontSize: 30, fontWeight: "800", color: colors.text },
  subtitle: { color: colors.muted, lineHeight: 21, marginBottom: 4 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FBFCFE",
    gap: 10,
  },
  inputValid: { borderColor: colors.success, backgroundColor: "#F0FDF4" },
  inputError: { borderColor: colors.danger, backgroundColor: "#FEF2F2" },
  input: { flex: 1, fontSize: 16, color: colors.text, padding: 0 },
  link: { color: colors.brand, textAlign: "center", padding: 8, fontWeight: "700" },
  footer: { color: colors.muted, textAlign: "center", fontSize: 12 },
});
