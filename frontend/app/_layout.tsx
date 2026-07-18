import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack, router, useSegments } from "expo-router";
import { AppProvider, useApp } from "../src/context/AppContext";
import { ToastProvider } from "../src/presentation/components/Toast";
import SplashScreen from "../src/presentation/components/SplashScreen";
import { colors } from "../src/presentation/theme";
import { registrarSincronizacaoEmSegundoPlano } from "../src/services/backgroundSync";

/**
 * Layout principal da aplicação.
 * Configura a navegação por stack com todas as rotas do aplicativo.
 * @returns Componente de layout com navegação configurada
 */
function RotasProtegidas(): React.ReactElement {
  const { autenticado, carregandoSessao, perfil } = useApp();
  const segments = useSegments();
  const emIdentificacao = segments[0] === "identificacao";
  const emAdmin = segments[0] === "admin-login";

  useEffect(() => {
    if (carregandoSessao) return;
    if (!autenticado && !emIdentificacao && !emAdmin) router.replace("/identificacao");
    if (autenticado && perfil === "guarda" && (emIdentificacao || emAdmin)) router.replace("/(tabs)/quadro");
    if (autenticado && perfil === "admin" && (emIdentificacao || emAdmin)) router.replace("/(tabs)/painel");
  }, [autenticado, carregandoSessao, emAdmin, emIdentificacao, perfil]);

  if (carregandoSessao) return <SplashScreen />;

  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.brandDark, headerTitleStyle: { fontWeight: "800" }, headerShadowVisible: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="admin-login" options={{ title: "Acesso Admin", headerShown: false }} />
      <Stack.Screen name="identificacao" options={{ title: "Identificação", headerShown: false }} />
      <Stack.Screen name="retirada/[codigo]" options={{ title: "Retirada" }} />
      <Stack.Screen name="devolucao/[codigo]" options={{ title: "Devolução" }} />
      <Stack.Screen name="historico/[codigo]" options={{ title: "Histórico" }} />
    </Stack>
  );
}

export default function RootLayout(): React.ReactElement {
  useEffect(() => { void registrarSincronizacaoEmSegundoPlano(); }, []);
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppProvider><ToastProvider><RotasProtegidas /></ToastProvider></AppProvider>
    </SafeAreaProvider>
  );
}
