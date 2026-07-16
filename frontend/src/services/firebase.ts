import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import googleServices from "../../google-services.json";

const googleClient = googleServices.client[0];

export function firebaseConfig(): FirebaseOptions {
  const apiKey = googleClient?.api_key[0]?.current_key;
  const appId = googleClient?.client_info.mobilesdk_app_id;
  if (!apiKey || !appId) throw new Error("Configuração Firebase inválida.");
  return {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? apiKey,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
      ?? `${googleServices.project_info.project_id}.firebaseapp.com`,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? googleServices.project_info.project_id,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? googleServices.project_info.storage_bucket,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
      ?? googleServices.project_info.project_number,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? appId,
  };
}

let services: { app: FirebaseApp; auth: Auth; db: Firestore } | undefined;

export function firebaseServices(): { app: FirebaseApp; auth: Auth; db: Firestore } {
  if (services) return services;
  const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig());
  services = { app, auth: getAuth(app), db: getFirestore(app) };
  return services;
}
