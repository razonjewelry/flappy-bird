import { Alert, Platform } from 'react-native';

// Alert.alert של React Native הוא פעולה ריקה ב-react-native-web:
// הוא לא זורק שגיאה, הוא פשוט לא מציג כלום. לכן בווב אנחנו נופלים חזרה
// לדיאלוגים של הדפדפן, אחרת מחיקת משימה באתר פשוט לא הייתה עושה דבר.

export function confirmDestructive({ title, message, confirmLabel, onConfirm }) {
  if (Platform.OS === 'web') {
    const text = message ? `${title}\n\n${message}` : title;
    if (typeof window !== 'undefined' && window.confirm(text)) onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: 'ביטול', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}

export function notify(title, message) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }

  Alert.alert(title, message);
}
