import type { ReactElement } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";

export default function RootLayout(): ReactElement {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="identificacao" options={{ title: "Identificação" }} />
        <Stack.Screen name="retirada/[codigo]" options={{ title: "Retirada" }} />
        <Stack.Screen name="devolucao/[codigo]" options={{ title: "Devolução" }} />
        <Stack.Screen name="historico/[codigo]" options={{ title: "Histórico" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
