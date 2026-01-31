import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Linking,

} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function SourceWebScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { url, title } = route.params as { url: string; title?: string };

  const webViewRef = useRef<WebView>(null);
  const [navState, setNavState] = useState({ canGoBack: false, canGoForward: false });
  const [progress, setProgress] = useState(0);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title || 'Source Content',
      headerTitleAlign: 'center',
      headerTitleStyle: { fontSize: 16 },
      headerBackTitleVisible: false,
      headerBackTitle: '', // Force empty back title on iOS 
    });
  }, [navigation, title]);

  const openExternal = () => {
    Linking.openURL(url);
  };

  const cleanupScript = `
    (function() {
      const style = document.createElement('style');
      style.innerHTML = \`
        /* 1. Hide the Main Blue Header (Login/Join) */
        #header, header, .touch-header, [role="banner"] { 
          display: none !important; 
        }

        /* 2. Hide "Open App" or "Get App" Sticky Banners */
        #msite-header, .smart-banner, .fixed-container { 
          display: none !important; 
        }

        /* 3. Hide the specific "X's Post" Overlay Header & Close Button */
        div[class*="sheets-header"], 
        div[data-sigil="m-area-header"], 
        div[role="heading"] {
           display: none !important;
        }

        /* 4. Hide the "X" Close Button */
        div[aria-label="Close"], i[class*="img sp_"] {
          display: none !important; 
        }
        
        /* 5. Hide Footers */
        footer, .footer { display: none !important; }
      \`;
      document.head.appendChild(style);
    })();
    true;
  `;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      {progress < 1 && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        )}
        onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
        onNavigationStateChange={(navState) => setNavState(navState)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        injectedJavaScript={cleanupScript}
        scalesPageToFit={true}
      />

      {/* Bottom Navigation Bar */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <View style={styles.toolbar}>
          <TouchableOpacity
            onPress={() => webViewRef.current?.goBack()}
            disabled={!navState.canGoBack}
            style={styles.toolbarButton}
          >
            <Ionicons name="chevron-back" size={24} color={navState.canGoBack ? "#3B82F6" : "#D1D5DB"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => webViewRef.current?.goForward()}
            disabled={!navState.canGoForward}
            style={styles.toolbarButton}
          >
            <Ionicons name="chevron-forward" size={24} color={navState.canGoForward ? "#3B82F6" : "#D1D5DB"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => webViewRef.current?.reload()}
            style={styles.toolbarButton}
          >
            <Ionicons name="refresh" size={24} color="#3B82F6" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={openExternal}
            style={styles.toolbarButton}
          >
            <Ionicons name="globe-outline" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressBarContainer: {
    height: 3,
    width: '100%',
    backgroundColor: '#F3F4F6',
    zIndex: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 5,
  },
  bottomBar: {
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  toolbarButton: {
    padding: 8,
    borderRadius: 8,
  },
});