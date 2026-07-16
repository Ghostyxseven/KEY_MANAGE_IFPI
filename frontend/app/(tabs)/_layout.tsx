import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * Layout de abas (tabs) da aplicação.
 * Define as duas abas principais: Chaves (quadro) e Histórico.
 * @returns Componente de navegação por abas configurado
 */
export default function TabLayout(): React.ReactNode {
  return (
    <Tabs>
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
    </Tabs>
  );
}
