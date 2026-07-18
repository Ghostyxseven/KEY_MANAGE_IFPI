import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";
import { useApp } from "../../src/context/AppContext";
import { colors } from "../../src/presentation/theme";

/**
 * Layout de abas (tabs) da aplicação.
 * Define as duas abas principais: Chaves (quadro) e Histórico.
 * @returns Componente de navegação por abas configurado
 */
export default function TabLayout(): React.ReactNode {
  const { sair, perfil } = useApp();
  return (
    <Tabs screenOptions={{ headerStyle: styles.header, headerTitleStyle: styles.headerTitle, headerShadowVisible: false, headerRight: () => <Pressable accessibilityRole="button" accessibilityLabel="Sair do sistema" style={styles.exit} onPress={() => void sair()}><MaterialCommunityIcons name="logout" size={17} color={colors.brand} /><Text style={styles.exitText}>Sair</Text></Pressable>, tabBarActiveTintColor: colors.brand, tabBarInactiveTintColor: colors.muted, tabBarStyle: styles.tabBar, tabBarLabelStyle: styles.tabLabel }}>
      <Tabs.Screen
        name="quadro"
        options={{
          title: "Chaves",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="key-variant" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: "Histórico",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="history" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pendencias"
        options={{
          title: "Pendências",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cloud-sync" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="painel"
        options={{
          title: "Admin",
          href: perfil === "admin" ? "/painel" : null,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="shield-account" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.surface }, headerTitle: { color: colors.brandDark, fontWeight: "800" }, exit: { marginRight: 16, paddingHorizontal: 12, minHeight: 38, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.brandSoft }, exitText: { color: colors.brand, fontWeight: "700" },
  tabBar: { height: 68, paddingTop: 7, paddingBottom: 8, borderTopColor: colors.border, backgroundColor: colors.surface }, tabLabel: { fontSize: 12, fontWeight: "700" },
});
