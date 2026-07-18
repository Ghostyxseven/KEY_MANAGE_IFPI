import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { listarAuditoria, type EventoAuditoria } from "../../src/services/audit";
import { EmptyState, LoadingState, Screen, ScreenHeader, StatusPill, Surface } from "../../src/presentation/components/Screen";
import { colors, spacing } from "../../src/presentation/theme";
import { showToast } from "../../src/presentation/components/Toast";

export default function AuditoriaScreen(): React.ReactElement {
  const [eventos, setEventos] = useState<EventoAuditoria[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async (): Promise<void> => {
    setCarregando(true);
    try {
      setEventos(await listarAuditoria());
    } catch {
      showToast("Não foi possível carregar a auditoria.", "error");
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback((): void => { void carregar(); }, [carregar]));

  return (
    <Screen>
      <ScreenHeader eyebrow="Administração" title="Auditoria" description="Últimas ações administrativas registradas de forma imutável." />
      {carregando ? <LoadingState label="Carregando eventos..." /> : (
        <FlatList
          data={eventos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          renderItem={({ item }): React.ReactElement => (
            <Surface style={s.card}>
              <View style={s.top}><Text style={s.action}>{item.acao}</Text><StatusPill label="Registrado" tone="success" /></View>
              <Text style={s.detail}>{item.detalhes}</Text>
              <Text style={s.meta}>{new Date(item.criadoEm).toLocaleString("pt-BR")} • {item.autorUid}</Text>
            </Surface>
          )}
          ListEmptyComponent={<EmptyState icon="clipboard-text-clock-outline" title="Nenhuma ação registrada" description="Os eventos administrativos aparecerão aqui quando forem realizados." />}
        />
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  list: { gap: spacing.md, paddingBottom: 32 },
  card: { gap: spacing.sm },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md },
  action: { color: colors.brand, fontSize: 16, fontWeight: "900", flex: 1 },
  detail: { color: colors.text, lineHeight: 20 },
  meta: { color: colors.muted, fontSize: 12 },
});
