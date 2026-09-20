import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { isFirebaseConfigured } from './src/firebaseConfig';
import { clearCurrentUserId, loadCurrentUserId, saveCurrentUserId } from './src/lib/users';
import FeedScreen from './src/screens/FeedScreen';
import PickUserScreen from './src/screens/PickUserScreen';
import SetupNeededScreen from './src/screens/SetupNeededScreen';

export default function App() {
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
        // טוענים את firebase רק אחרי שווידאנו שיש הגדרות, אחרת ה-SDK
        // קורס בהפעלה עם שגיאה לא ברורה במקום להציג את מסך ההסבר.
        const { ensureSignedIn } = await import('./src/lib/firebase');
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
    return (
      <>
        <StatusBar style="dark" />
        <SetupNeededScreen />
      </>
    );
  }

  if (isBooting) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  if (bootError) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar style="dark" />
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>לא הצלחנו להתחבר</Text>
          <Text style={styles.errorText}>
            בדוק שיש אינטרנט, שההגדרות ב-src/firebaseConfig.js נכונות, ושהפעלת
            התחברות אנונימית (Anonymous) ב-Firebase Authentication.
          </Text>
          <Text style={styles.errorDetail}>{String(bootError?.message ?? bootError)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      {currentUserId ? (
        <FeedScreen currentUserId={currentUserId} onSwitchUser={handleSwitchUser} />
      ) : (
        <PickUserScreen onPick={handlePickUser} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  errorBox: { alignItems: 'center' },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    writingDirection: 'rtl',
  },
  errorText: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    writingDirection: 'rtl',
  },
  errorDetail: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 16 },
});
