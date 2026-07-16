import { useEffect } from "react";
import { router } from "expo-router";

export default function IndexRedirect(): null {
  useEffect(() => {
    router.replace("/identificacao");
  }, []);

  return null;
}