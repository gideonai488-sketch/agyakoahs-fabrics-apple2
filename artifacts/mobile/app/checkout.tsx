import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { createOrder, initializePaystackPayment, updateOrderStatus } from "@/lib/db";

const STEPS = ["Address", "Payment", "Review"];

const PAYMENT_METHODS = [
  { id: "paystack", icon: "credit-card", label: "Pay with Paystack" },
  { id: "cash", icon: "dollar-sign", label: "Cash on Delivery" },
];

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [isPlacing, setIsPlacing] = useState(false);

  const [address, setAddress] = useState({
    name: user?.name ?? "",
    phone: "",
    region: "",
    city: "",
    address: "",
    landmark: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("paystack");

  const orderTotal = totalPrice;
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  function validateAddress() {
    const { name, phone, region, city, address: addr } = address;
    if (!name.trim() || !phone.trim() || !region.trim() || !city.trim() || !addr.trim()) {
      Alert.alert("Missing Info", "Please fill in all required delivery fields.");
      return false;
    }
    return true;
  }

  async function handlePlaceOrder() {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to place an order.");
      return;
    }
    if (!validateAddress()) return;

    setIsPlacing(true);
    try {
      const order = await createOrder(
        {
          user_id: user.id,
          status: "pending",
          total_amount: orderTotal,
          delivery_name: address.name,
          delivery_phone: address.phone,
          delivery_region: address.region,
          delivery_city: address.city,
          delivery_address: address.address,
          delivery_landmark: address.landmark,
          payment_method: paymentMethod,
        },
        items.map((item) => ({
          product_id: item.productId,
          product_name: item.name,
          product_image: item.image,
          price: item.price,
          quantity: item.quantity,
        }))
      );

      if (paymentMethod === "paystack") {
        const { authorization_url, reference } = await initializePaystackPayment(
          order.id,
          user.email,
          Math.round(orderTotal * 100)
        );

        const result = await WebBrowser.openBrowserAsync(authorization_url);

        if (result.type === "cancel" || result.type === "dismiss") {
          await updateOrderStatus(order.id, "pending");
          Alert.alert("Payment Pending", "Payment was not completed. You can retry from My Orders.");
          router.replace("/(tabs)/orders" as never);
          return;
        }

        await updateOrderStatus(order.id, "paid", reference);
      } else {
        await updateOrderStatus(order.id, "processing");
      }

      clearCart();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/order-success" as never);
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to place order. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  }

  const FIELDS = [
    { key: "name", label: "Full Name *", placeholder: "John Mensah", kb: "default" },
    { key: "phone", label: "Phone Number *", placeholder: "+233 24 000 0000", kb: "phone-pad" },
    { key: "region", label: "Region *", placeholder: "Greater Accra", kb: "default" },
    { key: "city", label: "City / Town *", placeholder: "Accra", kb: "default" },
    { key: "address", label: "Street Address *", placeholder: "123 Liberation Road", kb: "default" },
    { key: "landmark", label: "Landmark (optional)", placeholder: "Near Shoprite Mall", kb: "default" },
  ];

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
          <Pressable key={s} style={styles.step} onPress={() => i < step && setStep(i)}>
            <View style={[styles.stepCircle, { backgroundColor: i <= step ? colors.primary : colors.muted }]}>
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
            {FIELDS.map((field) => (
              <View key={field.key} style={{ marginBottom: 14 }}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{field.label}</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                  value={address[field.key as keyof typeof address]}
                  onChangeText={(v) => setAddress((a) => ({ ...a, [field.key]: v }))}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType={field.kb as any}
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
                  <View style={[styles.pmIcon, { backgroundColor: colors.accent }]}>
                    <Feather name={pm.icon as never} size={20} color={colors.primary} />
                  </View>
                  <Text style={[styles.paymentLabel, { color: colors.foreground }]}>{pm.label}</Text>
                  {paymentMethod === pm.id && (
                    <Feather name="check-circle" size={20} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
            {paymentMethod === "paystack" && (
              <View style={[styles.infoBox, { backgroundColor: colors.accent }]}>
                <Feather name="info" size={16} color={colors.primary} />
                <Text style={{ flex: 1, fontSize: 12, color: colors.primary, fontFamily: "Inter_400Regular" }}>
                  You'll be redirected to Paystack to complete secure payment via card, mobile money, or bank transfer.
                </Text>
              </View>
            )}
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Review Order</Text>

            <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Delivery to</Text>
              <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{address.name}</Text>
              <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{address.address}, {address.city}</Text>
              <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{address.region} · {address.phone}</Text>
              {address.landmark ? (
                <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>Landmark: {address.landmark}</Text>
              ) : null}
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
                  <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.itemQty, { color: colors.foreground }]}>x{item.quantity}</Text>
                </View>
              ))}
              {items.length > 3 && (
                <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>+{items.length - 3} more</Text>
              )}
              <View style={[styles.totalDivider, { borderTopColor: colors.border }]}>
                <View style={styles.totalRow}>
                  <Text style={[styles.grandTotal, { color: colors.foreground }]}>Total</Text>
                  <Text style={[styles.grandTotalValue, { color: colors.primary }]}>GH₵{orderTotal.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: bottomPadding + 90 }} />
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.card, paddingBottom: bottomPadding + 10, borderTopColor: colors.border }]}>
        <Pressable
          style={[styles.nextBtn, { backgroundColor: colors.primary, opacity: isPlacing ? 0.7 : 1 }]}
          onPress={() => {
            if (step === 0) {
              if (!validateAddress()) return;
              setStep(1);
            } else if (step < STEPS.length - 1) {
              setStep((s) => s + 1);
            } else {
              handlePlaceOrder();
            }
          }}
          disabled={isPlacing}
        >
          {isPlacing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.nextBtnText}>
                {step < STEPS.length - 1
                  ? "Continue"
                  : paymentMethod === "paystack"
                  ? `Pay GH₵${orderTotal.toFixed(2)} via Paystack`
                  : `Place Order · GH₵${orderTotal.toFixed(2)}`}
              </Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row" as const, alignItems: "center", paddingHorizontal: 16, paddingBottom: 14 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "700" as const, fontFamily: "Inter_700Bold", textAlign: "center" },
  stepsRow: { flexDirection: "row" as const, paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1 },
  step: { flex: 1, alignItems: "center", gap: 6 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  stepNum: { fontSize: 14, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  stepLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  sectionTitle: { fontSize: 20, fontWeight: "700" as const, fontFamily: "Inter_700Bold", marginBottom: 18 },
  fieldLabel: { fontSize: 13, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  textInput: { borderRadius: 12, paddingHorizontal: 14, height: 50, fontSize: 14, fontFamily: "Inter_400Regular", borderWidth: 1 },
  paymentOption: { flexDirection: "row" as const, alignItems: "center", gap: 12, padding: 16, borderRadius: 14 },
  pmIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  paymentLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  infoBox: { flexDirection: "row" as const, gap: 10, padding: 14, borderRadius: 12, marginTop: 14, alignItems: "flex-start" },
  summaryCard: { borderRadius: 14, padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: "700" as const, fontFamily: "Inter_700Bold", marginBottom: 6 },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  itemRow: { flexDirection: "row" as const, justifyContent: "space-between", marginTop: 8 },
  itemName: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  itemQty: { fontSize: 13, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  totalDivider: { borderTopWidth: 1, marginTop: 14, paddingTop: 12 },
  totalRow: { flexDirection: "row" as const, justifyContent: "space-between", marginBottom: 8 },
  grandTotal: { fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  grandTotalValue: { fontSize: 20, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 14, borderTopWidth: 1 },
  nextBtn: { borderRadius: 14, flexDirection: "row" as const, alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 8 },
  nextBtnText: { fontSize: 15, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" },
});
