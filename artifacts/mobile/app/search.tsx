import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ProductCard from "@/components/ProductCard";
import { useColors } from "@/hooks/useColors";
import { fetchProducts } from "@/lib/db";

const TRENDING = ["Wireless Earbuds", "Summer Dress", "Smart Watch", "Yoga Mat", "Sneakers", "Laptop Stand"];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    fetchProducts().then((rows) => {
      setAllProducts(rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        price: r.price,
        originalPrice: r.original_price ?? r.price,
        discount: r.original_price > 0 ? Math.round(((r.original_price - r.price) / r.original_price) * 100) : 0,
        image: r.image_url ?? "",
        images: [r.image_url ?? ""],
        rating: r.rating ?? 4.5,
        sold: r.sold ?? 0,
        category: r.category ?? "",
        description: r.description ?? "",
        badge: r.badge ?? null,
      })));
    }).catch(() => {});
  }, []);

  const q = query.toLowerCase().trim();
  const results = q.length > 1
    ? allProducts.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={[styles.searchInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search products..."
            placeholderTextColor={colors.mutedForeground}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {query.length <= 1 ? (
          <View style={{ padding: 16 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trending Searches</Text>
            <View style={styles.trendingGrid}>
              {TRENDING.map((term) => (
                <Pressable
                  key={term}
                  style={[styles.trendChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setQuery(term)}
                >
                  <Feather name="trending-up" size={14} color={colors.primary} />
                  <Text style={[styles.trendText, { color: colors.foreground }]}>{term}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : results.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Feather name="search" size={56} color={colors.border} />
            <Text style={{ fontSize: 18, fontWeight: "600" as const, color: colors.foreground, marginTop: 16, fontFamily: "Inter_600SemiBold" }}>
              No results for "{query}"
            </Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground, marginTop: 6, fontFamily: "Inter_400Regular" }}>
              Try a different search term
            </Text>
          </View>
        ) : (
          <View>
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsCount, { color: colors.mutedForeground }]}>
                {results.length} results for "{query}"
              </Text>
            </View>
            <View style={styles.productsGrid}>
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  backBtn: {
    padding: 4,
  },
  searchInput: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center",
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },
  trendingGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 10,
  },
  trendChip: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
  },
  trendText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  productsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    paddingHorizontal: 12,
    gap: 12,
  },
});
