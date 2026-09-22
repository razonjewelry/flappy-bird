import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
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

import { confirmDestructive, notify } from '../lib/dialog';
import {
  createTask,
  deleteTask,
  setTaskCompleted,
  setTaskImportant,
  setTaskSnoozed,
} from '../lib/tasks';
import { useTasks } from '../lib/useTasks';
import { getUser, USERS } from '../lib/users';
import { colors, NAV_HEIGHT, radius, relativeTime, todayLabel, userColors } from '../theme';

const TABS = [
  { key: 'feed', label: 'הפיד', icon: 'home' },
  { key: 'snoozed', label: 'דחויים', icon: 'alarm' },
  { key: 'settings', label: 'הגדרות', icon: 'settings' },
];

export default function FeedScreen({ currentUserId, onSwitchUser }) {
  const [inputText, setInputText] = useState('');
  const [tab, setTab] = useState('feed');
  const { tasks, isLoading, isOffline, error } = useTasks();

  const currentUser = getUser(currentUserId);

  const { important, open, done, snoozed } = useMemo(() => {
    const active = tasks.filter((t) => !t.isSnoozed);
    return {
      important: active.filter((t) => t.isImportant && !t.isCompleted),
      open: active.filter((t) => !t.isImportant && !t.isCompleted),
      done: active.filter((t) => t.isCompleted),
      snoozed: tasks.filter((t) => t.isSnoozed),
    };
  }, [tasks]);

  const handleAdd = async () => {
    const text = inputText.trim();
    if (text === '') return;

    // מנקים מיד כדי שההקלדה תרגיש מיידית. Firestore מציג את המשימה
    // מקומית עוד לפני שהשרת מאשר אותה.
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

  const handleDelete = (task) => {
    confirmDestructive({
      title: 'למחוק את המשימה?',
      message: task.text,
      confirmLabel: 'מחק',
      onConfirm: () => {
        deleteTask(task.id).catch(() =>
          notify('המחיקה נכשלה', 'בדוק את החיבור לאינטרנט ונסה שוב.')
        );
      },
    });
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

  const renderRow = (task) => (
    <TaskRow key={task.id} task={task} onDelete={() => handleDelete(task)} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.h1}>המשימות שלנו</Text>
        <Text style={styles.sub}>משותף · אור & זיו</Text>
        <Text style={styles.date}>{todayLabel()}</Text>
      </View>

      {isOffline && (
        <View style={styles.banner}>
          <Ionicons name="cloud-offline-outline" size={14} color={colors.primary} />
          <Text style={styles.bannerText}>אין חיבור · השינויים יסונכרנו כשהרשת תחזור</Text>
        </View>
      )}

      {error && (
        <View style={[styles.banner, styles.bannerError]}>
          <Text style={[styles.bannerText, { color: colors.danger }]}>
            שגיאת חיבור ל-Firebase
          </Text>
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
        {isLoading && (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        )}

        {!isLoading && tab === 'feed' && (
          <>
            {important.length > 0 && (
              <Card title="חשוב" count={important.length}>
                {important.map(renderRow)}
              </Card>
            )}

            <Card title="לעשות" count={open.length} empty="הכול נקי. הוסף משימה למעלה.">
              {open.map(renderRow)}
            </Card>

            {done.length > 0 && (
              <Card
                title="בוצעו"
                count={done.length}
                actionLabel="נקה"
                onAction={handleClearDone}
              >
                {done.map(renderRow)}
              </Card>
            )}
          </>
        )}

        {!isLoading && tab === 'snoozed' && (
          <Card
            title="דחויים"
            count={snoozed.length}
            empty="שום דבר לא נדחה. משימות שתדחו יופיעו כאן."
          >
            {snoozed.map(renderRow)}
          </Card>
        )}

        {!isLoading && tab === 'settings' && (
          <SettingsPanel
            currentUser={currentUser}
            onSwitchUser={onSwitchUser}
            counts={{ open: open.length + important.length, done: done.length, snoozed: snoozed.length }}
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
              <Ionicons
                name={active ? t.icon : `${t.icon}-outline`}
                size={20}
                color={active ? colors.primary : colors.muted}
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

/** כרטיס־סקשן עם כותרת זהב וספירה, כמו ב-Ratzon. */
function Card({ title, count, empty, actionLabel, onAction, children }) {
  const isEmpty = React.Children.count(children) === 0;

  return (
    <View style={styles.card}>
      {title && (
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>{title}</Text>
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

function TaskRow({ task, onDelete }) {
  const creator = getUser(task.creatorId);
  const tint = userColors[task.creatorId] ?? userColors.or;
  const done = Boolean(task.isCompleted);

  return (
    <View style={[styles.row, task.isImportant && !done && styles.rowImportant, done && styles.rowDone]}>
      <TouchableOpacity
        onPress={() => setTaskCompleted(task.id, !done)}
        hitSlop={8}
        style={[styles.check, done && styles.checkOn]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
      >
        {done && <Ionicons name="checkmark" size={14} color="#000" />}
      </TouchableOpacity>

      <View style={styles.rowMain}>
        <Text style={[styles.rowTitle, done && styles.rowTitleDone]}>{task.text}</Text>
        <View style={styles.rowMeta}>
          {creator && (
            <View style={[styles.pill, { borderColor: tint.border }]}>
              <Text style={[styles.pillText, { color: tint.fg }]}>{creator.name}</Text>
            </View>
          )}
          <Text style={styles.metaText}>{relativeTime(task.createdAt)}</Text>
        </View>
      </View>

      {!done && (
        <TouchableOpacity
          onPress={() => setTaskImportant(task.id, !task.isImportant)}
          hitSlop={8}
          style={styles.iconButton}
          accessibilityLabel={task.isImportant ? 'הסר חשוב' : 'סמן כחשוב'}
        >
          <Ionicons
            name={task.isImportant ? 'star' : 'star-outline'}
            size={19}
            color={task.isImportant ? colors.primary : colors.muted}
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => setTaskSnoozed(task.id, !task.isSnoozed)}
        hitSlop={8}
        style={styles.iconButton}
        accessibilityLabel={task.isSnoozed ? 'החזר לפיד' : 'דחה למועד אחר'}
      >
        <Ionicons
          name={task.isSnoozed ? 'arrow-undo-outline' : 'time-outline'}
          size={19}
          color={colors.muted}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onDelete}
        hitSlop={8}
        style={styles.iconButton}
        accessibilityLabel="מחק"
      >
        <Ionicons name="trash-outline" size={18} color={colors.muted} />
      </TouchableOpacity>
    </View>
  );
}

function SettingsPanel({ currentUser, onSwitchUser, counts }) {
  return (
    <>
      <Card title="מי אני">
        <View style={styles.row}>
          <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
          <View style={styles.rowMain}>
            <Text style={styles.rowTitle}>{currentUser?.name ?? 'לא ידוע'}</Text>
            <Text style={styles.metaText}>נשמר במכשיר הזה</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.ghostButton} onPress={onSwitchUser}>
          <Text style={styles.ghostButtonText}>החלף משתמש</Text>
        </TouchableOpacity>
      </Card>

      <Card title="סיכום">
        <View style={styles.statsRow}>
          <Stat label="לעשות" value={counts.open} tone={colors.primary} />
          <Stat label="בוצעו" value={counts.done} tone={colors.ok} />
          <Stat label="דחויים" value={counts.snoozed} tone={colors.muted} />
        </View>
      </Card>

      <Card title="על האפליקציה">
        <Text style={styles.aboutText}>
          המשימות נשמרות בענן ומסונכרנות בין המכשירים בזמן אמת. כל מה שאחד
          מוסיף או מסמן מופיע אצל השני תוך שנייה, בלי לרענן.
        </Text>
        <Text style={[styles.aboutText, styles.aboutMuted]}>
          {USERS.map((u) => u.name).join(' · ')}
        </Text>
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
  h1: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  date: {
    color: colors.text,
    fontSize: 14,
    marginTop: 6,
    textAlign: 'right',
    writingDirection: 'rtl',
  },

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
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
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
  cardHead: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },
  cardTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    writingDirection: 'rtl',
  },
  cardHeadEnd: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  cardAction: { color: colors.muted, fontSize: 12, textDecorationLine: 'underline' },
  countPill: {
    backgroundColor: colors.card2,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  countText: { color: colors.muted, fontSize: 12 },
  empty: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 14,
    writingDirection: 'rtl',
  },

  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card2,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 9,
  },
  rowImportant: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  rowDone: { opacity: 0.6 },
  rowMain: { flex: 1, minWidth: 0 },
  rowTitle: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rowTitleDone: {
    color: colors.muted,
    textDecorationLine: 'line-through',
    textDecorationColor: colors.muted,
  },
  rowMeta: { flexDirection: 'row-reverse', alignItems: 'center', gap: 7, marginTop: 4 },
  metaText: { color: colors.muted, fontSize: 11 },

  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.ok, borderColor: colors.ok },

  pill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  pillText: { fontSize: 11 },

  iconButton: { paddingHorizontal: 5, paddingVertical: 4 },

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
  stat: {
    flex: 1,
    backgroundColor: colors.card2,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: colors.muted, fontSize: 11, marginTop: 3 },

  aboutText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  aboutMuted: { color: colors.muted, marginTop: 10, fontSize: 12 },

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
