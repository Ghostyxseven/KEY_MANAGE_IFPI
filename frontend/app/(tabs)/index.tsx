import { useEffect } from "react";
import { router } from "expo-router";

export default function TabsIndexRedirect(): null {
  useEffect(() => {
    router.replace("/(tabs)/quadro");
  }, []);

  return null;
}