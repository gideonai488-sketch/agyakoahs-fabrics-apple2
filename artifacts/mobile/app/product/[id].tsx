import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
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
import { useColors } from "@/hooks/useColors";
import { getProductById } from "@/data/products";

const { width } = Dimensions.get("window");

const REVIEWS = [
  { id: "1", user: "Sarah M.", rating: 5, comment: "Amazing quality! Exactly as described. Super fast shipping.", date: "Apr 8, 2026" },
  { id: "2", user: "John D.", rating: 4, comment: "Great product, good value for money. Would definitely buy again.", date: "Apr 2, 2026" },
  { id: "3", user: "Emma K.", rating: 5, comment: "Exceeded my expectations. The quality is outstanding!", date: "Mar 25, 2026" },
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { addItem } = useCart();

  const product = getProductById(id ?? "");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product?.sizes?.[0] ?? null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product?.colors?.[0] ?? null
  );
  const [liked, setLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Product not found</Text>
      </View>
    );
  }

  function handleAddToCart() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem({
      productId: product!.id,
      name: product!.name,
      price: product!.price,
      originalPrice: product!.originalPrice,
      image: product!.image,
      size: selectedSize ?? undefined,
      color: selectedColor ?? undefined,
    });
    router.push("/(tabs)/cart" as never);
  }

  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ position: "relative" }}>
          <FlatList
            data={product.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImage(idx);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ width, height: width }}
                contentFit="cover"
              />
            )}
            keyExtractor={(_, i) => i.toString()}
          />

          <Pressable
            style={[styles.backBtn, { top: (Platform.OS === "web" ? 67 : insets.top) + 8 }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={22} color="#1a1a1a" />
          </Pressable>

          <Pressable
            style={[styles.likeBtn, { top: (Platform.OS === "web" ? 67 : insets.top) + 8 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setLiked((v) => !v);
            }}
          >
            <Feather name="heart" size={22} color={liked ? "#FF4500" : "#1a1a1a"} />
          </Pressable>

          <View style={styles.dotsRow}>
            {product.images.map((_, i) => (
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
        </View>

        <View style={{ padding: 16, backgroundColor: colors.card }}>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary }]}>${product.price.toFixed(2)}</Text>
            <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>${product.originalPrice.toFixed(2)}</Text>
            <View style={[styles.discountBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          </View>

          <Text style={[styles.productName, { color: colors.foreground }]}>{product.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Feather
                  key={star}
                  name="star"
                  size={14}
                  color={star <= Math.floor(product.rating) ? colors.star : colors.border}
                />
              ))}
              <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
                {product.rating} ({product.reviews.toLocaleString()} reviews)
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {[
              { label: "Sold", value: `${(product.sold / 1000).toFixed(0)}k+` },
              { label: "Rating", value: `${product.rating}/5` },
              { label: "Shipping", value: product.freeShipping ? "Free" : "$2.99" },
            ].map((s) => (
              <View key={s.label} style={[styles.statBox, { backgroundColor: colors.background }]}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {product.colors && (
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

        {product.sizes && (
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

        <View style={[styles.descSection, { backgroundColor: colors.card, marginTop: 8 }]}>
          <Text style={[styles.optionTitle, { color: colors.foreground }]}>About this item</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>{product.description}</Text>
        </View>

        <View style={[styles.reviewsSection, { backgroundColor: colors.card, marginTop: 8 }]}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.optionTitle, { color: colors.foreground }]}>Reviews</Text>
            <Pressable>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </Pressable>
          </View>
          {REVIEWS.map((review) => (
            <View key={review.id} style={[styles.reviewItem, { borderBottomColor: colors.border }]}>
              <View style={styles.reviewHeader}>
                <View style={[styles.reviewAvatar, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.reviewAvatarText, { color: colors.primary }]}>
                    {review.user[0]}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.reviewUser, { color: colors.foreground }]}>{review.user}</Text>
                  <View style={{ flexDirection: "row" as const, gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Feather key={s} name="star" size={11} color={s <= review.rating ? colors.star : colors.border} />
                    ))}
                  </View>
                </View>
                <Text style={[styles.reviewDate, { color: colors.mutedForeground }]}>{review.date}</Text>
              </View>
              <Text style={[styles.reviewComment, { color: colors.foreground }]}>{review.comment}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: bottomPadding + 100 }} />
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.card, paddingBottom: bottomPadding + 10, borderTopColor: colors.border }]}>
        <View style={styles.qtyControl}>
          <Pressable
            style={[styles.qtyBtn, { backgroundColor: colors.muted }]}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Feather name="minus" size={16} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.qtyText, { color: colors.foreground }]}>{quantity}</Text>
          <Pressable
            style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
            onPress={() => setQuantity((q) => q + 1)}
          >
            <Feather name="plus" size={16} color="#fff" />
          </Pressable>
        </View>
        <Pressable style={{ flex: 1, borderRadius: 14, overflow: "hidden" }} onPress={handleAddToCart}>
          <LinearGradient colors={["#FF4500", "#FF6B35"]} style={styles.addToCartBtn}>
            <Feather name="shopping-cart" size={18} color="#fff" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  likeBtn: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  dotsRow: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row" as const,
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  priceRow: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: "line-through" as const,
    fontFamily: "Inter_400Regular",
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  productName: {
    fontSize: 17,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 24,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row" as const,
    alignItems: "center",
    marginBottom: 14,
  },
  ratingContainer: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: "row" as const,
    gap: 8,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  optionSection: {
    padding: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  colorChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  colorChipText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  sizeChip: {
    minWidth: 48,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 10,
  },
  sizeChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  descSection: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  reviewsSection: {
    padding: 16,
  },
  reviewsHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  reviewItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  reviewHeader: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: {
    fontSize: 14,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  reviewUser: {
    fontSize: 13,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  reviewComment: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row" as const,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  qtyControl: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 12,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 18,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    minWidth: 24,
    textAlign: "center",
  },
  addToCartBtn: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    gap: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
});
