// ⚠️ מלא כאן את הפרטים מהפרויקט שלך ב-Firebase.
// איפה מוצאים: console.firebase.google.com → הפרויקט שלך → ⚙️ Project settings
// → גוללים ל-"Your apps" → בוחרים את אפליקציית ה-Web → מעתיקים את firebaseConfig.
//
// הערה: המפתחות האלה אינם סוד. הם נועדו להיות גלויים בצד הלקוח,
// וההגנה האמיתית מגיעה מחוקי האבטחה של Firestore (ראה firestore.rules).
export const firebaseConfig = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME.firebaseapp.com',
  projectId: 'REPLACE_ME',
  storageBucket: 'REPLACE_ME.appspot.com',
  messagingSenderId: 'REPLACE_ME',
  appId: 'REPLACE_ME',
};

export const isFirebaseConfigured = !String(firebaseConfig.apiKey).includes('REPLACE_ME');
