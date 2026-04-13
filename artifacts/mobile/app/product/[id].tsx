import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { getProductById } from "@/data/products";
import { fetchProductById, addToWishlist, removeFromWishlist, fetchWishlist } from "@/lib/db";

const { width } = Dimensions.get("window");

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
];

function getFallbackImage(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffff;
  return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length]!;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const localProduct = getProductById(id ?? "");

  const [product, setProduct] = useState<{
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    discount: number;
    image: string;
    images: string[];
    rating: number;
    sold: number;
    description: string;
    sizes?: string[];
    colors?: string[];
    freeShipping: boolean;
  } | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const dbProd = await fetchProductById(id ?? "");
        const imageUrl = dbProd?.image_url || localProduct?.image || getFallbackImage(id ?? "");
        const origPrice = dbProd?.original_price ?? localProduct?.originalPrice ?? dbProd?.price ?? 0;
        const price = dbProd?.price ?? localProduct?.price ?? 0;
        const disc = origPrice > 0 ? Math.round(((origPrice - price) / origPrice) * 100) : localProduct?.discount ?? 0;

        setProduct({
          id: dbProd?.id ?? id ?? "",
          name: dbProd?.name ?? localProduct?.name ?? "",
          price,
          originalPrice: origPrice,
          discount: disc,
          image: imageUrl,
          images: localProduct?.images ? [imageUrl, ...localProduct.images.slice(1)] : [imageUrl],
          rating: dbProd?.rating ?? localProduct?.rating ?? 4.5,
          sold: dbProd?.sold ?? localProduct?.sold ?? 0,
          description: dbProd?.description ?? localProduct?.description ?? "",
          sizes: localProduct?.sizes,
          colors: localProduct?.colors,
          freeShipping: localProduct?.freeShipping ?? false,
        });

        if (localProduct?.sizes?.[0]) setSelectedSize(localProduct.sizes[0]);
        if (localProduct?.colors?.[0]) setSelectedColor(localProduct.colors[0]);
      } catch {
        if (localProduct) {
          setProduct({
            ...localProduct,
            originalPrice: localProduct.originalPrice,
          });
          if (localProduct.sizes?.[0]) setSelectedSize(localProduct.sizes[0]);
          if (localProduct.colors?.[0]) setSelectedColor(localProduct.colors[0]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    async function checkWishlist() {
      if (!user || !id) return;
      try {
        const wl = await fetchWishlist(user.id);
        setLiked(wl.some((w) => w.product_id === id));
      } catch {}
    }

    load();
    checkWishlist();
  }, [id]);

  async function toggleWishlist() {
    if (!user) {
      router.push("/auth/login" as never);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newLiked = !liked;
    setLiked(newLiked);
    try {
      if (newLiked) await addToWishlist(user.id, id ?? "");
      else await removeFromWishlist(user.id, id ?? "");
    } catch {
      setLiked(!newLiked);
    }
  }

  function handleAddToCart() {
    if (!product) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      size: selectedSize ?? undefined,
      color: selectedColor ?? undefined,
    });
    router.push("/(tabs)/cart" as never);
  }

  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.foreground }}>Product not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const images = product.images.length > 0 ? product.images : [product.image];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ position: "relative" }}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImage(idx);
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={{ width, height: width }} contentFit="cover" />
            )}
            keyExtractor={(_, i) => i.toString()}
          />

          <Pressable
            style={[styles.backBtn, { top: topInset + 8 }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={22} color="#1a1a1a" />
          </Pressable>

          <Pressable
            style={[styles.likeBtn, { top: topInset + 8 }]}
            onPress={toggleWishlist}
          >
            <Feather name="heart" size={22} color={liked ? "#e53935" : "#1a1a1a"} />
          </Pressable>

          {images.length > 1 && (
            <View style={styles.dotsRow}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i === selectedImage ? colors.primary : "rgba(255,255,255,0.6)",
                      width: i === selectedImage ? 20 : 6,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={{ padding: 16, backgroundColor: colors.card }}>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.foreground }]}>GH₵{product.price.toFixed(2)}</Text>
            {product.originalPrice > product.price && (
              <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>
                GH₵{product.originalPrice.toFixed(2)}
              </Text>
            )}
            {product.discount > 0 && (
              <View style={[styles.discountBadge, { backgroundColor: "#e53935" }]}>
                <Text style={styles.discountText}>-{product.discount}%</Text>
              </View>
            )}
          </View>

          <Text style={[styles.productName, { color: colors.foreground }]}>{product.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Feather key={star} name="star" size={14} color={star <= Math.floor(product.rating) ? colors.star : colors.border} />
              ))}
              <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
                {product.rating.toFixed(1)}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {[
              { label: "Sold", value: product.sold >= 1000 ? `${(product.sold / 1000).toFixed(0)}k+` : String(product.sold) },
              { label: "Rating", value: `${product.rating}/5` },
              { label: "Shipping", value: product.freeShipping ? "Free" : "Standard" },
            ].map((s) => (
              <View key={s.label} style={[styles.statBox, { backgroundColor: colors.background }]}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {product.colors && product.colors.length > 0 && (
          <View style={[styles.optionSection, { backgroundColor: colors.card }]}>
            <Text style={[styles.optionTitle, { color: colors.foreground }]}>Color</Text>
            <View style={styles.optionRow}>
              {product.colors.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorChip,
                    {
                      backgroundColor: selectedColor === color ? colors.accent : colors.background,
                      borderColor: selectedColor === color ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  <Text style={[styles.colorChipText, { color: colors.foreground }]}>{color}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {product.sizes && product.sizes.length > 0 && (
          <View style={[styles.optionSection, { backgroundColor: colors.card, marginTop: 8 }]}>
            <Text style={[styles.optionTitle, { color: colors.foreground }]}>Size</Text>
            <View style={styles.optionRow}>
              {product.sizes.map((size) => (
                <Pressable
                  key={size}
                  style={[
                    styles.sizeChip,
                    {
                      backgroundColor: selectedSize === size ? colors.primary : colors.background,
                      borderColor: selectedSize === size ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text style={[styles.sizeChipText, { color: selectedSize === size ? "#fff" : colors.foreground }]}>
                    {size}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {product.description ? (
          <View style={[styles.descSection, { backgroundColor: colors.card, marginTop: 8 }]}>
            <Text style={[styles.optionTitle, { color: colors.foreground }]}>About this item</Text>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>{product.description}</Text>
          </View>
        ) : null}


        <View style={{ height: bottomPadding + 100 }} />
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.card, paddingBottom: bottomPadding + 10, borderTopColor: colors.border }]}>
        <View style={styles.qtyControl}>
          <Pressable style={[styles.qtyBtn, { backgroundColor: colors.muted }]} onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
            <Feather name="minus" size={16} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.qtyText, { color: colors.foreground }]}>{quantity}</Text>
          <Pressable style={[styles.qtyBtn, { backgroundColor: colors.primary }]} onPress={() => setQuantity((q) => q + 1)}>
            <Feather name="plus" size={16} color="#fff" />
          </Pressable>
        </View>
        <Pressable style={[styles.addToCartBtn, { backgroundColor: colors.primary }]} onPress={handleAddToCart}>
          <Feather name="shopping-cart" size={18} color="#fff" />
          <Text style={styles.addToCartText}>Add to Cart · GH₵{(product.price * quantity).toFixed(2)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { position: "absolute", left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  likeBtn: { position: "absolute", right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  dotsRow: { position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row" as const, justifyContent: "center", gap: 6 },
  dot: { height: 6, borderRadius: 3, backgroundColor: "#fff" },
  priceRow: { flexDirection: "row" as const, alignItems: "center", gap: 8, marginBottom: 8 },
  price: { fontSize: 28, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  originalPrice: { fontSize: 16, textDecorationLine: "line-through" as const, fontFamily: "Inter_400Regular" },
  discountBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountText: { fontSize: 13, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" },
  productName: { fontSize: 17, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", lineHeight: 24, marginBottom: 10 },
  metaRow: { flexDirection: "row" as const, alignItems: "center", marginBottom: 14 },
  ratingContainer: { flexDirection: "row" as const, alignItems: "center", gap: 3 },
  ratingText: { fontSize: 13, fontFamily: "Inter_400Regular", marginLeft: 4 },
  statsRow: { flexDirection: "row" as const, gap: 8 },
  statBox: { flex: 1, alignItems: "center", padding: 10, borderRadius: 12 },
  statValue: { fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  optionSection: { padding: 16 },
  optionTitle: { fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold", marginBottom: 12 },
  optionRow: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 8 },
  colorChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  colorChipText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  sizeChip: { minWidth: 48, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 10 },
  sizeChipText: { fontSize: 13, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  descSection: { padding: 16 },
  description: { fontSize: 14, lineHeight: 22, fontFamily: "Inter_400Regular" },
  reviewsSection: { padding: 16 },
  reviewsHeader: { flexDirection: "row" as const, justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  reviewItem: { paddingVertical: 14, borderBottomWidth: 1 },
  reviewHeader: { flexDirection: "row" as const, alignItems: "center", gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  reviewAvatarText: { fontSize: 14, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  reviewUser: { fontSize: 13, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  reviewDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  reviewComment: { fontSize: 13, lineHeight: 20, fontFamily: "Inter_400Regular" },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row" as const, alignItems: "center", paddingHorizontal: 16, paddingTop: 14, borderTopWidth: 1, gap: 12 },
  qtyControl: { flexDirection: "row" as const, alignItems: "center", gap: 12 },
  qtyBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  qtyText: { fontSize: 18, fontWeight: "700" as const, fontFamily: "Inter_700Bold", minWidth: 24, textAlign: "center" },
  addToCartBtn: { flex: 1, borderRadius: 14, flexDirection: "row" as const, alignItems: "center", justifyContent: "center", paddingVertical: 15, gap: 8 },
  addToCartText: { fontSize: 15, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" },
});
