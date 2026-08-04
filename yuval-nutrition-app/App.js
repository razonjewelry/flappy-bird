import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView, View, ActivityIndicator, StyleSheet,
  BackHandler, Platform, StatusBar, Text, AppState,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Notifications from 'expo-notifications';

// The live app is hosted on GitHub Pages. Loading it (instead of bundling the
// HTML inside the APK) means every change I push to the HTML shows up
// automatically the next time Yuval opens the app — no rebuild needed.
const BASE_URL = 'https://razonjewelry.github.io/flappy-bird/yuval-nutrition.html';

// A changing ?t= param forces the WebView to fetch the freshest HTML on each
// open. Her saved data is safe: localStorage is keyed by origin (host), and the
// query string does not change the origin — so nothing is lost on refresh.
function freshUrl() {
  return BASE_URL + '?t=' + Date.now();
}

// Show notifications even while the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false,
  }),
});

export default function App() {
  const webRef = useRef(null);
  const canGoBack = useRef(false);
  const [url, setUrl] = useState(freshUrl());
  const [loading, setLoading] = useState(true);

  // Ask for notification permission + set up the Android channel on first launch.
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') await Notifications.requestPermissionsAsync();
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('reminders', {
            name: 'תזכורות תזונה',
            importance: Notifications.AndroidImportance.HIGH,
            sound: 'default',
            enableVibrate: true,
            vibrationPattern: [0, 300, 150, 300],
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          });
        }
      } catch (e) {}
    })();
  }, []);

  // Android hardware back button navigates within the app first.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBack = () => {
      if (canGoBack.current && webRef.current) {
        webRef.current.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []);

  // When the app returns to the foreground, reload with a fresh URL so she
  // always sees the latest version (as long as there is internet).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setLoading(true);
        setUrl(freshUrl());
      }
    });
    return () => sub.remove();
  }, []);

  // Re-schedule every reminder from the web app's current settings. Called on
  // load and whenever she changes a reminder toggle or starts/stops a fast.
  // Idempotent: we clear everything and rebuild from the payload each time, so
  // these fire even when the app is fully closed.
  async function syncReminders(payload) {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      const r = (payload && payload.reminders) || {};
      const fast = (payload && payload.fast) || {};
      const ch = Platform.OS === 'android' ? { channelId: 'reminders' } : {};

      // Water — repeating interval reminder.
      if (r.water) {
        const hrs = Math.max(1, Number(r.waterHrs) || 2);
        await Notifications.scheduleNotificationAsync({
          content: { title: 'זמן לשתות מים 💧', body: 'קחי כוס מים, יובל', sound: 'default' },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: hrs * 3600, repeats: true, ...ch,
          },
        });
      }

      // Meals — daily reminders at typical meal times.
      if (r.meals) {
        for (const h of [9, 13, 19]) {
          await Notifications.scheduleNotificationAsync({
            content: { title: 'זמן לרשום ארוחה 📖', body: 'אל תשכחי לתעד מה אכלת', sound: 'default' },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour: h, minute: 0, ...ch,
            },
          });
        }
      }

      // Fasting — one-shot alert when the current fasting window ends.
      if (r.fast && fast.active && Number(fast.endInMs) > 0) {
        await Notifications.scheduleNotificationAsync({
          content: { title: 'הצום הסתיים! 🎉', body: 'חלון האכילה נפתח, יובל', sound: 'default' },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: Math.max(1, Math.round(Number(fast.endInMs) / 1000)), ...ch,
          },
        });
      }
    } catch (e) {}
  }

  // Messages from the web app.
  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'sync') syncReminders(data);
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e87e94" />
      <WebView
        ref={webRef}
        source={{ uri: url }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled={false}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        startInLoadingState
        onMessage={onMessage}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(s) => { canGoBack.current = s.canGoBack; }}
        style={styles.web}
      />
      {loading && (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator size="large" color="#e87e94" />
          <Text style={styles.loadingText}>טוען… 🌸</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf8f5' },
  web: { flex: 1, backgroundColor: '#fdf8f5' },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fdf8f5',
  },
  loadingText: { marginTop: 12, fontSize: 18, color: '#e87e94', fontWeight: '700' },
});
