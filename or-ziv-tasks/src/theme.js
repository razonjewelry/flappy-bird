// שפת העיצוב לקוחה מ"העוזרת האישית שלי · Ratzon" של אור,
// כדי ששתי האפליקציות ירגישו כמו אותה מערכת.
export const colors = {
  bg: '#121212',
  card: '#1E1E1E',
  card2: '#2A2A2A',
  nav: '#181818',
  primary: '#D4AF37',
  primaryDim: '#B5952F',
  primarySoft: 'rgba(212, 175, 55, 0.10)',
  text: '#F1F1F1',
  muted: '#888888',
  line: '#333333',
  danger: '#FF4C4C',
  ok: '#3DDC84',
};

// לכל משתמש צבע משלו, בגוונים שמתאימים לרקע הכהה
export const userColors = {
  or: { fg: '#8AC6FF', border: '#35617F' },
  ziv: { fg: '#FFD38A', border: '#7F6335' },
};

export const radius = { sm: 8, md: 10, lg: 14, pill: 20 };

export const NAV_HEIGHT = 64;

/** "לפני 5 דק׳" — הקשר זמן קצר לכל משימה, כמו שורות המטא ב-Ratzon. */
export function relativeTime(ms) {
  if (!ms) return '';
  const seconds = Math.floor((Date.now() - ms) / 1000);
  if (seconds < 60) return 'עכשיו';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `לפני ${minutes} דק׳`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `לפני ${hours} ש׳`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'אתמול';
  if (days < 7) return `לפני ${days} ימים`;

  return new Date(ms).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
}

/** "יום שלישי, 22 בספטמבר" לכותרת. */
export function todayLabel() {
  return new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
