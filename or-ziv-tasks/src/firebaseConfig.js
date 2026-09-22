// ההגדרות של פרויקט or-ziv-tasks ב-Firebase.
// מקור: console.firebase.google.com → Project settings → Your apps → tasks
//
// הערכים האלה אינם סוד. בכל אפליקציית Web או מובייל הם מגיעים ממילא
// למכשיר של המשתמש. מה שמגן על הנתונים הוא חוקי האבטחה שב-firestore.rules.
export const firebaseConfig = {
  apiKey: 'AIzaSyBSE2Q7PubbvzQ6b-illrdxwxeWLDH5k7A',
  authDomain: 'or-ziv-tasks.firebaseapp.com',
  projectId: 'or-ziv-tasks',
  storageBucket: 'or-ziv-tasks.firebasestorage.app',
  messagingSenderId: '27141284773',
  appId: '1:27141284773:web:2bcaa9d185479707d8be4c',
};

export const isFirebaseConfigured = !String(firebaseConfig.apiKey).includes('REPLACE_ME');
