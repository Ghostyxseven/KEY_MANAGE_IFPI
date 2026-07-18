import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";

type ToastType = "success" | "error" | "info" | "warning";
type ToastMessage = { id: number; text: string; type: ToastType };

let globalShow: ((text: string, type?: ToastType) => void) | null = null;

export function showToast(text: string, type: ToastType = "success"): void {
  globalShow?.(text, type);
}

const ICONS: Record<ToastType, string> = { success: "✓", error: "×", info: "i", warning: "!" };
const BG: Record<ToastType, string> = { success: "#065F46", error: "#991B1B", info: "#1E40AF", warning: "#92400E" };

function ToastItem({ msg, onDone }: { msg: ToastMessage; onDone: () => void }): React.ReactElement {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: Platform.OS !== "web" }),
    ]).start();
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: Platform.OS !== "web" }),
        Animated.timing(translateY, { toValue: -30, duration: 300, useNativeDriver: Platform.OS !== "web" }),
      ]).start(onDone);
    }, 2800);
    return (): void => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[s.toast, { backgroundColor: BG[msg.type], opacity, transform: [{ translateY }] }]}>
      <View style={s.iconCircle}><Text style={s.icon}>{ICONS[msg.type]}</Text></View>
      <Text style={s.text} numberOfLines={2}>{msg.text}</Text>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const counter = useRef(0);

  const show = useCallback((text: string, type: ToastType = "success"): void => {
    const id = ++counter.current;
    setMessages((prev) => [...prev.slice(-2), { id, text, type }]);
  }, []);

  useEffect(() => {
    globalShow = show;
    return (): void => { globalShow = null; };
  }, [show]);

  const remove = useCallback((id: number): void => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {children}
      <View style={s.container} pointerEvents="box-none">
        {messages.map((msg) => (
          <ToastItem key={msg.id} msg={msg} onDone={() => remove(msg.id)} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { position: "absolute", top: 60, left: 16, right: 16, zIndex: 9999, alignItems: "center", gap: 8 },
  toast: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 14, borderRadius: 14, gap: 10, maxWidth: 460, width: "100%", shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  iconCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" }, icon: { color: "#fff", fontSize: 15, fontWeight: "900" },
  text: { color: "#fff", fontSize: 14, fontWeight: "600", flex: 1 },
});
