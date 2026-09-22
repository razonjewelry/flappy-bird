import { browserLocalPersistence, indexedDBLocalPersistence } from 'firebase/auth';

// getReactNativePersistence לא קיים בגרסת הווב של Firebase - קריאה לו שם
// מפילה את האפליקציה למסך לבן. בדפדפן משתמשים באחסון של הדפדפן עצמו.
// initializeAuth מקבל רשימה לפי סדר עדיפות ונופל לשנייה אם הראשונה חסומה
// (למשל בגלישה פרטית).
export const authPersistence = [indexedDBLocalPersistence, browserLocalPersistence];
