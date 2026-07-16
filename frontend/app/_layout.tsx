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
  const { autenticado, carregandoSessao } = useApp();
  const segments = useSegments();
  const emIdentificacao = segments[0] === "identificacao";

  useEffect(() => {
    if (carregandoSessao) return;
    if (!autenticado && !emIdentificacao) router.replace("/identificacao");
    if (autenticado && emIdentificacao) router.replace("/(tabs)/quadro");
  }, [autenticado, carregandoSessao, emIdentificacao]);

  if (carregandoSessao) return <SplashScreen />;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
