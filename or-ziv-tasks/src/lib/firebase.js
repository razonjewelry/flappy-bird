import { initializeApp } from 'firebase/app';
import { initializeAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

import { firebaseConfig } from '../firebaseConfig';
import { authPersistence } from './authPersistence';

const app = initializeApp(firebaseConfig);

// ההתמדה מגיעה מקובץ נפרד לכל פלטפורמה: AsyncStorage בנייד, אחסון
// הדפדפן בווב. ראה authPersistence.native.js ו-authPersistence.web.js.
export const auth = initializeAuth(app, { persistence: authPersistence });

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
