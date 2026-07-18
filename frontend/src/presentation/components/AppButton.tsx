import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { colors } from "../theme";

type Props = { label: string; onPress: () => void; disabled?: boolean; loading?: boolean; variant?: "primary" | "secondary" | "danger" | "ghost"; style?: ViewStyle };

export function AppButton({ label, onPress, disabled, loading, variant = "primary", style }: Props): React.ReactElement {
  const inactive = [disabled, loading].some(Boolean);
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: inactive }} disabled={inactive} onPress={onPress} style={({ pressed }) => [styles.base, styles[variant], inactive && styles.disabled, pressed && !inactive && styles.pressed, style]}>
    {loading ? <ActivityIndicator color={variant === "ghost" ? colors.brand : "#FFFFFF"} /> : <Text style={[styles.label, variant === "ghost" && styles.ghostLabel]}>{label}</Text>}
  </Pressable>;
}

const styles = StyleSheet.create({
  base: { minHeight: 48, borderRadius: 14, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
  primary: { backgroundColor: colors.brand }, secondary: { backgroundColor: colors.success }, danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: colors.brandSoft, borderWidth: 1, borderColor: "#C8DAEC" }, disabled: { opacity: 0.45 }, pressed: { opacity: 0.82 },
  label: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" }, ghostLabel: { color: colors.brand },
});
