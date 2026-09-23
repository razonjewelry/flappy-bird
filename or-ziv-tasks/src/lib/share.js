import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

import { dueLabel } from './dates';

const PHONE_KEY = 'partnerPhone:v1';

/** מנקה מספר ישראלי לפורמט הבינלאומי שוואטסאפ מצפה לו. */
export function normalizePhone(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (digits === '') return '';
  if (digits.startsWith('972')) return digits;
  if (digits.startsWith('0')) return `972${digits.slice(1)}`;
  return digits;
}

export async function loadPartnerPhone() {
  try {
    return (await AsyncStorage.getItem(PHONE_KEY)) ?? '';
  } catch {
    return '';
  }
}

export async function savePartnerPhone(raw) {
  try {
    await AsyncStorage.setItem(PHONE_KEY, normalizePhone(raw));
  } catch {
    // אם השמירה נכשלה פשוט ייפתח בוחר אנשי הקשר במקום צ'אט ישיר.
  }
}

export function taskMessage(task) {
  const due = task.dueAt ? ` (${dueLabel(task.dueAt)})` : '';
  return `משימה חדשה: ${task.text}${due}`;
}

/**
 * פותח וואטסאפ עם ההודעה מוכנה. בלי מספר שמור נפתח בוחר אנשי הקשר,
 * וזה עדיין עובד - רק בלחיצה אחת נוספת.
 */
export async function sendToWhatsApp(task, phone) {
  const text = encodeURIComponent(taskMessage(task));
  const number = normalizePhone(phone);
  const url = number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;

  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
