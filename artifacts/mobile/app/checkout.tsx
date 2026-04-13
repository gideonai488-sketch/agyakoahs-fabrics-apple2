import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";

const STEPS = ["Address", "Payment", "Review"];

const PAYMENT_METHODS = [
  { id: "card", icon: "credit-card", label: "Credit / Debit Card" },
  { id: "paypal", icon: "dollar-sign", label: "PayPal" },
  { id: "apple", icon: "smartphone", label: "Apple Pay" },
  { id: "google", icon: "smartphone", label: "Google Pay" },
];

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { items, totalPrice, totalItems, clearCart } = useCart();

  const [step, setStep] = useState(0);
  const [isPlacing, setIsPlacing] = useState(false);

  const [address, setAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");

  const shipping = totalPrice > 35 ? 0 : 2.99;
  const tax = totalPrice * 0.08;
  const orderTotal = totalPrice + shipping + tax;
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  async function handlePlaceOrder() {
    setIsPlacing(true);
    await new Promise((r) => setTimeout(r, 2000));
    clearCart();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/order-success" as never);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Checkout</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={[styles.stepsRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {STEPS.map((s, i) => (
          <Pressable
            key={s}
            style={styles.step}
            onPress={() => i < step && setStep(i)}
          >
            <View style={[
              styles.stepCircle,
              { backgroundColor: i <= step ? colors.primary : colors.muted },
            ]}>
              {i < step ? (
                <Feather name="check" size={14} color="#fff" />
              ) : (
                <Text style={[styles.stepNum, { color: i === step ? "#fff" : colors.mutedForeground }]}>
                  {i + 1}
                </Text>
              )}
            </View>
            <Text style={[styles.stepLabel, { color: i <= step ? colors.primary : colors.mutedForeground }]}>
              {s}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {step === 0 && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Delivery Address</Text>
            {[
              { key: "name", label: "Full Name", placeholder: "John Doe" },
              { key: "phone", label: "Phone Number", placeholder: "+1 (555) 123-4567" },
              { key: "street", label: "Street Address", placeholder: "123 Main Street, Apt 4B" },
              { key: "city", label: "City", placeholder: "New York" },
              { key: "state", label: "State", placeholder: "NY" },
              { key: "zip", label: "ZIP Code", placeholder: "10001" },
            ].map((field) => (
              <View key={field.key} style={{ marginBottom: 14 }}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{field.label}</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                  value={address[field.key as keyof typeof address]}
                  onChangeText={(v) => setAddress((a) => ({ ...a, [field.key]: v }))}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            ))}
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment Method</Text>
            <View style={{ gap: 10 }}>
              {PAYMENT_METHODS.map((pm) => (
                <Pressable
                  key={pm.id}
                  style={[
                    styles.paymentOption,
                    {
                      backgroundColor: colors.card,
                      borderColor: paymentMethod === pm.id ? colors.primary : colors.border,
                      borderWidth: paymentMethod === pm.id ? 2 : 1,
                    },
                  ]}
                  onPress={() => setPaymentMethod(pm.id)}
                >
                  <Feather
                    name={pm.icon as never}
                    size={22}
                    color={paymentMethod === pm.id ? colors.primary : colors.mutedForeground}
                  />
                  <Text style={[styles.paymentLabel, { color: colors.foreground }]}>{pm.label}</Text>
                  {paymentMethod === pm.id && (
                    <Feather name="check-circle" size={20} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>

            {paymentMethod === "card" && (
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Card Number</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                />
                <View style={{ flexDirection: "row" as const, gap: 12, marginTop: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Expiry</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                      placeholder="MM / YY"
                      placeholderTextColor={colors.mutedForeground}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: colors.foreground }]}>CVV</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                      placeholder="123"
                      placeholderTextColor={colors.mutedForeground}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Review Order</Text>

            <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Delivery to</Text>
              <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
                {address.name || "Your Name"}, {address.street || "Your Address"}
              </Text>
              <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
                {address.city || "City"}, {address.state || "State"} {address.zip || "ZIP"}
              </Text>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: colors.card, marginTop: 10 }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Payment</Text>
              <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
                {PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label}
              </Text>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: colors.card, marginTop: 10 }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Items ({totalItems})</Text>
              {items.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.foreground }]}>x{item.quantity}</Text>
                </View>
              ))}
              {items.length > 3 && (
                <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
                  +{items.length - 3} more items
                </Text>
              )}

              <View style={[styles.totalDivider, { borderTopColor: colors.border }]}>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Subtotal</Text>
                  <Text style={[styles.totalValue, { color: colors.foreground }]}>${totalPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Shipping</Text>
                  <Text style={[styles.totalValue, { color: shipping === 0 ? colors.success : colors.foreground }]}>
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Tax</Text>
                  <Text style={[styles.totalValue, { color: colors.foreground }]}>${tax.toFixed(2)}</Text>
                </View>
                <View style={[styles.totalRow, { marginTop: 8 }]}>
                  <Text style={[styles.grandTotal, { color: colors.foreground }]}>Total</Text>
                  <Text style={[styles.grandTotalValue, { color: colors.primary }]}>${orderTotal.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: bottomPadding + 90 }} />
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.card, paddingBottom: bottomPadding + 10, borderTopColor: colors.border }]}>
        <Pressable
          style={{ flex: 1, borderRadius: 14, overflow: "hidden" }}
          onPress={() => {
            if (step < STEPS.length - 1) {
              setStep((s) => s + 1);
            } else {
              handlePlaceOrder();
            }
          }}
          disabled={isPlacing}
        >
          <LinearGradient colors={["#FF4500", "#FF6B35"]} style={styles.nextBtn}>
            {isPlacing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.nextBtnText}>
                  {step < STEPS.length - 1 ? "Continue" : `Place Order • $${orderTotal.toFixed(2)}`}
                </Text>
                {!isPlacing && <Feather name="arrow-right" size={18} color="#fff" />}
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row" as const,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  stepsRow: {
    flexDirection: "row" as const,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  step: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: {
    fontSize: 14,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  paymentOption: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
  },
  paymentLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  summaryCard: {
    borderRadius: 14,
    padding: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  itemRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    marginTop: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  itemPrice: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
  },
  totalDivider: {
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 12,
  },
  totalRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  totalValue: {
    fontSize: 13,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  grandTotal: {
    fontSize: 16,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  nextBtn: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
});
