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
  onPress?: () => void;
}

export default function ProductCard({ product }: ProductCardProps) {
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

  const styles = StyleSheet.create({
    card: {
      width: CARD_WIDTH,
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
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
      backgroundColor: colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 6,
    },
    discountText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "700" as const,
    },
    likeBtn: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "rgba(255,255,255,0.9)",
      alignItems: "center",
      justifyContent: "center",
    },
    info: {
      padding: 8,
    },
    name: {
      fontSize: 12,
      color: colors.foreground,
      lineHeight: 16,
      marginBottom: 4,
      fontFamily: "Inter_400Regular",
    },
    priceRow: {
      flexDirection: "row" as const,
      alignItems: "center",
      gap: 4,
      marginBottom: 4,
    },
    price: {
      fontSize: 15,
      fontWeight: "700" as const,
      color: colors.primary,
      fontFamily: "Inter_700Bold",
    },
    originalPrice: {
      fontSize: 11,
      color: colors.mutedForeground,
      textDecorationLine: "line-through" as const,
    },
    meta: {
      flexDirection: "row" as const,
      alignItems: "center",
      justifyContent: "space-between",
    },
    rating: {
      flexDirection: "row" as const,
      alignItems: "center",
      gap: 2,
    },
    ratingText: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    addBtn: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    shippingText: {
      fontSize: 10,
      color: colors.success,
      fontFamily: "Inter_400Regular",
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
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
          <Pressable style={styles.likeBtn} onPress={handleLike}>
            <Feather
              name="heart"
              size={14}
              color={liked ? "#FF4500" : "#888"}
            />
          </Pressable>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.meta}>
            <View style={styles.rating}>
              <Feather name="star" size={10} color={colors.star} />
              <Text style={styles.ratingText}>
                {product.rating} ({(product.reviews / 1000).toFixed(1)}k)
              </Text>
            </View>
            <Pressable style={styles.addBtn} onPress={handleAddToCart}>
              <Feather name="plus" size={14} color="#fff" />
            </Pressable>
          </View>
          {product.freeShipping && (
            <Text style={styles.shippingText}>Free shipping</Text>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}
