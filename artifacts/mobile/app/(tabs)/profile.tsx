import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
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

const MENU_ITEMS = [
  {
    section: "Account",
    items: [
      { icon: "user", label: "Personal Info", desc: "Manage your account details" },
      { icon: "map-pin", label: "Addresses", desc: "Saved delivery addresses" },
      { icon: "credit-card", label: "Payment Methods", desc: "Cards and wallets" },
    ],
  },
  {
    section: "Shopping",
    items: [
      { icon: "heart", label: "Wishlist", desc: "Saved items" },
      { icon: "package", label: "My Orders", desc: "Track and manage orders", onPress: () => router.push("/(tabs)/orders" as never) },
      { icon: "star", label: "My Reviews", desc: "Products you've reviewed" },
      { icon: "gift", label: "Coupons & Deals", desc: "Exclusive offers for you" },
    ],
  },
  {
    section: "Support",
    items: [
      { icon: "help-circle", label: "Help Center", desc: "FAQ and support" },
      { icon: "message-circle", label: "Live Chat", desc: "Chat with us" },
      { icon: "shield", label: "Privacy Policy", desc: "How we use your data" },
    ],
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { user, isAuthenticated, logout } = useAuth();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

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

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "G";

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
                <Text style={[styles.memberText, { color: colors.primary }]}>Gold Member</Text>
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

        <View style={styles.statsRow}>
          {[
            { label: "Orders", value: "4", icon: "package" },
            { label: "Wishlist", value: "12", icon: "heart" },
            { label: "Reviews", value: "7", icon: "star" },
            { label: "Coupons", value: "3", icon: "gift" },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statBox, { backgroundColor: colors.card }]}>
              <Feather name={stat.icon as never} size={20} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

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
                  onPress={item.onPress}
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
          <Pressable
            onPress={handleLogout}
            style={[styles.logoutBtn, { backgroundColor: colors.card }]}
          >
            <Feather name="log-out" size={20} color={colors.destructive} />
            <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
          </Pressable>
        )}

        <View style={{ height: bottomPadding + 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 6,
  },
  memberBadge: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 4,
  },
  memberText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  signInBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  signInBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  statsRow: {
    flexDirection: "row" as const,
    gap: 8,
    padding: 16,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    paddingHorizontal: 16,
    paddingBottom: 8,
    letterSpacing: 0.8,
  },
  menuCard: {
    marginHorizontal: 0,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 12,
    padding: 14,
    paddingHorizontal: 16,
  },
  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    fontFamily: "Inter_500Medium",
    marginBottom: 1,
  },
  menuDesc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  logoutBtn: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 0,
    padding: 16,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
});
