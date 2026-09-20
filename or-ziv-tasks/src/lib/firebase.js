import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import {
  getReactNativePersistence,
  initializeAuth,
  onAuthStateChanged,
  signInAnonymously,
} from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

import { firebaseConfig } from '../firebaseConfig';

const app = initializeApp(firebaseConfig);

// getReactNativePersistence שומר את ההתחברות ב-AsyncStorage,
// כך שלא מתחברים מחדש בכל פתיחה של האפליקציה.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// autoDetectLongPolling פותר ניתוקים של Firestore ברשתות סלולריות
// ומאחורי פרוקסי, שזו תקלה נפוצה ב-React Native.
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

// התחברות אנונימית: המשתמש לא רואה שום מסך התחברות, אבל לכל מכשיר
// יש זהות אמיתית מול Firebase - וזה מה שמאפשר לנעול את הנתונים בחוקי האבטחה.
export function ensureSignedIn() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          unsubscribe();
          resolve(user);
        }
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );

    signInAnonymously(auth).catch((error) => {
      unsubscribe();
      reject(error);
    });
  });
}
