import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { isFirebaseConfigured } from './src/firebaseConfig';
import { colors } from './src/theme';
import { ensureSignedIn } from './src/lib/firebase';
import { clearCurrentUserId, loadCurrentUserId, saveCurrentUserId } from './src/lib/users';
import FeedScreen from './src/screens/FeedScreen';
import PickUserScreen from './src/screens/PickUserScreen';
import SetupNeededScreen from './src/screens/SetupNeededScreen';

function AppContent() {
  const [isBooting, setIsBooting] = useState(true);
  const [bootError, setBootError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsBooting(false);
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        const [savedUserId] = await Promise.all([loadCurrentUserId(), ensureSignedIn()]);
        if (!isMounted) return;
        setCurrentUserId(savedUserId);
      } catch (error) {
        if (isMounted) setBootError(error);
      } finally {
        if (isMounted) setIsBooting(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePickUser = useCallback(async (userId) => {
    setCurrentUserId(userId);
    await saveCurrentUserId(userId);
  }, []);

  const handleSwitchUser = useCallback(async () => {
    setCurrentUserId(null);
    await clearCurrentUserId();
  }, []);

  if (!isFirebaseConfigured) {
    return <SetupNeededScreen />;
  }

  if (isBooting) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  if (bootError) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorTitle}>לא הצלחנו להתחבר</Text>
        <Text style={styles.errorText}>
          בדוק שיש אינטרנט, שההגדרות ב-src/firebaseConfig.js נכונות, ושהתחברות
          אנונימית (Anonymous) מופעלת ב-Firebase Authentication.
        </Text>
        <Text style={styles.errorDetail}>{String(bootError?.message ?? bootError)}</Text>
      </SafeAreaView>
    );
  }

  if (currentUserId) {
    return <FeedScreen currentUserId={currentUserId} onSwitchUser={handleSwitchUser} />;
  }

  return <PickUserScreen onPick={handlePickUser} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {/* האפליקציה מעוצבת לרוחב טלפון. בלי התיחום הזה היא נמתחת על כל
          רוחב מסך המחשב, והצ'קבוקס והטקסט מתרחקים לשני קצוות המסך. */}
      <View style={styles.page}>
        <View style={styles.shell}>
          <AppContent />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const MAX_WIDTH = 560;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    backgroundColor: colors.bg,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    writingDirection: 'rtl',
  },
  errorText: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    writingDirection: 'rtl',
  },
  errorDetail: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 16 },
});
