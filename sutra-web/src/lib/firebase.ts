import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from "firebase/app";
import { getPublicEnv } from "./publicEnv";

const publicEnv = getPublicEnv();
const firebaseConfig: FirebaseOptions = {
  apiKey: publicEnv.firebaseApiKey,
  authDomain: publicEnv.firebaseAuthDomain,
  projectId: publicEnv.firebaseProjectId,
  storageBucket: publicEnv.firebaseStorageBucket,
  messagingSenderId: publicEnv.firebaseMessagingSenderId,
  appId: publicEnv.firebaseAppId,
};

const hasConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

export const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(
      hasConfig
        ? firebaseConfig
        : {
            apiKey: "missing",
            authDomain: "missing",
            projectId: "missing",
            storageBucket: "missing",
            messagingSenderId: "missing",
            appId: "missing",
          }
    );
