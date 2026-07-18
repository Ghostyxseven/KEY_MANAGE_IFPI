import type { ComponentProps } from "react";
import { ActivityIndicator, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, layout, radius, shadows, spacing } from "../theme";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }): React.ReactElement {
  return <View style={[s.screen, style]}><View style={s.content}>{children}</View></View>;
}

export function ScreenHeader({ eyebrow, title, description, trailing }: { eyebrow?: string; title: string; description?: string; trailing?: React.ReactNode }): React.ReactElement {
  return <View style={s.header}><View style={s.heading}>{eyebrow ? <Text style={s.eyebrow}>{eyebrow}</Text> : null}<Text style={s.title}>{title}</Text>{description ? <Text style={s.description}>{description}</Text> : null}</View>{trailing}</View>;
}

export function Surface({ children, style }: { children: React.ReactNode; style?: ViewStyle }): React.ReactElement {
  return <View style={[s.surface, style]}>{children}</View>;
}

export function EmptyState({ icon = "inbox-outline", title, description, action }: { icon?: IconName; title: string; description: string; action?: React.ReactNode }): React.ReactElement {
  return <View style={s.empty}><View style={s.emptyIcon}><MaterialCommunityIcons name={icon} size={28} color={colors.brand} /></View><Text style={s.emptyTitle}>{title}</Text><Text style={s.emptyDescription}>{description}</Text>{action}</View>;
}

export function LoadingState({ label = "Carregando..." }: { label?: string }): React.ReactElement {
  return <View style={s.loading}><ActivityIndicator color={colors.brand} /><Text style={s.loadingText}>{label}</Text></View>;
}

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" | "danger" }): React.ReactElement {
  return <View style={[s.pill, s[`${tone}Pill`]]}><View style={[s.dot, s[`${tone}Dot`]]} /><Text style={[s.pillText, s[`${tone}Text`]]}>{label}</Text></View>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingHorizontal: layout.pagePadding },
  content: { width: "100%", maxWidth: layout.contentMaxWidth, alignSelf: "center", flex: 1 },
  header: { paddingTop: spacing.xl, paddingBottom: spacing.lg, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.lg },
  heading: { flex: 1, gap: spacing.xs }, eyebrow: { color: colors.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" },
  title: { color: colors.text, fontSize: 28, lineHeight: 34, fontWeight: "900" }, description: { color: colors.muted, fontSize: 14, lineHeight: 21, maxWidth: 680 },
  surface: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, ...shadows.card },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 42, paddingHorizontal: spacing.xl, gap: spacing.sm },
  emptyIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: colors.brandSoft, alignItems: "center", justifyContent: "center", marginBottom: spacing.xs },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "800", textAlign: "center" }, emptyDescription: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: "center", maxWidth: 420, marginBottom: spacing.sm },
  loading: { paddingVertical: 48, alignItems: "center", justifyContent: "center", gap: spacing.md }, loadingText: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  pill: { minHeight: 28, borderRadius: radius.pill, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" },
  neutralPill: { backgroundColor: colors.brandSoft }, successPill: { backgroundColor: colors.successSoft }, warningPill: { backgroundColor: colors.warningSoft }, dangerPill: { backgroundColor: colors.dangerSoft },
  dot: { width: 7, height: 7, borderRadius: 4 }, neutralDot: { backgroundColor: colors.brand }, successDot: { backgroundColor: colors.success }, warningDot: { backgroundColor: colors.warning }, dangerDot: { backgroundColor: colors.danger },
  pillText: { fontSize: 12, fontWeight: "800" }, neutralText: { color: colors.brand }, successText: { color: colors.success }, warningText: { color: colors.warning }, dangerText: { color: colors.danger },
});
