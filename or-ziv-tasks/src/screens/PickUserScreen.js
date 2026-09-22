import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, userColors } from '../theme';
import { USERS } from '../lib/users';

export default function PickUserScreen({ onPick }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>המשימות שלנו</Text>
        <Text style={styles.title}>מי אתה?</Text>
        <Text style={styles.subtitle}>
          נבחר פעם אחת בלבד ונשמר במכשיר. אפשר להחליף אחר כך מההגדרות.
        </Text>

        <View style={styles.options}>
          {USERS.map((user) => {
            const tint = userColors[user.id] ?? userColors.or;
            return (
              <TouchableOpacity
                key={user.id}
                style={[styles.option, { borderColor: tint.border }]}
                onPress={() => onPick(user.id)}
                accessibilityRole="button"
                accessibilityLabel={`אני ${user.name}`}
              >
                <Text style={[styles.optionText, { color: tint.fg }]}>{user.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: 'center', padding: 28 },
  brand: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 36,
    lineHeight: 21,
    writingDirection: 'rtl',
  },
  options: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 14 },
  option: {
    flex: 1,
    paddingVertical: 26,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  optionText: { fontSize: 22, fontWeight: '700' },
});
