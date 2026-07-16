import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { Platform } from "react-native";

type FirebaseEnv = "EXPO_PUBLIC_FIREBASE_API_KEY" | "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN" | "EXPO_PUBLIC_FIREBASE_PROJECT_ID" | "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET" | "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" | "EXPO_PUBLIC_FIREBASE_APP_ID";
function env(nome: FirebaseEnv): string { const valor = process.env[nome]; if (!valor) throw new Error(`Configuração Firebase ausente: ${nome}`); return valor; }
export function firebaseConfig(): FirebaseOptions { return { apiKey: env("EXPO_PUBLIC_FIREBASE_API_KEY"), authDomain: env("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"), projectId: env("EXPO_PUBLIC_FIREBASE_PROJECT_ID"), storageBucket: env("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"), messagingSenderId: env("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"), appId: env("EXPO_PUBLIC_FIREBASE_APP_ID") }; }
function persistentAuth(app: FirebaseApp): Auth { if (Platform.OS === "web") return getAuth(app); try { return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) }); } catch { return getAuth(app); } }
let services: { app: FirebaseApp; auth: Auth; db: Firestore } | undefined;
export function firebaseServices(): { app: FirebaseApp; auth: Auth; db: Firestore } { if (services) return services; const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig()); services = { app, auth: persistentAuth(app), db: getFirestore(app) }; return services; }
