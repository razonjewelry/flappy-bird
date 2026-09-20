import { useEffect, useRef, useState } from 'react';

import { readMirror, writeMirror } from './offlineCache';
import { subscribeToTasks } from './tasks';

/**
 * מחזיק את רשימת המשימות המסונכרנת.
 * מציג מיד את העותק השמור מהפעם הקודמת, ומחליף אותו ברגע שהשרת עונה.
 */
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState(null);
  const hasServerData = useRef(false);

  useEffect(() => {
    let isMounted = true;

    readMirror().then((cached) => {
      // אם הנתונים האמיתיים כבר הגיעו, אין טעם לדרוס אותם בעותק ישן.
      if (!isMounted || hasServerData.current || cached.length === 0) return;
      setTasks(cached);
      setIsLoading(false);
    });

    const unsubscribe = subscribeToTasks(
      (nextTasks, { fromCache }) => {
        if (!isMounted) return;
        hasServerData.current = true;
        setTasks(nextTasks);
        setIsOffline(fromCache);
        setIsLoading(false);
        setError(null);
        writeMirror(nextTasks);
      },
      (subscriptionError) => {
        if (!isMounted) return;
        setError(subscriptionError);
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { tasks, isLoading, isOffline, error };
}
