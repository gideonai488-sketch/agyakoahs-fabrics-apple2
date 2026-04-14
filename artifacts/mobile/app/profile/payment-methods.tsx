import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const METHODS = [
  {
    icon: "smartphone",
    name: "MTN Mobile Money",
    desc: "Pay with your MTN MoMo wallet",
    badge: "Popular",
  },
  {
    icon: "smartphone",
    name: "Vodafone Cash",
    desc: "Pay with Vodafone Cash",
    badge: null,
  },
  {
    icon: "smartphone",
    name: "AirtelTigo Money",
    desc: "Pay with AirtelTigo Money",
    badge: null,
  },
  {
    icon: "credit-card",
    name: "Visa / Mastercard",
    desc: "Pay with any debit or credit card",
    badge: null,
  },
];

const HOW_IT_WORKS = [
  { step: "1", text: "At checkout, choose Paystack as your payment method" },
  { step: "2", text: "You'll be securely redirected to complete your payment" },
  { step: "3", text: "Choose Mobile Money or Card and follow the prompts" },
  { step: "4", text: "Your order is confirmed once payment is verified" },
];

export default function PaymentMethodsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Payment Methods</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottomPadding + 40 }}>
        <View style={[styles.paystackBadge, { backgroundColor: colors.accent }]}>
          <View style={[styles.paystackIcon, { backgroundColor: colors.primary }]}>
            <Feather name="shield" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.paystackTitle, { color: colors.foreground }]}>Secured by Paystack</Text>
            <Text style={[styles.paystackSub, { color: colors.mutedForeground }]}>
              All payments are encrypted with 256-bit SSL
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCEPTED PAYMENT METHODS</Text>
        <View style={[styles.methodsCard, { backgroundColor: colors.card }]}>
          {METHODS.map((method, idx) => (
            <View
              key={method.name}
              style={[styles.methodRow, idx < METHODS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <View style={[styles.methodIcon, { backgroundColor: colors.accent }]}>
                <Feather name={method.icon as never} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={[styles.methodName, { color: colors.foreground }]}>{method.name}</Text>
                  {method.badge && (
                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.badgeText}>{method.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.methodDesc, { color: colors.mutedForeground }]}>{method.desc}</Text>
              </View>
              <Feather name="check-circle" size={18} color={colors.primary} />
            </View>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>HOW IT WORKS</Text>
        <View style={[styles.stepsCard, { backgroundColor: colors.card }]}>
          {HOW_IT_WORKS.map((item, idx) => (
            <View
              key={idx}
              style={[styles.stepRow, idx < HOW_IT_WORKS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumText}>{item.step}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.foreground }]}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.noteBox, { backgroundColor: colors.accent }]}>
          <Feather name="info" size={15} color={colors.primary} />
          <Text style={{ flex: 1, fontSize: 12, color: colors.primary, fontFamily: "Inter_400Regular", lineHeight: 18 }}>
            Agyakoahs Fabrics does not store your payment details. All transactions are handled securely by Paystack.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  paystackBadge: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, marginBottom: 20 },
  paystackIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  paystackTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  paystackSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", fontWeight: "600", letterSpacing: 0.8, marginBottom: 10 },
  methodsCard: { borderRadius: 16, overflow: "hidden", marginBottom: 20 },
  methodRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  methodIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  methodName: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  methodDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_600SemiBold", fontWeight: "600" },
  stepsCard: { borderRadius: 16, overflow: "hidden", marginBottom: 16 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
  stepNum: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  stepNumText: { color: "#fff", fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  stepText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, paddingTop: 3 },
  noteBox: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, alignItems: "flex-start" },
});
