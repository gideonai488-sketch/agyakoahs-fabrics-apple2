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
import { CATEGORIES } from "@/data/products";

const CAT_COLORS = ["#FF4500", "#e91e63", "#2196f3", "#ff9800", "#9c27b0", "#4caf50", "#f44336", "#795548"];

const SUBCATEGORIES: Record<string, string[]> = {
  fashion: ["Women", "Men", "Kids", "Shoes", "Bags", "Accessories", "Jewelry"],
  electronics: ["Phones", "Earbuds", "Laptops", "Cameras", "Gaming", "Smart Home"],
  home: ["Furniture", "Kitchen", "Bedding", "Lighting", "Decor", "Garden"],
  beauty: ["Skincare", "Makeup", "Hair", "Fragrance", "Nail", "Tools"],
  sports: ["Running", "Yoga", "Gym", "Outdoor", "Swimming", "Cycling"],
  toys: ["Action Figures", "Dolls", "Educational", "Board Games", "LEGO", "Outdoor"],
  food: ["Snacks", "Coffee", "Health", "Organic", "Supplements", "Beverages"],
};

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Categories</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {CATEGORIES.filter((c) => c.id !== "all").map((cat, idx) => (
          <View key={cat.id}>
            <View style={[styles.catSection, { backgroundColor: colors.card }]}>
              <View style={[styles.catHeader, { borderBottomColor: colors.border }]}>
                <View style={[styles.catIconBg, { backgroundColor: CAT_COLORS[idx % CAT_COLORS.length] + "20" }]}>
                  <Feather
                    name={cat.icon as never}
                    size={20}
                    color={CAT_COLORS[idx % CAT_COLORS.length]!}
                  />
                </View>
                <Text style={[styles.catName, { color: colors.foreground }]}>{cat.name}</Text>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </View>
              <View style={styles.subGrid}>
                {(SUBCATEGORIES[cat.id] || []).map((sub) => (
                  <Pressable
                    key={sub}
                    style={[styles.subChip, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => router.push("/search" as never)}
                  >
                    <Text style={[styles.subChipText, { color: colors.foreground }]}>{sub}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={{ height: 8 }} />
          </View>
        ))}
        <View style={{ height: Platform.OS === "web" ? 34 + 90 : insets.bottom + 90 }} />
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
  catSection: {
    marginHorizontal: 0,
    overflow: "hidden",
  },
  catHeader: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
  },
  catIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  catName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  subGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    padding: 12,
    gap: 8,
  },
  subChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  subChipText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
