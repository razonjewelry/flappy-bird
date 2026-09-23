import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radius } from '../theme';
import Icon from './Icon';

/**
 * פעולות המשנה של משימה. הן ישבו קודם כאייקונים בשורה, וארבעה אייקונים
 * צמודים הפכו את השורה לצפופה ואת הפגיעה בכפתור הנכון להימור.
 */
export default function RowMenu({ task, actions, onClose }) {
  return (
    <Modal visible={Boolean(task)} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title} numberOfLines={2}>
            {task?.text}
          </Text>

          {actions.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={styles.item}
              onPress={() => {
                onClose();
                a.onPress();
              }}
            >
              <Icon name={a.icon} size={20} color={a.tone ?? colors.text} />
              <Text style={[styles.itemText, a.tone && { color: a.tone }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    borderColor: colors.line,
    padding: 18,
    paddingBottom: 28,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  title: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 14,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  item: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: radius.md,
  },
  itemText: { color: colors.text, fontSize: 15, writingDirection: 'rtl' },
});
