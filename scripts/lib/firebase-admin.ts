import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

type FirebaseAdminOptions = {
  useEmulator?: boolean;
};

export function initializeFirebaseAdmin(
  options: FirebaseAdminOptions = {},
): void {
  if (getApps().length) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID nao foi configurado.");
  }

  if (options.useEmulator) {
    initializeApp({ projectId });
    return;
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if ((clientEmail && !privateKey) || (!clientEmail && privateKey)) {
    throw new Error(
      "FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY devem ser configurados juntos.",
    );
  }

  const credential = clientEmail && privateKey
    ? cert({ projectId, clientEmail, privateKey })
    : applicationDefault();

  initializeApp({ projectId, credential });
}
