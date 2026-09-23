import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { daysUntil, dueLabel } from '../lib/dates';
import { setTaskCompleted, setTaskImportant, setTaskText } from '../lib/tasks';
import { getUser } from '../lib/users';
import { colors, radius, relativeTime, userColors } from '../theme';
import Icon from './Icon';

export default function TaskRow({ task, onOpenMenu, isNew }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);

  // כניסה רכה. useNativeDriver עובד גם ב-react-native-web, אז אותה
  // אנימציה רצה בנייד ובדפדפן בלי ענפי קוד נפרדים.
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [enter]);

  const creator = getUser(task.creatorId);
  const tint = userColors[task.creatorId] ?? userColors.or;
  const done = Boolean(task.isCompleted);
  const overdue = task.dueAt && daysUntil(task.dueAt) < 0 && !done;

  const saveEdit = () => {
    const text = draft.trim();
    setIsEditing(false);
    if (text === '' || text === task.text) return;
    setTaskText(task.id, text).catch(() => {});
  };

  const animated = {
    opacity: enter,
    transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
  };

  if (isEditing) {
    return (
      <Animated.View style={[styles.row, styles.rowEditing, animated]}>
        <TextInput
          style={styles.editInput}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={saveEdit}
          autoFocus
          selectTextOnFocus
          returnKeyType="done"
        />
        <TouchableOpacity onPress={saveEdit} hitSlop={8} style={styles.iconButton}>
          <Icon name="check" size={20} color={colors.ok} strokeWidth={2.2} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsEditing(false)} hitSlop={8} style={styles.iconButton}>
          <Icon name="close" size={19} color={colors.muted} />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.row,
        task.isImportant && !done && styles.rowImportant,
        done && styles.rowDone,
        animated,
      ]}
    >
      <Check done={done} onPress={() => setTaskCompleted(task.id, !done)} />

      <TouchableOpacity
        style={styles.rowMain}
        onPress={() => {
          setDraft(task.text);
          setIsEditing(true);
        }}
        activeOpacity={0.7}
        accessibilityLabel="ערוך משימה"
      >
        <Text style={[styles.rowTitle, done && styles.rowTitleDone]}>{task.text}</Text>
        <View style={styles.rowMeta}>
          {creator && (
            <View style={[styles.pill, { borderColor: tint.border }]}>
              <Text style={[styles.pillText, { color: tint.fg }]}>{creator.name}</Text>
            </View>
          )}
          {isNew && (
            <View style={styles.newPill}>
              <Text style={styles.newText}>חדש</Text>
            </View>
          )}
          {task.dueAt && (
            <View style={[styles.duePill, overdue && styles.duePillLate]}>
              <Text style={[styles.dueText, overdue && styles.dueTextLate]}>
                {dueLabel(task.dueAt)}
              </Text>
            </View>
          )}
          <Text style={styles.metaText}>{relativeTime(task.createdAt)}</Text>
        </View>
      </TouchableOpacity>

      {!done && (
        <TouchableOpacity
          onPress={() => setTaskImportant(task.id, !task.isImportant)}
          hitSlop={8}
          style={styles.iconButton}
          accessibilityLabel={task.isImportant ? 'הסר חשוב' : 'סמן כחשוב'}
        >
          <Icon
            name={task.isImportant ? 'star' : 'star-outline'}
            size={20}
            color={task.isImportant ? colors.primary : colors.muted}
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => onOpenMenu(task)}
        hitSlop={8}
        style={styles.iconButton}
        accessibilityLabel="עוד פעולות"
      >
        <Icon name="more" size={20} color={colors.muted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

/** הוי גדל לרגע בסימון, כדי שהפעולה תורגש ולא רק תיראה. */
function Check({ done, onPress }) {
  const pop = useRef(new Animated.Value(done ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(pop, { toValue: done ? 1 : 0, useNativeDriver: true, friction: 5 }).start();
  }, [done, pop]);

  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
    >
      <Animated.View
        style={[
          styles.check,
          done && styles.checkOn,
          { transform: [{ scale: pop.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.18, 1] }) }] },
        ]}
      >
        {done && <Icon name="check" size={16} color="#000" strokeWidth={2.4} />}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  rowImportant: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.primarySoft },
  rowDone: { opacity: 0.6 },
  rowEditing: { borderWidth: 1, borderColor: colors.primary },

  rowMain: { flex: 1, minWidth: 0 },
  rowTitle: { color: colors.text, fontSize: 15, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl' },
  rowTitleDone: {
    color: colors.muted,
    textDecorationLine: 'line-through',
    textDecorationColor: colors.muted,
  },
  rowMeta: { flexDirection: 'row-reverse', alignItems: 'center', gap: 7, marginTop: 4, flexWrap: 'wrap' },
  metaText: { color: colors.muted, fontSize: 11 },

  editInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 2,
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  check: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.ok, borderColor: colors.ok },

  pill: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 1 },
  pillText: { fontSize: 11 },

  newPill: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 1 },
  newText: { fontSize: 10, color: '#000', fontWeight: 'bold' },

  duePill: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  duePillLate: { borderColor: colors.danger },
  dueText: { fontSize: 11, color: colors.primary },
  dueTextLate: { color: colors.danger },

  iconButton: { paddingHorizontal: 5, paddingVertical: 4 },
});
