import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const STEPS = [
  'היכנס ל-console.firebase.google.com וצור פרויקט חדש.',
  'בתוך הפרויקט: Build → Firestore Database → Create database (בחר מיקום קרוב, למשל europe-west).',
  'Build → Authentication → Get started → הפעל את השיטה Anonymous.',
  'בהגדרות הפרויקט (⚙️) → Your apps → הוסף אפליקציית Web וקבל את firebaseConfig.',
  'העתק את הערכים לקובץ src/firebaseConfig.js במקום ה-REPLACE_ME.',
  'העתק את התוכן של firestore.rules ללשונית Rules ב-Firestore ולחץ Publish.',
];

export default function SetupNeededScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>נשאר שלב אחד</Text>
        <Text style={styles.subtitle}>
          האפליקציה מוכנה, אבל היא עדיין לא מחוברת ל-Firebase. בלי זה אין סנכרון
          ואין שמירה. זה תהליך של כמה דקות וצריך לעשות אותו פעם אחת בלבד.
        </Text>

        {STEPS.map((step, index) => (
          <View key={step} style={styles.step}>
            <View style={styles.number}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}

        <Text style={styles.footer}>
          ההוראות המלאות נמצאות בקובץ README.md של הפרויקט.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 28, paddingTop: 48 },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 23,
    marginTop: 10,
    marginBottom: 28,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  step: { flexDirection: 'row-reverse', alignItems: 'flex-start', marginBottom: 18, gap: 12 },
  number: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  footer: {
    marginTop: 16,
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
