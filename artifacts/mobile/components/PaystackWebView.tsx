import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, WebViewNavigation } from "react-native-webview";

import { useColors } from "@/hooks/useColors";

const CALLBACK_HOST = "agyakoahsfabrics.com";
const CALLBACK_PATH = "/payment-callback";

interface Props {
  visible: boolean;
  authorizationUrl: string;
  reference: string;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}

export default function PaystackWebView({ visible, authorizationUrl, reference, onSuccess, onCancel }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [hasDetected, setHasDetected] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  // Reset state every time a new payment session opens
  useEffect(() => {
    if (visible) {
      setHasDetected(false);
      setLoading(true);
    }
  }, [visible]);

  function handleNavigationChange(navState: WebViewNavigation) {
    const url = navState.url ?? "";

    const isCallback =
      url.includes(CALLBACK_HOST + CALLBACK_PATH) ||
      (url.includes("trxref=") && !url.includes("checkout.paystack.com")) ||
      (url.includes("reference=") && url.includes("paystack"));

    if (isCallback && !hasDetected) {
      setHasDetected(true);

      let detectedRef = reference;
      try {
        const parsed = new URL(url);
        detectedRef =
          parsed.searchParams.get("trxref") ??
          parsed.searchParams.get("reference") ??
          reference;
      } catch {
        // use original reference
      }

      onSuccess(detectedRef);
    }
  }

  function handleClose() {
    if (!hasDetected) {
      onCancel();
    }
  }

  const injectedJS = `
    (function() {
      var originalOpen = window.open;
      window.open = function(url) {
        window.location.href = url;
      };
    })();
    true;
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { paddingTop: topPadding + 6, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.secureIcon, { backgroundColor: colors.accent }]}>
              <Feather name="lock" size={14} color={colors.primary} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Secure Payment</Text>
          </View>
          <Pressable onPress={handleClose} style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
            <Feather name="x" size={18} color={colors.foreground} />
          </Pressable>
        </View>

        <View style={[styles.poweredBar, { backgroundColor: colors.accent }]}>
          <Feather name="shield" size={12} color={colors.primary} />
          <Text style={[styles.poweredText, { color: colors.primary }]}>
            Secured by Paystack · GHS · 256-bit SSL
          </Text>
        </View>

        {authorizationUrl ? (
          <WebView
            ref={webViewRef}
            source={{ uri: authorizationUrl }}
            onNavigationStateChange={handleNavigationChange}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            injectedJavaScript={injectedJS}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            scalesPageToFit={Platform.OS === "android"}
            style={{ flex: 1 }}
            renderLoading={() => (
              <View style={[StyleSheet.absoluteFill, styles.loadingOverlay, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
                  Loading secure payment…
                </Text>
              </View>
            )}
          />
        ) : (
          <View style={[styles.loadingOverlay, { flex: 1, backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {loading && (
          <View style={[StyleSheet.absoluteFill, { top: 100 }, styles.loadingOverlay, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
              Loading secure payment…
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  secureIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  closeBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  poweredBar: { paddingHorizontal: 16, paddingVertical: 6, flexDirection: "row", alignItems: "center", gap: 6 },
  poweredText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  loadingOverlay: { alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
