import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView, View, ActivityIndicator, StyleSheet,
  BackHandler, Platform, StatusBar, Text,
} from 'react-native';
import { WebView } from 'react-native-webview';

// The live game. Loading it (instead of bundling) means new levels I add
// later appear automatically without rebuilding the app.
const APP_URL = 'https://razonjewelry.github.io/flappy-bird/sigal-english.html?v=app';

export default function App() {
  const webRef = useRef(null);
  const canGoBack = useRef(false);
  const [loading, setLoading] = useState(true);

  // Android hardware back button navigates within the game.
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fbf7ef" />
      <WebView
        ref={webRef}
        source={{ uri: APP_URL }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        startInLoadingState
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(s) => { canGoBack.current = s.canGoBack; }}
        style={styles.web}
      />
      {loading && (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator size="large" color="#2a9d8f" />
          <Text style={styles.loadingText}>טוען… 🌸</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fbf7ef' },
  web: { flex: 1, backgroundColor: '#fbf7ef' },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fbf7ef',
  },
  loadingText: { marginTop: 12, fontSize: 18, color: '#2a9d8f', fontWeight: '700' },
});
