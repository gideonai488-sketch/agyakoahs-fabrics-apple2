import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { fetchMyOrders } from "@/lib/db";
import type { DbOrder } from "@/lib/supabase";

const TABS = ["All", "Active", "Delivered", "Cancelled"];

function statusColor(status: string) {
  switch (status) {
    case "delivered": return "#22c55e";
    case "shipped": return "#3b82f6";
    case "processing": return "#f59e0b";
    case "paid": return "#8b5cf6";
    case "cancelled": return "#ef4444";
    default: return "#888888";
  }
}

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("All");
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const loadOrders = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    try {
      const data = await fetchMyOrders(user.id);
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  function onRefresh() {
    setRefreshing(true);
    loadOrders();
  }

  const filtered = orders.filter((o) => {
    if (activeTab === "All") return true;
    if (activeTab === "Active") return !["delivered", "cancelled"].includes(o.status);
    if (activeTab === "Delivered") return o.status === "delivered";
    if (activeTab === "Cancelled") return o.status === "cancelled";
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
                <Text style={[styles.tabChipText, { color: activeTab === tab ? "#fff" : colors.mutedForeground }]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {!isAuthenticated ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Feather name="package" size={56} color={colors.border} />
          <Text style={{ fontSize: 18, fontWeight: "600" as const, color: colors.foreground, marginTop: 16, fontFamily: "Inter_600SemiBold", textAlign: "center" }}>
            Sign in to view orders
          </Text>
          <Text style={{ fontSize: 13, color: colors.mutedForeground, marginTop: 6, fontFamily: "Inter_400Regular", textAlign: "center" }}>
            Your order history will appear here after signing in.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {isLoading ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : filtered.length === 0 ? (
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
            filtered.map((order) => {
              const sc = statusColor(order.status);
              const items = order.order_items ?? [];
              return (
                <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.card }]}>
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={[styles.orderId, { color: colors.foreground }]}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Text>
                      <Text style={[styles.orderDate, { color: colors.mutedForeground }]}>
                        {formatDate(order.created_at)}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: sc + "20" }]}>
                      <View style={[styles.statusDot, { backgroundColor: sc }]} />
                      <Text style={[styles.statusText, { color: sc }]}>{statusLabel(order.status)}</Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <View style={styles.productsList}>
                    {items.slice(0, 3).map((item, i) => (
                      <View key={i} style={styles.productRow}>
                        <Feather name="package" size={12} color={colors.mutedForeground} />
                        <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={1}>
                          {item.product_name}
                        </Text>
                        <Text style={[styles.productQty, { color: colors.mutedForeground }]}>x{item.quantity}</Text>
                      </View>
                    ))}
                    {items.length > 3 && (
                      <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 }}>
                        +{items.length - 3} more items
                      </Text>
                    )}
                  </View>

                  <View style={styles.orderFooter}>
                    <Text style={[styles.itemCount, { color: colors.mutedForeground }]}>
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </Text>
                    <Text style={[styles.orderTotal, { color: colors.primary }]}>
                      GH₵{Number(order.total_amount).toFixed(2)}
                    </Text>
                  </View>

                  {["shipped", "processing"].includes(order.status) && (
                    <View style={[styles.trackBar, { backgroundColor: colors.accent }]}>
                      <Feather name="truck" size={14} color={colors.primary} />
                      <Text style={[styles.trackText, { color: colors.primary }]}>Track your order</Text>
                      <Feather name="chevron-right" size={14} color={colors.primary} />
                    </View>
                  )}
                </View>
              );
            })
          )}
          <View style={{ height: bottomPadding + 90 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 16, elevation: 3 },
  headerTitle: { fontSize: 24, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  tabChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  tabChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  orderCard: { borderRadius: 16, padding: 16, elevation: 2 },
  orderHeader: { flexDirection: "row" as const, justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  orderId: { fontSize: 15, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  orderDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadge: { flexDirection: "row" as const, alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, marginBottom: 12 },
  productsList: { gap: 6, marginBottom: 12 },
  productRow: { flexDirection: "row" as const, alignItems: "center", gap: 8 },
  productName: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  productQty: { fontSize: 12, fontFamily: "Inter_400Regular" },
  orderFooter: { flexDirection: "row" as const, justifyContent: "space-between", alignItems: "center" },
  itemCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  orderTotal: { fontSize: 18, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  trackBar: { flexDirection: "row" as const, alignItems: "center", gap: 8, padding: 10, borderRadius: 10, marginTop: 12 },
  trackText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
});
