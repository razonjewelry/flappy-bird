import AsyncStorage from '@react-native-async-storage/async-storage';

// המזהה (id) הוא מה שנשמר במסד הנתונים, השם הוא רק לתצוגה.
// כך אפשר לשנות שם בלי לשבור משימות קיימות.
export const USERS = [
  { id: 'or', name: 'אור', color: '#DBEAFE', textColor: '#1E40AF' },
  { id: 'ziv', name: 'זיו', color: '#FFEDD5', textColor: '#9A3412' },
];

export function getUser(id) {
  return USERS.find((u) => u.id === id) ?? null;
}

const STORAGE_KEY = 'currentUserId:v1';

export async function loadCurrentUserId() {
  try {
    const id = await AsyncStorage.getItem(STORAGE_KEY);
    return getUser(id) ? id : null;
  } catch {
    return null;
  }
}

export async function saveCurrentUserId(id) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, id);
  } catch {
    // אם השמירה נכשלה המשתמש פשוט ייבחר שוב בפתיחה הבאה - לא שווה לקרוס בגלל זה.
  }
}

export async function clearCurrentUserId() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ראה הערה למעלה.
  }
}
