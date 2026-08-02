import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView, View, ActivityIndicator, StyleSheet,
  BackHandler, Platform, StatusBar, Text, AppState,
} from 'react-native';
import { WebView } from 'react-native-webview';

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

export default function App() {
  const webRef = useRef(null);
  const canGoBack = useRef(false);
  const [url, setUrl] = useState(freshUrl());
  const [loading, setLoading] = useState(true);

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
