import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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

import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";
import { CATEGORIES, PRODUCTS } from "@/data/products";
import { fetchProducts } from "@/lib/db";
import { getProductImageUrl } from "@/lib/supabase";

const { width, height } = Dimensions.get("window");
const HERO_HEIGHT = Math.min(height * 0.58, 480);
const THUMB_W = 110;
const THUMB_H = 160;

const TRENDING = PRODUCTS.slice(0, 6);
const HERO_PRODUCTS = [PRODUCTS[1], PRODUCTS[4], PRODUCTS[7]].filter(Boolean);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { totalItems, addItem } = useCart();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [heroIndex, setHeroIndex] = useState(0);
  const heroRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [dbProducts, setDbProducts] = useState<typeof PRODUCTS>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    fetchProducts()
      .then((rows) => {
        if (rows && rows.length > 0) {
          const mapped = rows.map((r: any, i: number) => {
            const local = PRODUCTS[i % PRODUCTS.length];
            const origPrice = r.original_price ?? r.price;
            return {
              ...local,
              id: r.id,
              name: r.name,
              price: r.price,
              originalPrice: origPrice,
              discount: origPrice > 0 ? Math.round(((origPrice - r.price) / origPrice) * 100) : 0,
              image: r.image ?? getProductImageUrl(r.id) ?? local.image,
              images: [r.image ?? getProductImageUrl(r.id) ?? local.image, ...local.images.slice(1)],
            };
          });
          setDbProducts(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  const allProducts = dbProducts.length > 0 ? dbProducts : PRODUCTS;

  const filteredProducts =
    selectedCategory === "all"
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (heroIndex + 1) % HERO_PRODUCTS.length;
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setHeroIndex(next);
        heroRef.current?.scrollToIndex({ index: next, animated: false });
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [heroIndex]);

  const currentHero = HERO_PRODUCTS[heroIndex] ?? PRODUCTS[0];

  function formatSold(n: number) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0a0a0a" },
    scrollContent: { backgroundColor: colors.background },

    heroWrap: { width, height: HERO_HEIGHT, position: "relative" },
    heroImage: { ...StyleSheet.absoluteFillObject },
    heroGrad: { ...StyleSheet.absoluteFillObject },

    floatingBar: {
      position: "absolute",
      top: topPadding + 4,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      flexDirection: "row" as const,
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 10,
    },
    brandName: {
      fontSize: 22,
      fontWeight: "800" as const,
      color: "#fff",
      fontFamily: "Inter_700Bold",
      letterSpacing: -0.5,
    },
    brandDot: { color: colors.primary },
    floatingIcons: {
      flexDirection: "row" as const,
      alignItems: "center",
      gap: 4,
    },
    floatingIcon: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
    },
    cartBadge: {
      position: "absolute",
      top: 4,
      right: 4,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    cartBadgeText: {
      fontSize: 8,
      color: "#fff",
      fontWeight: "700" as const,
    },

    heroContent: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      paddingBottom: 24,
    },
    trendingBadge: {
      flexDirection: "row" as const,
      alignItems: "center",
      gap: 6,
      marginBottom: 10,
    },
    trendingNum: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: colors.primary,
      fontFamily: "Inter_700Bold",
    },
    trendingLabel: {
      fontSize: 12,
      color: "rgba(255,255,255,0.75)",
      fontFamily: "Inter_400Regular",
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: "800" as const,
      color: "#fff",
      fontFamily: "Inter_700Bold",
      lineHeight: 34,
      marginBottom: 8,
    },
    heroMeta: {
      flexDirection: "row" as const,
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
    },
    heroRating: {
      flexDirection: "row" as const,
      alignItems: "center",
      gap: 4,
    },
    heroRatingText: {
      fontSize: 13,
      color: "#fff",
      fontFamily: "Inter_400Regular",
    },
    heroDot: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
    heroPrice: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.primary,
      fontFamily: "Inter_700Bold",
    },
    heroCatRow: {
      flexDirection: "row" as const,
      gap: 8,
      marginBottom: 18,
    },
    heroCatTag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.15)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.25)",
    },
    heroCatText: {
      fontSize: 11,
      color: "rgba(255,255,255,0.85)",
      fontFamily: "Inter_500Medium",
    },
    heroBtns: {
      flexDirection: "row" as const,
      gap: 10,
    },
    heroBtn: {
      flex: 1,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row" as const,
      gap: 6,
    },
    heroBtnPrimary: { backgroundColor: "#fff" },
    heroBtnSecondary: {
      backgroundColor: "rgba(255,255,255,0.15)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.3)",
    },
    heroBtnTextPrimary: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: "#0a0a0a",
      fontFamily: "Inter_700Bold",
    },
    heroBtnTextSecondary: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: "#fff",
      fontFamily: "Inter_600SemiBold",
    },
    heroDots: {
      position: "absolute",
      bottom: 8,
      right: 20,
      flexDirection: "row" as const,
      gap: 5,
    },
    heroDotItem: {
      width: 5,
      height: 5,
      borderRadius: 3,
    },

    trendSection: {
      paddingTop: 20,
      paddingBottom: 4,
      backgroundColor: colors.background,
    },
    trendHeader: {
      flexDirection: "row" as const,
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      marginBottom: 14,
    },
    trendTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    trendSeeAll: {
      fontSize: 13,
      color: colors.primary,
      fontFamily: "Inter_500Medium",
    },
    thumbList: { paddingHorizontal: 16, gap: 10 },
    thumbCard: {
      width: THUMB_W,
      height: THUMB_H,
      borderRadius: 12,
      overflow: "hidden" as const,
      position: "relative" as const,
    },
    thumbImage: { width: THUMB_W, height: THUMB_H },
    thumbGrad: { ...StyleSheet.absoluteFillObject },
    thumbRank: {
      position: "absolute",
      bottom: 6,
      left: 8,
      fontSize: 36,
      fontWeight: "800" as const,
      color: "rgba(255,255,255,0.9)",
      fontFamily: "Inter_700Bold",
      lineHeight: 40,
    },
    thumbHot: {
      position: "absolute",
      top: 6,
      right: 6,
      backgroundColor: "#e53935",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    thumbHotText: {
      fontSize: 9,
      color: "#fff",
      fontWeight: "700" as const,
      fontFamily: "Inter_700Bold",
    },

    divider: {
      height: 8,
      backgroundColor: colors.background,
    },
    catSection: {
      backgroundColor: colors.background,
      paddingTop: 16,
    },
    catContainer: { marginBottom: 12 },
    catScroll: { paddingHorizontal: 16, gap: 8 },
    catChip: {
      flexDirection: "row" as const,
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
    },
    catChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
    sectionHeader: {
      flexDirection: "row" as const,
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    seeAll: {
      fontSize: 13,
      color: colors.primary,
      fontFamily: "Inter_500Medium",
    },
    productsGrid: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      paddingHorizontal: 12,
      gap: 12,
    },
  });

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* ── HERO ── */}
        <Animated.View style={[s.heroWrap, { opacity: fadeAnim }]}>
          <Image
            source={{ uri: currentHero.image }}
            style={s.heroImage}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={["rgba(10,10,10,0.1)", "rgba(10,10,10,0.55)", "#0a0a0a"]}
            style={s.heroGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          {/* Floating top nav */}
          <View style={s.floatingBar}>
            <Text style={s.brandName}>
              Shop<Text style={s.brandDot}>Hub</Text>
            </Text>
            <View style={s.floatingIcons}>
              <Pressable style={s.floatingIcon} onPress={() => router.push("/search" as never)}>
                <Feather name="search" size={20} color="#fff" />
              </Pressable>
              <Pressable style={s.floatingIcon} onPress={() => router.push("/(tabs)/profile" as never)}>
                <Feather name="user" size={20} color="#fff" />
              </Pressable>
              <Pressable
                style={s.floatingIcon}
                onPress={() => router.push("/(tabs)/cart" as never)}
              >
                <Feather name="shopping-cart" size={20} color="#fff" />
                {totalItems > 0 && (
                  <View style={s.cartBadge}>
                    <Text style={s.cartBadgeText}>{totalItems > 9 ? "9+" : totalItems}</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>

          {/* Hero content */}
          <View style={s.heroContent}>
            <View style={s.trendingBadge}>
              <Text style={s.trendingNum}>#{heroIndex + 1}</Text>
              <Text style={s.trendingLabel}>in Shopping Today</Text>
            </View>

            <Text style={s.heroTitle} numberOfLines={2}>
              {currentHero.name}
            </Text>

            <View style={s.heroMeta}>
              <View style={s.heroRating}>
                <Feather name="star" size={13} color="#FFB800" />
                <Text style={s.heroRatingText}> {currentHero.rating}</Text>
              </View>
              <Text style={s.heroDot}>•</Text>
              <Text style={s.heroRatingText}>{formatSold(currentHero.sold)} sold</Text>
              <Text style={s.heroDot}>•</Text>
              <Text style={s.heroPrice}>${currentHero.price.toFixed(2)}</Text>
            </View>

            <View style={s.heroCatRow}>
              {currentHero.tags.slice(0, 3).map((tag) => (
                <View key={tag} style={s.heroCatTag}>
                  <Text style={s.heroCatText}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={s.heroBtns}>
              <Pressable
                style={[s.heroBtn, s.heroBtnPrimary]}
                onPress={() => {
                  addItem({
                    productId: currentHero.id,
                    name: currentHero.name,
                    price: currentHero.price,
                    originalPrice: currentHero.originalPrice,
                    image: currentHero.image,
                  });
                }}
              >
                <Feather name="shopping-cart" size={16} color="#0a0a0a" />
                <Text style={s.heroBtnTextPrimary}>Add to Cart</Text>
              </Pressable>
              <Pressable
                style={[s.heroBtn, s.heroBtnSecondary]}
                onPress={() => router.push(`/product/${currentHero.id}` as never)}
              >
                <Feather name="info" size={16} color="#fff" />
                <Text style={s.heroBtnTextSecondary}>More Info</Text>
              </Pressable>
            </View>
          </View>

          {/* Hero dots */}
          <View style={s.heroDots}>
            {HERO_PRODUCTS.map((_, i) => (
              <View
                key={i}
                style={[
                  s.heroDotItem,
                  {
                    backgroundColor: i === heroIndex ? "#fff" : "rgba(255,255,255,0.35)",
                    width: i === heroIndex ? 16 : 5,
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── TRENDING NOW ROW ── */}
        <View style={s.trendSection}>
          <View style={s.trendHeader}>
            <Text style={s.trendTitle}>Trending Now</Text>
            <Pressable onPress={() => router.push("/(tabs)/categories" as never)}>
              <Text style={s.trendSeeAll}>See all</Text>
            </Pressable>
          </View>
          <FlatList
            data={TRENDING}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.thumbList}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Pressable
                style={s.thumbCard}
                onPress={() => router.push(`/product/${item.id}` as never)}
              >
                <Image
                  source={{ uri: item.image }}
                  style={s.thumbImage}
                  contentFit="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.75)"]}
                  style={s.thumbGrad}
                  start={{ x: 0, y: 0.4 }}
                  end={{ x: 0, y: 1 }}
                />
                <Text style={s.thumbRank}>{index + 1}</Text>
                {index < 2 && (
                  <View style={s.thumbHot}>
                    <Text style={s.thumbHotText}>HOT</Text>
                  </View>
                )}
              </Pressable>
            )}
          />
        </View>

        {/* ── CATEGORY FILTER + GRID ── */}
        <View style={[s.catSection, { paddingBottom: 8 }]}>
          <View style={s.catContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.catScroll}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = cat.id === selectedCategory;
                return (
                  <Pressable
                    key={cat.id}
                    style={[
                      s.catChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Feather
                      name={cat.icon as never}
                      size={14}
                      color={isSelected ? "#fff" : colors.mutedForeground}
                    />
                    <Text
                      style={[
                        s.catChipText,
                        { color: isSelected ? "#fff" : colors.foreground },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              {selectedCategory === "all"
                ? "All Products"
                : CATEGORIES.find((c) => c.id === selectedCategory)?.name}
            </Text>
            <Text style={s.seeAll}>{filteredProducts.length} items</Text>
          </View>

          <View style={s.productsGrid}>
            {filteredProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                staffPick={i === 0 || i === 3}
              />
            ))}
          </View>

          <View style={{ height: bottomPadding + 90 }} />
        </View>
      </ScrollView>
    </View>
  );
}
