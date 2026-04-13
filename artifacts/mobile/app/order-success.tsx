import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function OrderSuccessScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const ORDER_ID = "ORD-" + Math.floor(1000 + Math.random() * 9000);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <LinearGradient
          colors={["#22c55e", "#16a34a"]}
          style={styles.successIcon}
        >
          <Feather name="check" size={48} color="#fff" />
        </LinearGradient>
      </Animated.View>

      <Animated.View style={{ alignItems: "center", opacity: fadeAnim }}>
        <Text style={[styles.successTitle, { color: colors.foreground }]}>Order Placed!</Text>
        <Text style={[styles.successSubtitle, { color: colors.mutedForeground }]}>
          Your order has been placed successfully
        </Text>

        <View style={[styles.orderCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.orderId, { color: colors.mutedForeground }]}>Order ID</Text>
          <Text style={[styles.orderIdValue, { color: colors.foreground }]}>{ORDER_ID}</Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <Feather name="truck" size={16} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.foreground }]}>
              Estimated delivery: 3-7 business days
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Feather name="mail" size={16} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.foreground }]}>
              Confirmation email sent
            </Text>
          </View>
        </View>

        <Pressable
          style={{ width: "100%", borderRadius: 16, overflow: "hidden", marginBottom: 12 }}
          onPress={() => router.replace("/(tabs)/orders" as never)}
        >
          <LinearGradient colors={["#FF4500", "#FF6B35"]} style={{ paddingVertical: 16, alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" }}>
              Track My Order
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          style={[styles.continueBtn, { borderColor: colors.border }]}
          onPress={() => router.replace("/(tabs)/" as never)}
        >
          <Text style={[styles.continueBtnText, { color: colors.foreground }]}>
            Continue Shopping
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  successIcon: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    fontSize: 30,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 28,
    textAlign: "center",
  },
  orderCard: {
    width: "100%",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  orderId: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  orderIdValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },
  divider: {
    height: 1,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  continueBtn: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1.5,
  },
  continueBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
});
