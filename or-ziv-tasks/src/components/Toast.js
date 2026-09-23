import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors, NAV_HEIGHT, radius } from '../theme';

/** הודעה קצרה עם פעולת ביטול, צפה מעל סרגל הניווט. */
export default function Toast({ message, actionLabel, onAction, onHide, duration = 6000 }) {
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return undefined;

    slide.setValue(0);
    Animated.spring(slide, { toValue: 1, useNativeDriver: true, friction: 9 }).start();

    const timer = setTimeout(() => {
      Animated.timing(slide, { toValue: 0, duration: 180, useNativeDriver: true }).start(onHide);
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onHide, slide]);

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: slide,
          transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
        },
      ]}
    >
      <Text style={styles.text} numberOfLines={1}>
        {message}
      </Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction} hitSlop={10}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: NAV_HEIGHT + 14,
    left: 16,
    right: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  text: { flex: 1, color: colors.text, fontSize: 14, textAlign: 'right', writingDirection: 'rtl' },
  action: { color: colors.primary, fontSize: 14, fontWeight: 'bold' },
});
