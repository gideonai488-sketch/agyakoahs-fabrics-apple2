import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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

const FAQS = [
  {
    q: "How do I track my order?",
    a: "Go to the Orders tab to see real-time status updates for all your orders. You'll receive a notification when your order ships.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept all major debit/credit cards, MTN Mobile Money, Vodafone Cash, and AirtelTigo Money via Paystack.",
  },
  {
    q: "Can I cancel or modify my order?",
    a: "Orders can be cancelled within 1 hour of placement by contacting us. Once processing begins, cancellations are not possible.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard delivery within Accra takes 1–2 business days. Other regions may take 3–5 business days.",
  },
  {
    q: "What is your return policy?",
    a: "We accept returns within 7 days of delivery for unused items in original condition. Contact our support team to initiate a return.",
  },
  {
    q: "Is my payment information safe?",
    a: "Yes. All payments are processed securely by Paystack using 256-bit SSL encryption. We never store your card details.",
  },
  {
    q: "How do I change my delivery address?",
    a: "You can update your saved addresses in the Addresses section of your Profile. Address changes after order placement require contacting support.",
  },
];

export default function HelpCenterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Help Center</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottomPadding + 40 }}>
        <View style={[styles.heroBox, { backgroundColor: colors.accent }]}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primary }]}>
            <Feather name="help-circle" size={28} color="#fff" />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>How can we help?</Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            Browse our frequently asked questions below
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>FREQUENTLY ASKED QUESTIONS</Text>

        {FAQS.map((faq, idx) => (
          <Pressable
            key={idx}
            style={[styles.faqCard, { backgroundColor: colors.card, borderColor: expanded === idx ? colors.primary : "transparent", borderWidth: expanded === idx ? 1.5 : 0 }]}
            onPress={() => setExpanded(expanded === idx ? null : idx)}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.faqQ, { color: colors.foreground, flex: 1 }]}>{faq.q}</Text>
              <Feather
                name={expanded === idx ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.mutedForeground}
              />
            </View>
            {expanded === idx && (
              <Text style={[styles.faqA, { color: colors.mutedForeground }]}>{faq.a}</Text>
            )}
          </Pressable>
        ))}

        <View style={[styles.contactCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.contactTitle, { color: colors.foreground }]}>Still need help?</Text>
          <Text style={[styles.contactSub, { color: colors.mutedForeground }]}>
            Our support team is available Mon–Sat, 8am–6pm
          </Text>
          <View style={{ gap: 10, marginTop: 14 }}>
            {[
              { icon: "mail", label: "Email Support", value: "support@shophub.app" },
              { icon: "phone", label: "Call Us", value: "+233 30 000 0000" },
            ].map((c) => (
              <View key={c.label} style={[styles.contactRow, { backgroundColor: colors.accent }]}>
                <View style={[styles.contactIcon, { backgroundColor: colors.primary }]}>
                  <Feather name={c.icon as never} size={16} color="#fff" />
                </View>
                <View>
                  <Text style={[styles.contactLabel, { color: colors.mutedForeground }]}>{c.label}</Text>
                  <Text style={[styles.contactValue, { color: colors.foreground }]}>{c.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  heroBox: { borderRadius: 18, padding: 24, alignItems: "center", marginBottom: 24, gap: 10 },
  heroIcon: { width: 60, height: 60, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  heroTitle: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  heroSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", fontWeight: "600", letterSpacing: 0.8, marginBottom: 10 },
  faqCard: { borderRadius: 14, padding: 14, marginBottom: 8, backgroundColor: "#fff" },
  faqHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  faqQ: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  faqA: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, marginTop: 10 },
  contactCard: { borderRadius: 16, padding: 16, marginTop: 16 },
  contactTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  contactSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12 },
  contactIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  contactLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  contactValue: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});
