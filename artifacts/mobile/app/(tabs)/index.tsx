import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

const { width, height } = Dimensions.get("window");
const HERO_HEIGHT = Math.min(height * 0.58, 480);
const THUMB_W = 110;
const THUMB_H = 160;

const LAST_CATEGORY_KEY = "agyakoahs_last_category";

// Seeded shuffle — deterministic for a given seed
function seededShuffle<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Session seed — changes every time the app is opened (new random value each mount)
function getSessionSeed(): number {
  return Math.floor(Math.random() * 2147483647);
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { totalItems, addItem } = useCart();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [heroIndex, setHeroIndex] = useState(0);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const [dbProducts, setDbProducts] = useState<typeof PRODUCTS>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [lastBrowsedCategory, setLastBrowsedCategory] = useState<string | null>(null);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  // New seed every session — products reorder each time the app is opened
  const sessionSeed = React.useRef(getSessionSeed()).current;

  // Load last browsed category from storage
  useEffect(() => {
    AsyncStorage.getItem(LAST_CATEGORY_KEY).then((val) => {
      if (val && val !== "all") setLastBrowsedCategory(val);
    }).catch(() => {});
  }, []);

  // Save category when user switches
  const handleCategoryChange = useCallback((catId: string) => {
    setSelectedCategory(catId);
    if (catId !== "all") {
      setLastBrowsedCategory(catId);
      AsyncStorage.setItem(LAST_CATEGORY_KEY, catId).catch(() => {});
    }
  }, []);

  useEffect(() => {
    fetchProducts()
      .then((rows) => {
        if (rows && rows.length > 0) {
          const mapped = rows.map((r: any, i: number) => {
            const local = PRODUCTS[i % PRODUCTS.length];
            const origPrice = r.original_price ?? r.price;
            const imgUrl = r.image_url || local.image;
            return {
              ...local,
              id: r.id,
              name: r.name,
              price: r.price,
              originalPrice: origPrice,
              discount: origPrice > 0 ? Math.round(((origPrice - r.price) / origPrice) * 100) : 0,
              image: imgUrl,
              images: [imgUrl, ...(imgUrl !== local.image ? [local.image] : local.images.slice(1))],
              rating: r.rating ?? local.rating,
              sold: r.sold ?? local.sold,
              category: r.category ?? local.category,
              description: r.description ?? local.description,
              badge: r.badge ?? null,
              _isNew: i < 6, // first 6 from db are newest (sorted by created_at desc)
            };
          });
          setDbProducts(mapped);
        }
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoadingProducts(false));
  }, []);

  const allProducts = dbProducts.length > 0 ? dbProducts : PRODUCTS;

  // Hero: prefer badged/hot products
  const heroProducts = useMemo(() => {
    const badged = allProducts.filter((p: any) => p.badge === "hot" || p.badge === "dr-recommended");
    const pool = badged.length >= 3 ? badged : allProducts;
    return pool.slice(0, 5);
  }, [allProducts]);

  // Trending: top 8 by sold count
  const trending = useMemo(() => {
    return [...allProducts].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0)).slice(0, 8);
  }, [allProducts]);

  // New Arrivals: first 6 from DB (sorted created_at desc) or last 6 local items
  const newArrivals = useMemo(() => {
    const tagged = allProducts.filter((p: any) => p._isNew);
    return (tagged.length >= 3 ? tagged : allProducts.slice(-6)).slice(0, 6);
  }, [allProducts]);

  // Picks for you: based on last browsed category, weighted by rating + sold + session shuffle
  const picksForYou = useMemo(() => {
    const cat = lastBrowsedCategory;
    const pool = cat
      ? allProducts.filter((p) => p.category === cat)
      : allProducts;
    const base = pool.length >= 4 ? pool : allProducts;
    // Score: rating * 10 + log(sold+1) * 5, then session-shuffle top half
    const scored = [...base].sort((a, b) => {
      const sa = (a.rating ?? 0) * 10 + Math.log((a.sold ?? 0) + 1) * 5;
      const sb = (b.rating ?? 0) * 10 + Math.log((b.sold ?? 0) + 1) * 5;
      return sb - sa;
    });
    const topHalf = scored.slice(0, Math.ceil(scored.length * 0.6));
    const shuffled = seededShuffle(topHalf, sessionSeed + 1);
    return shuffled.slice(0, 8);
  }, [allProducts, lastBrowsedCategory, sessionSeed]);

  // Main grid: session-shuffled within category (new order each app open)
  const filteredProducts = useMemo(() => {
    const pool =
      selectedCategory === "all"
        ? allProducts
        : allProducts.filter((p) => p.category === selectedCategory);
    return seededShuffle(pool, sessionSeed);
  }, [allProducts, selectedCategory, sessionSeed]);

  useEffect(() => {
    if (heroProducts.length === 0) return;
    const interval = setInterval(() => {
      const next = (heroIndex + 1) % heroProducts.length;
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setHeroIndex(next);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [heroIndex, heroProducts.length]);

  const currentHero = heroProducts[heroIndex] ?? heroProducts[0] ?? PRODUCTS[0];

  function formatSold(n: number) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  }

  const picksLabel = lastBrowsedCategory
    ? `Picks for You · ${lastBrowsedCategory}`
    : "Picks for You";

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

    rowSection: {
      paddingTop: 20,
      paddingBottom: 4,
      backgroundColor: colors.background,
    },
    rowHeader: {
      flexDirection: "row" as const,
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      marginBottom: 14,
    },
    rowTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    rowSeeAll: {
      fontSize: 13,
      color: colors.primary,
      fontFamily: "Inter_500Medium",
    },
    rowSubtitle: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
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
    newTag: {
      position: "absolute",
      top: 6,
      left: 6,
      backgroundColor: colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    newTagText: {
      fontSize: 9,
      color: "#fff",
      fontWeight: "700" as const,
      fontFamily: "Inter_700Bold",
    },

    newArrivalCard: {
      width: 130,
      borderRadius: 14,
      overflow: "hidden" as const,
      backgroundColor: colors.card,
    },
    newArrivalImage: { width: 130, height: 130 },
    newArrivalInfo: { padding: 8 },
    newArrivalName: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      marginBottom: 4,
    },
    newArrivalPrice: {
      fontSize: 13,
      fontWeight: "700" as const,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
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

          <View style={s.floatingBar}>
            <Text style={s.brandName}>
              Agyakoahs<Text style={s.brandDot}> Fabrics</Text>
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
              <Text style={s.heroPrice}>GH₵{currentHero.price.toFixed(2)}</Text>
            </View>

            <View style={s.heroCatRow}>
              {[currentHero.category, ...(((currentHero as any).badge && [(currentHero as any).badge]) || [])].filter(Boolean).slice(0, 3).map((tag) => (
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

          <View style={s.heroDots}>
            {heroProducts.map((_, i) => (
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

        {/* ── TRENDING NOW ── */}
        <View style={s.rowSection}>
          <View style={s.rowHeader}>
            <View>
              <Text style={s.rowTitle}>Trending Now</Text>
              <Text style={s.rowSubtitle}>Most popular picks</Text>
            </View>
            <Pressable onPress={() => router.push("/(tabs)/categories" as never)}>
              <Text style={s.rowSeeAll}>See all</Text>
            </Pressable>
          </View>
          <FlatList
            data={trending}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.thumbList}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Pressable
                style={s.thumbCard}
                onPress={() => router.push(`/product/${item.id}` as never)}
              >
                <Image source={{ uri: item.image }} style={s.thumbImage} contentFit="cover" />
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

        {/* ── NEW ARRIVALS ── */}
        {newArrivals.length > 0 && (
          <View style={[s.rowSection, { paddingTop: 20, paddingBottom: 16 }]}>
            <View style={s.rowHeader}>
              <View>
                <Text style={s.rowTitle}>New Arrivals</Text>
                <Text style={s.rowSubtitle}>Just added to the store</Text>
              </View>
              <Pressable onPress={() => router.push("/(tabs)/categories" as never)}>
                <Text style={s.rowSeeAll}>See all</Text>
              </Pressable>
            </View>
            <FlatList
              data={newArrivals}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              keyExtractor={(item) => `new-${item.id}`}
              renderItem={({ item }) => (
                <Pressable
                  style={s.newArrivalCard}
                  onPress={() => router.push(`/product/${item.id}` as never)}
                >
                  <View>
                    <Image source={{ uri: item.image }} style={s.newArrivalImage} contentFit="cover" />
                    <View style={s.newTag}>
                      <Text style={s.newTagText}>NEW</Text>
                    </View>
                  </View>
                  <View style={s.newArrivalInfo}>
                    <Text style={s.newArrivalName} numberOfLines={2}>{item.name}</Text>
                    <Text style={s.newArrivalPrice}>GH₵{item.price.toFixed(2)}</Text>
                  </View>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* ── PICKS FOR YOU ── */}
        {picksForYou.length > 0 && (
          <View style={[s.rowSection, { paddingTop: 4, paddingBottom: 4 }]}>
            <View style={s.rowHeader}>
              <View>
                <Text style={s.rowTitle}>Picks for You</Text>
                <Text style={s.rowSubtitle}>
                  {lastBrowsedCategory ? `Based on your interest in ${lastBrowsedCategory}` : "Curated daily for you"}
                </Text>
              </View>
            </View>
            <FlatList
              data={picksForYou}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              keyExtractor={(item) => `pick-${item.id}`}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => router.push(`/product/${item.id}` as never)}
                  style={{ width: 140 }}
                >
                  <ProductCard product={item} staffPick={(item as any).badge === "dr-recommended"} />
                </Pressable>
              )}
            />
          </View>
        )}

        {/* ── CATEGORY FILTER + GRID ── */}
        <View style={[s.catSection, { paddingBottom: 8, marginTop: 12 }]}>
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
                    onPress={() => handleCategoryChange(cat.id)}
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
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                staffPick={(product as any).badge === "dr-recommended"}
              />
            ))}
          </View>

          <View style={{ height: bottomPadding + 90 }} />
        </View>
      </ScrollView>
    </View>
  );
}
