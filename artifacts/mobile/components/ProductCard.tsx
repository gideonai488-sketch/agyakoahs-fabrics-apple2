import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";
import type { Product } from "@/data/products";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 36) / 2;

interface ProductCardProps {
  product: Product;
  staffPick?: boolean;
}

export default function ProductCard({ product, staffPick }: ProductCardProps) {
  const colors = useColors();
  const { addItem } = useCart();
  const [liked, setLiked] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  function handlePress() {
    router.push(`/product/${product.id}` as never);
  }

  function handleLike() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked((v) => !v);
  }

  function handleAddToCart() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
    });
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function formatSold(n: number) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  }

  const styles = StyleSheet.create({
    card: {
      width: CARD_WIDTH,
      backgroundColor: colors.card,
      borderRadius: 14,
      overflow: "hidden",
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    imageContainer: {
      position: "relative",
      width: "100%",
      height: CARD_WIDTH,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    discountBadge: {
      position: "absolute",
      top: 8,
      left: 8,
      backgroundColor: "#e53935",
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 8,
    },
    discountText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "700" as const,
      fontFamily: "Inter_700Bold",
    },
    staffPickBadge: {
      position: "absolute",
      top: 8,
      left: 8,
      backgroundColor: "rgba(0,0,0,0.55)",
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 8,
    },
    staffPickText: {
      color: "#FFD700",
      fontSize: 10,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
    likeBtn: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.9)",
      alignItems: "center",
      justifyContent: "center",
    },
    info: {
      padding: 10,
    },
    name: {
      fontSize: 13,
      color: colors.foreground,
      lineHeight: 18,
      marginBottom: 6,
      fontFamily: "Inter_400Regular",
    },
    ratingRow: {
      flexDirection: "row" as const,
      alignItems: "center",
      gap: 4,
      marginBottom: 6,
    },
    ratingText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    priceRow: {
      flexDirection: "row" as const,
      alignItems: "center",
      justifyContent: "space-between",
    },
    priceGroup: {
      flex: 1,
    },
    price: {
      fontSize: 15,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    originalPrice: {
      fontSize: 11,
      color: colors.mutedForeground,
      textDecorationLine: "line-through" as const,
      fontFamily: "Inter_400Regular",
    },
    addBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
          {staffPick ? (
            <View style={styles.staffPickBadge}>
              <Text style={styles.staffPickText}>⭐ STAFF PICK</Text>
            </View>
          ) : (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
          <Pressable style={styles.likeBtn} onPress={handleLike}>
            <Feather
              name="heart"
              size={13}
              color={liked ? "#e53935" : "#888"}
            />
          </Pressable>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.ratingRow}>
            <Feather name="star" size={11} color={colors.star} />
            <Text style={styles.ratingText}>
              {product.rating} · {formatSold(product.sold)} sold
            </Text>
          </View>
          <View style={styles.priceRow}>
            <View style={styles.priceGroup}>
              <Text style={styles.price}>GH₵{product.price.toFixed(2)}</Text>
              <Text style={styles.originalPrice}>GH₵{product.originalPrice.toFixed(2)}</Text>
            </View>
            <Pressable style={styles.addBtn} onPress={handleAddToCart}>
              <Feather name="plus" size={16} color="#fff" />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
