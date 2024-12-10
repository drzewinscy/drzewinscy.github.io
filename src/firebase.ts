import { initializeApp } from 'firebase/app';
import * as fb from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

const db = fb.getDatabase(app);

export const set = async (path: string, value: any) => {
  await fb.set(fb.ref(db, path), value);
}

export const update = async (path: string, value: object) => {
  await fb.update(fb.ref(db, path), value);
}

export const onValue = (path: string, callback: (snapshot: fb.DataSnapshot) => unknown, cancelCallback?: (error: Error) => unknown) => {
  return fb.onValue(fb.ref(db, path), callback, cancelCallback);
}

export const get = async (path: string) => {
  return await fb.get(fb.ref(db, path));
}
