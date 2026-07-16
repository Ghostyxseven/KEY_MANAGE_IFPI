import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack, router, useSegments } from "expo-router";
import { AppProvider, useApp } from "../src/context/AppContext";
import SplashScreen from "../src/presentation/components/SplashScreen";

/**
 * Layout principal da aplicação.
 * Configura a navegação por stack com todas as rotas do aplicativo.
 * @returns Componente de layout com navegação configurada
 */
function RotasProtegidas(): React.ReactElement {
  const { autenticado, carregandoSessao, perfil } = useApp();
  const segments = useSegments();
  const emIdentificacao = segments[0] === "identificacao";
  const emAdmin = segments[0] === "admin";

  useEffect(() => {
    if (carregandoSessao) return;
    if (!autenticado && !emIdentificacao && !emAdmin) router.replace("/identificacao");
    if (autenticado && perfil === "guarda" && (emIdentificacao || emAdmin)) router.replace("/(tabs)/quadro");
    if (autenticado && perfil === "admin" && !emAdmin) router.replace("/admin");
  }, [autenticado, carregandoSessao, emAdmin, emIdentificacao, perfil]);

  if (carregandoSessao) return <SplashScreen />;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ title: "Administração" }} />
      <Stack.Screen name="identificacao" options={{ title: "Identificação" }} />
      <Stack.Screen name="retirada/[codigo]" options={{ title: "Retirada" }} />
      <Stack.Screen name="devolucao/[codigo]" options={{ title: "Devolução" }} />
      <Stack.Screen name="historico/[codigo]" options={{ title: "Histórico" }} />
    </Stack>
  );
}

export default function RootLayout(): React.ReactElement {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppProvider><RotasProtegidas /></AppProvider>
    </SafeAreaProvider>
  );
}
