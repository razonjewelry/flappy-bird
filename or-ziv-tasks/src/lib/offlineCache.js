import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'tasksMirror:v1';

// למה זה קיים:
// ה-SDK של Firebase ל-JavaScript שומר מטמון בזיכרון בלבד כשהוא רץ ב-React Native.
// כלומר בפתיחה מחדש של האפליקציה בלי אינטרנט הרשימה הייתה נראית ריקה.
// לכן אנחנו מחזיקים עותק משלנו ב-AsyncStorage ומציגים אותו מיד בהפעלה,
// עד שהנתונים האמיתיים מגיעים מהשרת ודורסים אותו.

export async function readMirror() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeMirror(tasks) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // מטמון בלבד. אם הכתיבה נכשלה, האפליקציה עדיין עובדת מול Firestore.
  }
}
