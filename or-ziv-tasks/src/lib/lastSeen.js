import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'lastSeenAt:v1';

// נשמר במכשיר ולא בענן: "מתי אני ראיתי לאחרונה" הוא נתון אישי לכל מכשיר,
// ולא משהו ששני המשתמשים צריכים לחלוק.

export async function readLastSeen() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export async function markSeen() {
  try {
    await AsyncStorage.setItem(KEY, String(Date.now()));
  } catch {
    // לכל היותר משימות יסומנו כחדשות פעם נוספת.
  }
}
