import { useEffect } from "react";
import { router } from "expo-router";

/**
 * Componente de redirecionamento da página inicial.
 * Redireciona automaticamente para a tela do quadro de chaves.
 * @returns null (componente não renderiza nada)
 */
export default function IndexRedirect(): null {
  useEffect(() => {
    router.replace("/(tabs)/quadro");
  }, []);

  return null;
}