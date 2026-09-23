import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { dueLabel } from '../lib/dates';
import { quickDates } from '../lib/dates';
import { colors, radius } from '../theme';
import Icon from './Icon';

/**
 * בחירת תאריך מתוך אפשרויות קבועות במקום בורר תאריכים של המערכת.
 * הבוררים הנייטיביים נראים ומתנהגים אחרת בכל פלטפורמה, וחלקם לא קיימים
 * בדפדפן כלל. שש האפשרויות האלה מכסות כמעט כל מקרה ברשימה יומיומית.
 */
export default function DateSheet({ task, onPick, onClose }) {
  const options = quickDates();

  return (
    <Modal visible={Boolean(task)} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.head}>
            <Text style={styles.title}>מתי?</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Icon name="close" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {task?.text ? <Text style={styles.taskText} numberOfLines={2}>{task.text}</Text> : null}

          {task?.dueAt ? (
            <Text style={styles.current}>כרגע: {dueLabel(task.dueAt)}</Text>
          ) : null}

          <View style={styles.options}>
            {options.map((opt) => {
              const isClear = opt.value === null;
              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[styles.option, isClear && styles.optionClear]}
                  onPress={() => onPick(opt.value)}
                >
                  <Text style={[styles.optionText, isClear && styles.optionTextClear]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    borderColor: colors.line,
    padding: 20,
    paddingBottom: 30,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  head: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: { color: colors.primary, fontSize: 18, fontWeight: 'bold', writingDirection: 'rtl' },
  taskText: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  current: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 14,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  options: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 9, marginTop: 8 },
  option: {
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionClear: { borderColor: colors.danger },
  optionText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  optionTextClear: { color: colors.danger },
});
