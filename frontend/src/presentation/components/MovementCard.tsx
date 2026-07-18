import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "./AppButton";
import { colors, shadows } from "../theme";

type Props = { kind: "retirada" | "devolucao"; codigo: string; nome: string; matricula: string; loading: boolean; onConfirm: () => void };

export function MovementCard({ kind, codigo, nome, matricula, loading, onConfirm }: Props): React.ReactElement {
  const retirada = kind === "retirada";
  return <ScrollView style={s.page}><View style={s.content}><Text style={s.kicker}>{retirada ? "SAÍDA DE CHAVE" : "RETORNO DE CHAVE"}</Text><Text style={s.title}>{retirada ? "Confirmar retirada" : "Confirmar devolução"}</Text><Text style={s.subtitle}>Revise os dados antes de concluir a movimentação.</Text>
    <View style={[s.keyCard, { backgroundColor: retirada ? colors.warningSoft : colors.successSoft }]}><Text style={s.keyLabel}>CHAVE SELECIONADA</Text><Text style={[s.keyCode, { color: retirada ? colors.warning : colors.success }]}>{codigo}</Text><Text style={s.keyState}>{retirada ? "Será marcada como em uso" : "Voltará a ficar disponível"}</Text></View>
    <View style={s.operator}><View style={s.avatar}><Text style={s.avatarText}>{nome.charAt(0).toUpperCase()}</Text></View><View><Text style={s.operatorLabel}>OPERADOR AUTENTICADO</Text><Text style={s.operatorName}>{nome}</Text><Text style={s.operatorMeta}>Matrícula {matricula}</Text></View></View>
    <AppButton label={retirada ? "Confirmar retirada" : "Confirmar devolução"} variant={retirada ? "primary" : "secondary"} onPress={onConfirm} loading={loading} />
    <Text style={s.note}>A data, a hora e o dispositivo serão registrados automaticamente.</Text>
  </View></ScrollView>;
}

const s = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.background, padding: 20 }, content: { width: "100%", maxWidth: 560, alignSelf: "center", gap: 14 }, kicker: { color: colors.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1.3, marginTop: 8 }, title: { color: colors.text, fontSize: 28, fontWeight: "800" }, subtitle: { color: colors.muted, marginBottom: 6 }, keyCard: { borderRadius: 22, padding: 24, alignItems: "center", gap: 5, borderWidth: 1, borderColor: colors.border, ...shadows.card }, keyLabel: { color: colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 }, keyCode: { fontSize: 42, fontWeight: "900" }, keyState: { color: colors.muted, fontSize: 13 }, operator: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border }, avatar: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.brandSoft, alignItems: "center", justifyContent: "center" }, avatarText: { color: colors.brand, fontSize: 18, fontWeight: "900" }, operatorLabel: { color: colors.brand, fontSize: 10, fontWeight: "800", letterSpacing: 1 }, operatorName: { color: colors.text, fontSize: 16, fontWeight: "800" }, operatorMeta: { color: colors.muted, fontSize: 13 }, note: { color: colors.muted, fontSize: 12, textAlign: "center", lineHeight: 18 } });
