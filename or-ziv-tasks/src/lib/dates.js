// קיבוץ משימות לפי מתי הן אמורות לקרות. זה מה שהופך רשימה ללוח זמנים.

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(ms) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** מספר הימים בין היום לתאריך היעד. שלילי = באיחור. */
export function daysUntil(dueAt) {
  if (!dueAt) return null;
  return Math.round((startOfDay(dueAt) - startOfDay(Date.now())) / DAY);
}

/** "היום" / "מחר" / "לפני 3 ימים" / "12 באוקטובר" */
export function dueLabel(dueAt) {
  const days = daysUntil(dueAt);
  if (days === null) return '';
  if (days === 0) return 'היום';
  if (days === 1) return 'מחר';
  if (days === 2) return 'מחרתיים';
  if (days === -1) return 'אתמול';
  if (days < 0) return `באיחור ${Math.abs(days)} ימים`;
  if (days <= 7) return `בעוד ${days} ימים`;
  return new Date(dueAt).toLocaleDateString('he-IL', { day: 'numeric', month: 'long' });
}

export const GROUPS = [
  { key: 'overdue', title: 'באיחור' },
  { key: 'today', title: 'היום' },
  { key: 'tomorrow', title: 'מחר' },
  { key: 'later', title: 'בהמשך' },
  { key: 'someday', title: 'ללא תאריך' },
];

export function groupOf(task) {
  if (!task.dueAt) return 'someday';
  const days = daysUntil(task.dueAt);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return 'later';
}

/** אפשרויות הבחירה המהירה. בלי בוררי תאריך של מערכת ההפעלה,
    שמתנהגים אחרת בכל פלטפורמה ולא קיימים בדפדפן. */
export function quickDates() {
  const base = startOfDay(Date.now());
  const inDays = (n) => base + n * DAY + 12 * 60 * 60 * 1000;

  const nextSunday = () => {
    const d = new Date(base);
    const delta = (7 - d.getDay()) % 7 || 7;
    return inDays(delta);
  };

  return [
    { label: 'היום', value: inDays(0) },
    { label: 'מחר', value: inDays(1) },
    { label: 'מחרתיים', value: inDays(2) },
    { label: 'ראשון הבא', value: nextSunday() },
    { label: 'בעוד שבוע', value: inDays(7) },
    { label: 'ללא תאריך', value: null },
  ];
}
