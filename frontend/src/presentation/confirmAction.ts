import { Alert, Platform } from "react-native";

type ConfirmOptions = { title: string; message: string; confirmLabel: string; destructive?: boolean; onConfirm: () => void };

export function confirmAction({ title, message, confirmLabel, destructive, onConfirm }: ConfirmOptions): void {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancelar", style: "cancel" },
    { text: confirmLabel, style: destructive ? "destructive" : "default", onPress: onConfirm },
  ]);
}
