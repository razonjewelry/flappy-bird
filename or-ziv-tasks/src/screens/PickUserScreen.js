import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { USERS } from '../lib/users';

export default function PickUserScreen({ onPick }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>מי אתה?</Text>
        <Text style={styles.subtitle}>
          נבחר פעם אחת בלבד. אפשר להחליף אחר כך מתוך האפליקציה.
        </Text>

        <View style={styles.options}>
          {USERS.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={[styles.option, { backgroundColor: user.color }]}
              onPress={() => onPick(user.id)}
              accessibilityRole="button"
              accessibilityLabel={`אני ${user.name}`}
            >
              <Text style={[styles.optionText, { color: user.textColor }]}>{user.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { flex: 1, justifyContent: 'center', padding: 32 },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 40,
    lineHeight: 22,
    writingDirection: 'rtl',
  },
  options: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 16 },
  option: {
    flex: 1,
    paddingVertical: 28,
    borderRadius: 20,
    alignItems: 'center',
  },
  optionText: { fontSize: 24, fontWeight: '700' },
});
