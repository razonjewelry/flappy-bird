import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DateSheet from '../components/DateSheet';
import RowMenu from '../components/RowMenu';
import Toast from '../components/Toast';
import Icon from '../components/Icon';
import TaskRow from '../components/TaskRow';
import { GROUPS, groupOf } from '../lib/dates';
import { confirmDestructive, notify } from '../lib/dialog';
import { markSeen, readLastSeen } from '../lib/lastSeen';
import { loadPartnerPhone, savePartnerPhone, sendToWhatsApp } from '../lib/share';
import { createTask, deleteTask, restoreTask, setTaskDue } from '../lib/tasks';
import { useTasks } from '../lib/useTasks';
import { getUser, USERS } from '../lib/users';
import { colors, NAV_HEIGHT, radius, todayLabel } from '../theme';
import { BUILD } from '../version';

const TABS = [
  { key: 'feed', label: 'הפיד', icon: 'home' },
  { key: 'settings', label: 'הגדרות', icon: 'settings' },
];

export default function FeedScreen({ currentUserId, onSwitchUser }) {
  const [inputText, setInputText] = useState('');
  const [tab, setTab] = useState('feed');
  const [dateTask, setDateTask] = useState(null);
  const [partnerPhone, setPartnerPhone] = useState('');
  const [menuTask, setMenuTask] = useState(null);
  const [undo, setUndo] = useState(null);
  const { tasks, isLoading, isOffline, error } = useTasks();

  // נלכד פעם אחת בפתיחה. אחרת כל רינדור היה "מאפס" את הסימון,
  // והתגית "חדש" הייתה נעלמת מול העיניים.
  const seenBeforeRef = useRef(undefined);
  const [seenBefore, setSeenBefore] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [previous, phone] = await Promise.all([readLastSeen(), loadPartnerPhone()]);
      if (!alive) return;
      if (seenBeforeRef.current === undefined) {
        seenBeforeRef.current = previous;
        setSeenBefore(previous);
      }
      setPartnerPhone(phone);
      markSeen();
    })();
    return () => {
      alive = false;
    };
  }, []);

  const isNewTask = (task) =>
    Boolean(seenBefore) && task.creatorId !== currentUserId && task.createdAt > seenBefore;

  const handleSavePhone = async (value) => {
    setPartnerPhone(value);
    await savePartnerPhone(value);
  };

  const currentUser = getUser(currentUserId);

  const { buckets, open, done } = useMemo(() => {
    const openTasks = tasks.filter((t) => !t.isCompleted);
    const doneTasks = tasks.filter((t) => t.isCompleted);

    // חשוב לא מקבל סקשן משלו יותר - הקיבוץ הראשי הוא לפי זמן, והכוכב
    // רק מרים את המשימה לראש הקבוצה שלה ונותן לה מסגרת זהב.
    const byGroup = {};
    for (const g of GROUPS) byGroup[g.key] = [];
    for (const t of openTasks) byGroup[groupOf(t)].push(t);
    for (const key of Object.keys(byGroup)) {
      byGroup[key].sort((a, b) => Number(b.isImportant) - Number(a.isImportant));
    }

    return { buckets: byGroup, open: openTasks, done: doneTasks };
  }, [tasks]);

  const handleAdd = async () => {
    const text = inputText.trim();
    if (text === '') return;

    setInputText('');
    try {
      await createTask({ text, creatorId: currentUserId });
    } catch {
      setInputText(text);
      notify('לא הצלחנו לשמור', 'בדוק את החיבור לאינטרנט ונסה שוב.');
    }
  };

  // בדפדפן, Enter בתיבה רב-שורתית יורד שורה במקום לשלוח.
  const handleKeyPress = (event) => {
    if (Platform.OS !== 'web') return;
    const native = event.nativeEvent;
    if (native.key === 'Enter' && !native.shiftKey) {
      event.preventDefault?.();
      native.preventDefault?.();
      handleAdd();
    }
  };

  // מחיקה בלי דיאלוג אישור: הביטול מגיע אחריה ולא לפניה, אז אין צורך
  // לעצור את המשתמש באמצע, ובכל זאת אי אפשר לאבד משהו בטעות.
  const handleDelete = (task) => {
    deleteTask(task.id)
      .then(() => setUndo({ task, message: 'המשימה נמחקה' }))
      .catch(() => notify('המחיקה נכשלה', 'בדוק את החיבור לאינטרנט ונסה שוב.'));
  };

  const handleUndo = () => {
    const pending = undo;
    setUndo(null);
    if (!pending) return;
    restoreTask(pending.task).catch(() =>
      notify('השחזור נכשל', 'בדוק את החיבור לאינטרנט ונסה שוב.')
    );
  };

  const handleClearDone = () => {
    confirmDestructive({
      title: `למחוק ${done.length} משימות שבוצעו?`,
      message: 'הן יימחקו לשניכם ואי אפשר לשחזר.',
      confirmLabel: 'מחק',
      onConfirm: () => {
        Promise.all(done.map((t) => deleteTask(t.id))).catch(() =>
          notify('המחיקה נכשלה', 'בדוק את החיבור לאינטרנט ונסה שוב.')
        );
      },
    });
  };

  const handlePickDate = (value) => {
    const task = dateTask;
    setDateTask(null);
    if (!task) return;
    setTaskDue(task.id, value).catch(() =>
      notify('לא הצלחנו לעדכן', 'בדוק את החיבור לאינטרנט ונסה שוב.')
    );
  };

  const renderRow = (task) => (
    <TaskRow key={task.id} task={task} onOpenMenu={setMenuTask} isNew={isNewTask(task)} />
  );

  const menuActions = (task) => [
    { label: 'קבע תאריך', icon: 'calendar', onPress: () => setDateTask(task) },
    { label: 'שלח בוואטסאפ', icon: 'send', tone: colors.ok, onPress: () => sendToWhatsApp(task, partnerPhone) },
    { label: 'מחק', icon: 'trash', tone: colors.danger, onPress: () => handleDelete(task) },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.h1}>המשימות שלנו</Text>
        <Text style={styles.sub}>משותף · אור & זיו</Text>
        <Text style={styles.date}>{todayLabel()}</Text>
      </View>

      {isOffline && (
        <View style={styles.banner}>
          <Icon name="cloud" size={15} color={colors.primary} />
          <Text style={styles.bannerText}>אין חיבור · השינויים יסונכרנו כשהרשת תחזור</Text>
        </View>
      )}

      {error && (
        <View style={[styles.banner, styles.bannerError]}>
          <Text style={[styles.bannerText, { color: colors.danger }]}>שגיאת חיבור ל-Firebase</Text>
        </View>
      )}

      {tab === 'feed' && (
        <View style={styles.capture}>
          <TextInput
            style={styles.input}
            placeholder="מה צריך לעשות?"
            placeholderTextColor={colors.muted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleAdd}
            onKeyPress={handleKeyPress}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.addButton, inputText.trim() === '' && styles.addButtonOff]}
            onPress={handleAdd}
            disabled={inputText.trim() === ''}
            accessibilityRole="button"
            accessibilityLabel="הוסף"
          >
            <Text style={[styles.addButtonText, inputText.trim() === '' && styles.addButtonTextOff]}>
              הוסף
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading && <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />}

        {!isLoading && tab === 'feed' && (
          <>
            {open.length === 0 && (
              <Card title="לעשות" count={0} empty="הכול נקי. הוסף משימה למעלה." />
            )}

            {GROUPS.map((g) =>
              buckets[g.key].length > 0 ? (
                <Card
                  key={g.key}
                  title={g.title}
                  count={buckets[g.key].length}
                  tone={g.key === 'overdue' ? colors.danger : colors.primary}
                >
                  {buckets[g.key].map(renderRow)}
                </Card>
              ) : null
            )}

            {done.length > 0 && (
              <Card title="בוצעו" count={done.length} actionLabel="נקה" onAction={handleClearDone}>
                {done.map(renderRow)}
              </Card>
            )}
          </>
        )}

        {!isLoading && tab === 'settings' && (
          <SettingsPanel
            currentUser={currentUser}
            onSwitchUser={onSwitchUser}
            counts={{ open: open.length, done: done.length }}
            partnerPhone={partnerPhone}
            onSavePhone={handleSavePhone}
          />
        )}
      </ScrollView>

      <View style={styles.tabbar}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={styles.tabButton}
              onPress={() => setTab(t.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Icon
                name={t.icon}
                size={21}
                color={active ? colors.primary : colors.muted}
                strokeWidth={active ? 2.1 : 1.7}
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Toast
        message={undo?.message}
        actionLabel="בטל"
        onAction={handleUndo}
        onHide={() => setUndo(null)}
      />

      <RowMenu
        task={menuTask}
        actions={menuTask ? menuActions(menuTask) : []}
        onClose={() => setMenuTask(null)}
      />

      <DateSheet task={dateTask} onPick={handlePickDate} onClose={() => setDateTask(null)} />
    </SafeAreaView>
  );
}

function Card({ title, count, empty, actionLabel, onAction, tone, children }) {
  const isEmpty = React.Children.count(children) === 0;

  return (
    <View style={styles.card}>
      {title && (
        <View style={styles.cardHead}>
          <Text style={[styles.cardTitle, tone && { color: tone }]}>{title}</Text>
          <View style={styles.cardHeadEnd}>
            {actionLabel && (
              <Pressable onPress={onAction} hitSlop={8}>
                <Text style={styles.cardAction}>{actionLabel}</Text>
              </Pressable>
            )}
            {count !== undefined && (
              <View style={styles.countPill}>
                <Text style={styles.countText}>{count}</Text>
              </View>
            )}
          </View>
        </View>
      )}
      {isEmpty && empty ? <Text style={styles.empty}>{empty}</Text> : children}
    </View>
  );
}

function SettingsPanel({ currentUser, onSwitchUser, counts, partnerPhone, onSavePhone }) {
  return (
    <>
      <Card title="מי אני">
        <View style={styles.settingsRow}>
          <Icon name="person" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.settingsTitle}>{currentUser?.name ?? 'לא ידוע'}</Text>
            <Text style={styles.metaText}>נשמר במכשיר הזה</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.ghostButton} onPress={onSwitchUser}>
          <Text style={styles.ghostButtonText}>החלף משתמש</Text>
        </TouchableOpacity>
      </Card>

      <Card title="שליחה בוואטסאפ">
        <Text style={styles.aboutText}>
          כפתור השליחה בכל משימה פותח וואטסאפ עם הטקסט מוכן. מספר שמור כאן
          יפתח את הצ'אט ישירות; בלעדיו ייפתח בוחר אנשי הקשר.
        </Text>
        <TextInput
          style={styles.phoneInput}
          placeholder="050-0000000"
          placeholderTextColor={colors.muted}
          value={partnerPhone}
          onChangeText={onSavePhone}
          keyboardType="phone-pad"
          autoComplete="tel"
        />
      </Card>

      <Card title="סיכום">
        <View style={styles.statsRow}>
          <Stat label="לעשות" value={counts.open} tone={colors.primary} />
          <Stat label="בוצעו" value={counts.done} tone={colors.ok} />
        </View>
      </Card>

      <Card title="על האפליקציה">
        <Text style={styles.aboutText}>
          המשימות נשמרות בענן ומסונכרנות בין המכשירים בזמן אמת. לחיצה על טקסט
          של משימה פותחת אותה לעריכה, ואייקון לוח השנה קובע לה תאריך יעד.
        </Text>
        <Text style={[styles.aboutText, styles.aboutMuted]}>
          {USERS.map((u) => u.name).join(' · ')}
        </Text>
        <Text style={styles.build}>{BUILD}</Text>
      </Card>
    </>
  );
}

function Stat({ label, value, tone }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: tone }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  h1: { color: colors.primary, fontSize: 24, fontWeight: 'bold', textAlign: 'right', writingDirection: 'rtl' },
  sub: { color: colors.muted, fontSize: 13, marginTop: 2, textAlign: 'right', writingDirection: 'rtl' },
  date: { color: colors.text, fontSize: 14, marginTop: 6, textAlign: 'right', writingDirection: 'rtl' },

  banner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  bannerError: { backgroundColor: 'rgba(255,76,76,0.10)' },
  bannerText: { color: colors.primary, fontSize: 12, writingDirection: 'rtl' },

  capture: { flexDirection: 'row-reverse', gap: 8, paddingHorizontal: 16, marginTop: 14 },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  addButton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 20, justifyContent: 'center' },
  addButtonOff: { backgroundColor: colors.card2, borderWidth: 1, borderColor: colors.line },
  addButtonText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  addButtonTextOff: { color: colors.muted },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: NAV_HEIGHT + 24 },
  loader: { marginTop: 40 },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 14,
  },
  cardHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  cardTitle: { color: colors.primary, fontSize: 16, fontWeight: 'bold', writingDirection: 'rtl' },
  cardHeadEnd: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  cardAction: { color: colors.muted, fontSize: 12, textDecorationLine: 'underline' },
  countPill: { backgroundColor: colors.card2, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 2 },
  countText: { color: colors.muted, fontSize: 12 },
  empty: { color: colors.muted, fontSize: 13, textAlign: 'center', paddingVertical: 14, writingDirection: 'rtl' },

  metaText: { color: colors.muted, fontSize: 11 },

  settingsRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  settingsTitle: { color: colors.text, fontSize: 15, textAlign: 'right', writingDirection: 'rtl' },

  ghostButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 11,
    alignItems: 'center',
  },
  ghostButtonText: { color: colors.primary, fontWeight: 'bold', fontSize: 14 },

  statsRow: { flexDirection: 'row-reverse', gap: 10 },
  stat: { flex: 1, backgroundColor: colors.card2, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: colors.muted, fontSize: 11, marginTop: 3 },

  aboutText: { color: colors.text, fontSize: 13, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl' },
  aboutMuted: { color: colors.muted, marginTop: 10, fontSize: 12 },
  phoneInput: {
    marginTop: 12,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    textAlign: 'right',
  },
  build: { color: colors.primary, fontSize: 11, marginTop: 12, textAlign: 'right', writingDirection: 'rtl' },

  tabbar: {
    flexDirection: 'row-reverse',
    height: NAV_HEIGHT,
    backgroundColor: colors.nav,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabLabel: { color: colors.muted, fontSize: 11 },
  tabLabelActive: { color: colors.primary },
});
