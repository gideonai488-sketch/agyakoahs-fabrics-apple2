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

const SECTIONS = [
  {
    title: "Information We Collect",
    content:
      "We collect information you provide when creating an account, placing orders, and using our services. This includes your name, email address, phone number, and delivery addresses. We also collect device identifiers and usage data to improve your experience.",
  },
  {
    title: "How We Use Your Information",
    content:
      "Your information is used to process orders, deliver products, send order updates, and provide customer support. We may also use it to personalize your shopping experience and send promotional offers (which you can opt out of at any time).",
  },
  {
    title: "Payment Information",
    content:
      "All payment transactions are securely processed by Paystack. ShopHub does not store your card or mobile money details. Paystack's own privacy policy applies to payment data.",
  },
  {
    title: "Data Sharing",
    content:
      "We do not sell your personal data. We share information only with trusted service providers (delivery partners, payment processors) strictly necessary to fulfill your orders.",
  },
  {
    title: "Data Security",
    content:
      "We implement industry-standard security measures including 256-bit SSL encryption to protect your data. However, no method of transmission over the internet is 100% secure.",
  },
  {
    title: "Your Rights",
    content:
      "You have the right to access, correct, or delete your personal data. You can update your profile information in the app or contact our support team for account deletion requests.",
  },
  {
    title: "Cookies & Analytics",
    content:
      "Our app may use analytics tools to understand usage patterns and improve the service. This data is aggregated and does not personally identify you.",
  },
  {
    title: "Contact Us",
    content:
      "For privacy-related questions, contact us at privacy@shophub.app or write to ShopHub Privacy, Accra, Ghana.",
  },
];

export default function PrivacyPolicyScreen() {
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Privacy Policy</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottomPadding + 40 }}>
        <View style={[styles.topCard, { backgroundColor: colors.accent }]}>
          <Feather name="shield" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.topCardTitle, { color: colors.foreground }]}>Your Privacy Matters</Text>
            <Text style={[styles.topCardSub, { color: colors.mutedForeground }]}>
              Last updated: January 2025
            </Text>
          </View>
        </View>

        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          ShopHub ("we", "our", or "us") is committed to protecting your privacy. This policy explains how we collect, use, and protect your information.
        </Text>

        {SECTIONS.map((section, idx) => (
          <View key={idx} style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionNum, { backgroundColor: colors.primary }]}>
                <Text style={styles.sectionNumText}>{idx + 1}</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
            </View>
            <Text style={[styles.sectionContent, { color: colors.mutedForeground }]}>{section.content}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  topCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 14, marginBottom: 16 },
  topCardTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  topCardSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  intro: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 16 },
  sectionCard: { borderRadius: 14, padding: 14, marginBottom: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  sectionNum: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  sectionNumText: { fontSize: 12, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  sectionTitle: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold", flex: 1 },
  sectionContent: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
});
