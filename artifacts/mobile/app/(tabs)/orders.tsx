import { Feather } from "@expo/vector-icons";
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

const MOCK_ORDERS = [
  {
    id: "ORD-8821",
    date: "Apr 10, 2026",
    status: "Delivered",
    statusColor: "#22c55e",
    items: 3,
    total: 42.97,
    products: ["Premium Wireless Earbuds", "Women Summer Dress", "Smart Watch"],
  },
  {
    id: "ORD-7734",
    date: "Apr 5, 2026",
    status: "In Transit",
    statusColor: "#3b82f6",
    items: 1,
    total: 14.99,
    products: ["Yoga Mat Non-Slip"],
  },
  {
    id: "ORD-6612",
    date: "Mar 28, 2026",
    status: "Processing",
    statusColor: "#f59e0b",
    items: 2,
    total: 28.48,
    products: ["Luxury Face Serum", "Stainless Steel Bottle"],
  },
  {
    id: "ORD-5509",
    date: "Mar 15, 2026",
    status: "Delivered",
    statusColor: "#22c55e",
    items: 1,
    total: 5.99,
    products: ["Sunglasses Polarized"],
  },
];

const TABS = ["All", "Active", "Delivered", "Cancelled"];

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState("All");
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = MOCK_ORDERS.filter((o) => {
    if (activeTab === "All") return true;
    if (activeTab === "Active") return o.status !== "Delivered" && o.status !== "Cancelled";
    if (activeTab === "Delivered") return o.status === "Delivered";
    if (activeTab === "Cancelled") return o.status === "Cancelled";
    return true;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Orders</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
          <View style={{ flexDirection: "row" as const, gap: 8, paddingBottom: 2 }}>
            {TABS.map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: activeTab === tab ? colors.primary : colors.background,
                    borderColor: activeTab === tab ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    { color: activeTab === tab ? "#fff" : colors.mutedForeground },
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12 }}>
        {filtered.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Feather name="package" size={56} color={colors.border} />
            <Text style={{ fontSize: 18, fontWeight: "600" as const, color: colors.foreground, marginTop: 16, fontFamily: "Inter_600SemiBold" }}>
              No orders yet
            </Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground, marginTop: 6, fontFamily: "Inter_400Regular" }}>
              Your orders will appear here
            </Text>
          </View>
        ) : (
          filtered.map((order) => (
            <Pressable key={order.id} style={[styles.orderCard, { backgroundColor: colors.card }]}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={[styles.orderId, { color: colors.foreground }]}>{order.id}</Text>
                  <Text style={[styles.orderDate, { color: colors.mutedForeground }]}>{order.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: order.statusColor + "20" }]}>
                  <View style={[styles.statusDot, { backgroundColor: order.statusColor }]} />
                  <Text style={[styles.statusText, { color: order.statusColor }]}>{order.status}</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.productsList}>
                {order.products.map((p, i) => (
                  <View key={i} style={styles.productRow}>
                    <Feather name="package" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={1}>
                      {p}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.orderFooter}>
                <Text style={[styles.itemCount, { color: colors.mutedForeground }]}>
                  {order.items} item{order.items > 1 ? "s" : ""}
                </Text>
                <Text style={[styles.orderTotal, { color: colors.primary }]}>
                  ${order.total.toFixed(2)}
                </Text>
              </View>

              {order.status === "In Transit" && (
                <View style={[styles.trackBar, { backgroundColor: colors.accent }]}>
                  <Feather name="truck" size={14} color={colors.primary} />
                  <Text style={[styles.trackText, { color: colors.primary }]}>Track your package</Text>
                  <Feather name="chevron-right" size={14} color={colors.primary} />
                </View>
              )}
            </Pressable>
          ))
        )}
        <View style={{ height: bottomPadding + 90 }} />
      </ScrollView>
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
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  orderCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 15,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  orderDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  productsList: {
    gap: 6,
    marginBottom: 12,
  },
  productRow: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 8,
  },
  productName: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  orderFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  trackBar: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  trackText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
