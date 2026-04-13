import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
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
import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";
import { fetchWishlist, removeFromWishlist, fetchProductById } from "@/lib/db";

const PLACEHOLDER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop";

type WishlistProduct = {
  wishlistId: string;
  product: {
    id: string;
    name: string;
    price: number;
    original_price: number;
    image?: string;
  };
};

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { user } = useAuth();
  const { addItem } = useCart();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWishlist = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    try {
      const wishlist = await fetchWishlist(user.id);
      const products = await Promise.all(
        wishlist.map(async (w) => {
          try {
            const p = await fetchProductById(w.product_id);
            return { wishlistId: w.id, product: p };
          } catch {
            return null;
          }
        })
      );
      setItems(products.filter(Boolean) as WishlistProduct[]);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  async function handleRemove(wishlistId: string, productId: string) {
    if (!user) return;
    await removeFromWishlist(user.id, productId);
    setItems((prev) => prev.filter((i) => i.wishlistId !== wishlistId));
  }

  function handleAddToCart(item: WishlistProduct["product"]) {
    addItem({
      productId: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.original_price,
      image: item.image ?? PLACEHOLDER,
    });
  }

  const discount = (p: number, op: number) =>
    op > 0 ? Math.round(((op - p) / op) * 100) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[s.header, { paddingTop: topPadding + 12, backgroundColor: colors.card }]}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[s.title, { color: colors.foreground }]}>Wishlist</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadWishlist(); }} tintColor={colors.primary} />
        }
      >
        {isLoading ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : items.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Feather name="heart" size={56} color={colors.border} />
            <Text style={{ fontSize: 18, fontWeight: "600" as const, color: colors.foreground, marginTop: 16, fontFamily: "Inter_600SemiBold" }}>
              Your wishlist is empty
            </Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground, marginTop: 6, fontFamily: "Inter_400Regular", textAlign: "center" }}>
              Save products you love to your wishlist
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/" as never)}
              style={[s.shopBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Start Shopping</Text>
            </Pressable>
          </View>
        ) : (
          items.map(({ wishlistId, product }) => {
            const imageUrl = product.image ?? PLACEHOLDER;
            const disc = discount(product.price, product.original_price);
            return (
              <View key={wishlistId} style={[s.card, { backgroundColor: colors.card }]}>
                <Pressable onPress={() => router.push(`/product/${product.id}` as never)}>
                  <Image source={{ uri: imageUrl }} style={s.image} contentFit="cover" />
                </Pressable>
                {disc > 0 && (
                  <View style={[s.badge, { backgroundColor: "#e53935" }]}>
                    <Text style={s.badgeText}>-{disc}%</Text>
                  </View>
                )}
                <View style={s.info}>
                  <Text style={[s.name, { color: colors.foreground }]} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <View style={s.priceRow}>
                    <Text style={[s.price, { color: colors.foreground }]}>
                      GH₵{product.price.toFixed(2)}
                    </Text>
                    {product.original_price > product.price && (
                      <Text style={[s.originalPrice, { color: colors.mutedForeground }]}>
                        GH₵{product.original_price.toFixed(2)}
                      </Text>
                    )}
                  </View>
                  <View style={s.actions}>
                    <Pressable
                      style={[s.cartBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleAddToCart(product)}
                    >
                      <Feather name="shopping-cart" size={14} color="#fff" />
                      <Text style={s.cartBtnText}>Add to Cart</Text>
                    </Pressable>
                    <Pressable
                      style={[s.removeBtn, { borderColor: colors.border }]}
                      onPress={() => handleRemove(wishlistId, product.id)}
                    >
                      <Feather name="trash-2" size={16} color={colors.destructive} />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: bottomPadding + 20 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row" as const, alignItems: "center", paddingHorizontal: 16, paddingBottom: 14 },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 20, fontWeight: "700" as const, fontFamily: "Inter_700Bold", textAlign: "center" },
  shopBtn: { marginTop: 20, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 22 },
  card: { borderRadius: 14, flexDirection: "row" as const, overflow: "hidden", gap: 0, elevation: 2 },
  image: { width: 110, height: 120 },
  badge: { position: "absolute", top: 8, left: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" },
  info: { flex: 1, padding: 12, justifyContent: "space-between" },
  name: { fontSize: 13, lineHeight: 18, fontFamily: "Inter_400Regular" },
  priceRow: { flexDirection: "row" as const, alignItems: "center", gap: 8, marginTop: 6 },
  price: { fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  originalPrice: { fontSize: 12, textDecorationLine: "line-through" as const, fontFamily: "Inter_400Regular" },
  actions: { flexDirection: "row" as const, alignItems: "center", gap: 8, marginTop: 10 },
  cartBtn: { flex: 1, flexDirection: "row" as const, alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 10 },
  cartBtnText: { fontSize: 12, fontWeight: "600" as const, color: "#fff", fontFamily: "Inter_600SemiBold" },
  removeBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 1 },
});
