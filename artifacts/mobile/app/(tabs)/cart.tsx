import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
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

import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCart();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const shipping = totalPrice > 35 ? 0 : 2.99;
  const tax = totalPrice * 0.08;
  const orderTotal = totalPrice + shipping + tax;

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", paddingTop: topPadding }}>
        <Feather name="shopping-cart" size={72} color={colors.border} />
        <Text style={{ fontSize: 22, fontWeight: "700" as const, color: colors.foreground, marginTop: 20, fontFamily: "Inter_700Bold" }}>
          Your cart is empty
        </Text>
        <Text style={{ fontSize: 14, color: colors.mutedForeground, marginTop: 8, fontFamily: "Inter_400Regular" }}>
          Start shopping to add items
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)/" as never)}
          style={{ marginTop: 28, borderRadius: 16, overflow: "hidden" }}
        >
          <LinearGradient colors={["#1F8C6B", "#27A87E"]} style={{ paddingHorizontal: 32, paddingVertical: 14 }}>
            <Text style={{ fontSize: 15, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" }}>
              Start Shopping
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Cart ({totalItems})</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={{ padding: 16, gap: 12 }}>
          {items.map((item) => (
            <View key={item.id} style={[styles.cartItem, { backgroundColor: colors.card }]}>
              <Image
                source={{ uri: item.image }}
                style={styles.itemImage}
                contentFit="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={2}>
                  {item.name}
                </Text>
                {item.size && (
                  <Text style={[styles.itemVariant, { color: colors.mutedForeground }]}>
                    Size: {item.size}
                  </Text>
                )}
                {item.color && (
                  <Text style={[styles.itemVariant, { color: colors.mutedForeground }]}>
                    Color: {item.color}
                  </Text>
                )}
                <View style={styles.itemBottom}>
                  <Text style={[styles.itemPrice, { color: colors.primary }]}>
                    GH₵{(item.price * item.quantity).toFixed(2)}
                  </Text>
                  <View style={styles.qtyRow}>
                    <Pressable
                      style={[styles.qtyBtn, { backgroundColor: colors.muted }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updateQuantity(item.id, item.quantity - 1);
                      }}
                    >
                      <Feather name="minus" size={14} color={colors.foreground} />
                    </Pressable>
                    <Text style={[styles.qtyText, { color: colors.foreground }]}>{item.quantity}</Text>
                    <Pressable
                      style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updateQuantity(item.id, item.quantity + 1);
                      }}
                    >
                      <Feather name="plus" size={14} color="#fff" />
                    </Pressable>
                  </View>
                </View>
              </View>
              <Pressable
                style={styles.deleteBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  removeItem(item.id);
                }}
              >
                <Feather name="trash-2" size={16} color={colors.destructive} />
              </Pressable>
            </View>
          ))}
        </View>

        <View style={[styles.summary, { backgroundColor: colors.card, marginHorizontal: 16 }]}>
          <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Order Summary</Text>

          {[
            { label: "Subtotal", value: `GH₵${totalPrice.toFixed(2)}` },
            { label: "Shipping", value: shipping === 0 ? "FREE" : `GH₵${shipping.toFixed(2)}` },
            { label: "Tax (8%)", value: `GH₵${tax.toFixed(2)}` },
          ].map((row) => (
            <View key={row.label} style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[styles.summaryValue, { color: row.label === "Shipping" && shipping === 0 ? colors.success : colors.foreground }]}>
                {row.value}
              </Text>
            </View>
          ))}

          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>GH₵{orderTotal.toFixed(2)}</Text>
          </View>

          {totalPrice < 35 && (
            <View style={[styles.freeShipBanner, { backgroundColor: colors.accent }]}>
              <Feather name="truck" size={14} color={colors.primary} />
              <Text style={[styles.freeShipText, { color: colors.primary }]}>
                Add GH₵{(35 - totalPrice).toFixed(2)} more for FREE shipping
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={[styles.checkoutBar, { backgroundColor: colors.card, paddingBottom: bottomPadding + 12, borderTopColor: colors.border }]}>
        <View style={styles.totalPreview}>
          <Text style={[styles.totalPreviewLabel, { color: colors.mutedForeground }]}>Total</Text>
          <Text style={[styles.totalPreviewValue, { color: colors.primary }]}>GH₵{orderTotal.toFixed(2)}</Text>
        </View>
        <Pressable
          style={styles.checkoutBtn}
          onPress={() => router.push("/checkout" as never)}
        >
          <LinearGradient colors={["#1F8C6B", "#27A87E"]} style={styles.checkoutBtnGradient}>
            <Text style={styles.checkoutBtnText}>Checkout ({totalItems})</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  cartItem: {
    borderRadius: 14,
    padding: 12,
    flexDirection: "row" as const,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
    fontFamily: "Inter_400Regular",
  },
  itemVariant: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  itemBottom: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  qtyRow: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 15,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
    minWidth: 20,
    textAlign: "center",
  },
  deleteBtn: {
    padding: 4,
    alignSelf: "flex-start",
  },
  summary: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  totalRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  freeShipBanner: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  freeShipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  checkoutBar: {
    flexDirection: "row" as const,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  totalPreview: {
    flex: 1,
  },
  totalPreviewLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  totalPreviewValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  checkoutBtn: {
    flex: 2,
    borderRadius: 14,
    overflow: "hidden",
  },
  checkoutBtnGradient: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  checkoutBtnText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
});
