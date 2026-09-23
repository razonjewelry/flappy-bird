import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';

import { db } from './firebase';

const TASKS = 'tasks';

/**
 * מאזין לשינויים בזמן אמת. כל שינוי אצל אחד מכם מגיע לשני תוך שנייה,
 * בלי לרענן ובלי למשוך מחדש.
 * מחזיר פונקציה שמנתקת את ההאזנה.
 */
export function subscribeToTasks(onTasks, onError) {
  // createdAt הוא מספר שנקבע במכשיר ולא serverTimestamp, כדי שמשימה חדשה
  // תופיע מיד במקום הנכון ברשימה במקום לקפוץ אחרי שהשרת מאשר אותה.
  const q = query(collection(db, TASKS), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      onTasks(tasks, { fromCache: snapshot.metadata.fromCache });
    },
    onError
  );
}

export function createTask({ text, creatorId }) {
  return addDoc(collection(db, TASKS), {
    text: text.trim(),
    creatorId,
    isCompleted: false,
    isImportant: false,
    dueAt: null,
    createdAt: Date.now(),
  });
}

export function setTaskCompleted(id, isCompleted) {
  return updateDoc(doc(db, TASKS, id), { isCompleted });
}

export function setTaskImportant(id, isImportant) {
  return updateDoc(doc(db, TASKS, id), { isImportant });
}

export function setTaskText(id, text) {
  return updateDoc(doc(db, TASKS, id), { text: text.trim() });
}

export function setTaskDue(id, dueAt) {
  return updateDoc(doc(db, TASKS, id), { dueAt });
}

/**
 * מחזיר משימה שנמחקה. Firestore לא יודע לבטל מחיקה, אז אנחנו כותבים
 * אותה מחדש מהעותק שהחזקנו בזיכרון. המזהה משתנה, התוכן לא.
 */
export function restoreTask(task) {
  return addDoc(collection(db, TASKS), {
    text: task.text,
    creatorId: task.creatorId,
    isCompleted: Boolean(task.isCompleted),
    isImportant: Boolean(task.isImportant),
    dueAt: task.dueAt ?? null,
    createdAt: task.createdAt ?? Date.now(),
  });
}

export function deleteTask(id) {
  return deleteDoc(doc(db, TASKS, id));
}
