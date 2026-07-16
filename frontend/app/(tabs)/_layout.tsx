import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "react-native";
import { useApp } from "../../src/context/AppContext";

/**
 * Layout de abas (tabs) da aplicação.
 * Define as duas abas principais: Chaves (quadro) e Histórico.
 * @returns Componente de navegação por abas configurado
 */
export default function TabLayout(): React.ReactNode {
  const { sair } = useApp();
  return (
    <Tabs screenOptions={{ headerRight: () => <Button title="Sair" onPress={() => void sair()} /> }}>
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
