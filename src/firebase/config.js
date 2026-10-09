import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 👉 Firebase console > Project settings > Your apps > Web app (</>) config එක මෙතනට paste කරන්න
const firebaseConfig = {
  apiKey: "AIzaSyAQFSUX78Ygt2rUHAMYzEg65tmUTz53NdE",
  authDomain: "dineflow-9a2d0.firebaseapp.com",
  projectId: "dineflow-9a2d0",
  storageBucket: "dineflow-9a2d0.firebasestorage.app",
  messagingSenderId: "572149733104",
  appId: "1:572149733104:web:88ba49e865c095ef745435"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch (e) {
  auth = getAuth(app); // fast-refresh වලදී දෙපාරක් init වෙන එක වළක්වනවා
}

export { auth };
export const db = getFirestore(app);
