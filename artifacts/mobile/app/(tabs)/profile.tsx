import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { fetchMyOrders, fetchWishlist } from "@/lib/db";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { user, isAuthenticated, logout, deleteAccount } = useAuth();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const [orderCount, setOrderCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      const [orders, wishlist] = await Promise.all([
        fetchMyOrders(user.id),
        fetchWishlist(user.id),
      ]);
      setOrderCount(orders.length);
      setWishlistCount(wishlist.length);
    } catch {
      // silent
    }
  }, [user]);

  useEffect(() => { loadStats(); }, [loadStats]);

  async function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
        },
      },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your data including orders and wishlist. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Are you absolutely sure?",
              `You are about to delete the account for ${user?.email}. All your data will be lost forever.`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, Delete Forever",
                  style: "destructive",
                  onPress: async () => {
                    setIsDeletingAccount(true);
                    try {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                      await deleteAccount();
                    } catch {
                      setIsDeletingAccount(false);
                      Alert.alert("Error", "Could not delete your account. Please try again or contact support.");
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "G";

  const MENU_ITEMS = [
    {
      section: "Shopping",
      items: [
        {
          icon: "heart",
          label: "My Wishlist",
          desc: `${wishlistCount} saved item${wishlistCount !== 1 ? "s" : ""}`,
          onPress: () => router.push("/wishlist" as never),
        },
        {
          icon: "package",
          label: "My Orders",
          desc: `${orderCount} order${orderCount !== 1 ? "s" : ""}`,
          onPress: () => router.push("/(tabs)/orders" as never),
        },
      ],
    },
    {
      section: "Account",
      items: [
        { icon: "user", label: "Personal Info", desc: "Your account details", onPress: () => router.push("/profile/personal-info" as never) },
        { icon: "map-pin", label: "Addresses", desc: "Saved delivery addresses", onPress: () => router.push("/profile/addresses" as never) },
        { icon: "credit-card", label: "Payment Methods", desc: "Cards and mobile money", onPress: () => router.push("/profile/payment-methods" as never) },
      ],
    },
    {
      section: "Support",
      items: [
        { icon: "help-circle", label: "Help Center", desc: "FAQ and support", onPress: () => router.push("/profile/help-center" as never) },
        { icon: "shield", label: "Privacy Policy", desc: "How we use your data", onPress: () => router.push("/profile/privacy-policy" as never) },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.profileHeader, { paddingTop: topPadding + 20, backgroundColor: colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          {isAuthenticated ? (
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.foreground }]}>{user?.name}</Text>
              <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{user?.email}</Text>
              <View style={styles.memberBadge}>
                <Feather name="award" size={12} color={colors.primary} />
                <Text style={[styles.memberText, { color: colors.primary }]}>Member</Text>
              </View>
            </View>
          ) : (
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.foreground }]}>Guest User</Text>
              <Pressable
                onPress={() => router.push("/auth/login" as never)}
                style={[styles.signInBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.signInBtnText}>Sign In / Register</Text>
              </Pressable>
            </View>
          )}
        </View>

        {isAuthenticated && (
          <View style={styles.statsRow}>
            {[
              { label: "Orders", value: String(orderCount), icon: "package", onPress: () => router.push("/(tabs)/orders" as never) },
              { label: "Wishlist", value: String(wishlistCount), icon: "heart", onPress: () => router.push("/wishlist" as never) },
            ].map((stat) => (
              <Pressable
                key={stat.label}
                onPress={stat.onPress}
                style={[styles.statBox, { backgroundColor: colors.card }]}
              >
                <Feather name={stat.icon as never} size={22} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {MENU_ITEMS.map((section) => (
          <View key={section.section} style={{ marginBottom: 8 }}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              {section.section.toUpperCase()}
            </Text>
            <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
              {section.items.map((item, idx) => (
                <Pressable
                  key={item.label}
                  style={[
                    styles.menuItem,
                    idx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                  onPress={(item as any).onPress}
                >
                  <View style={[styles.menuIconBg, { backgroundColor: colors.accent }]}>
                    <Feather name={item.icon as never} size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                    <Text style={[styles.menuDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {isAuthenticated && (
          <>
            <Pressable
              onPress={handleLogout}
              style={[styles.logoutBtn, { backgroundColor: colors.card }]}
            >
              <Feather name="log-out" size={20} color={colors.destructive} />
              <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
            </Pressable>

            <Pressable
              onPress={handleDeleteAccount}
              disabled={isDeletingAccount}
              style={styles.deleteAccountBtn}
            >
              <Text style={styles.deleteAccountText}>
                {isDeletingAccount ? "Deleting account…" : "Delete Account"}
              </Text>
            </Pressable>
          </>
        )}

        <View style={{ height: bottomPadding + 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: { paddingHorizontal: 20, paddingBottom: 24, flexDirection: "row" as const, alignItems: "center", gap: 16 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 26, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: "700" as const, fontFamily: "Inter_700Bold", marginBottom: 2 },
  userEmail: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 6 },
  memberBadge: { flexDirection: "row" as const, alignItems: "center", gap: 4 },
  memberText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  signInBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: "flex-start", marginTop: 6 },
  signInBtnText: { fontSize: 13, fontWeight: "600" as const, color: "#fff", fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row" as const, gap: 12, padding: 16 },
  statBox: { flex: 1, alignItems: "center", padding: 16, borderRadius: 16, gap: 6 },
  statValue: { fontSize: 22, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const, paddingHorizontal: 16, paddingBottom: 8, letterSpacing: 0.8 },
  menuCard: { overflow: "hidden" },
  menuItem: { flexDirection: "row" as const, alignItems: "center", gap: 12, padding: 14, paddingHorizontal: 16 },
  menuIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 14, fontWeight: "500" as const, fontFamily: "Inter_500Medium", marginBottom: 1 },
  menuDesc: { fontSize: 11, fontFamily: "Inter_400Regular" },
  logoutBtn: { flexDirection: "row" as const, alignItems: "center", justifyContent: "center", gap: 10, padding: 16, marginTop: 8 },
  logoutText: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  deleteAccountBtn: { alignItems: "center", paddingVertical: 14, marginTop: 4, marginBottom: 8 },
  deleteAccountText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#aaa", textDecorationLine: "underline" as const },
});
