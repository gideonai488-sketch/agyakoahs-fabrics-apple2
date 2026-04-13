import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
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
import SearchBar from "@/components/SearchBar";
import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";
import { CATEGORIES, PRODUCTS } from "@/data/products";

const { width } = Dimensions.get("window");

const BANNERS = [
  {
    id: "1",
    image: require("@/assets/images/banner1.png"),
    tag: "LIMITED TIME",
    title: "Fashion Sale\nFavourites",
    subtitle: "Best-selling styles are moving fast—grab yours while it lasts.",
    cta: "Grab Yours",
    gradient: ["#1a3a2a", "#2d6a4f"] as const,
  },
  {
    id: "2",
    image: require("@/assets/images/banner2.png"),
    tag: "HOT DEALS",
    title: "Top Electronics\nBig Savings",
    subtitle: "Best gadgets at unbeatable prices. Shop today.",
    cta: "Shop Now",
    gradient: ["#1a1a2e", "#16213e"] as const,
  },
  {
    id: "3",
    image: require("@/assets/images/banner3.png"),
    tag: "NEW ARRIVALS",
    title: "Home & Living\nRefreshed",
    subtitle: "Transform your space with our curated picks.",
    cta: "Explore",
    gradient: ["#2a1a3a", "#3d1f5e"] as const,
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { totalItems } = useCart();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerRef = useRef<FlatList>(null);

  const filteredProducts =
    selectedCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === selectedCategory);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPadding + 6,
      paddingHorizontal: 14,
      paddingBottom: 10,
      backgroundColor: colors.card,
      flexDirection: "row" as const,
      alignItems: "center",
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    logoMark: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: "#fff",
      fontFamily: "Inter_700Bold",
    },
    storeName: {
      flex: 1,
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    headerIcons: {
      flexDirection: "row" as const,
      alignItems: "center",
      gap: 4,
    },
    headerIcon: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTop: {
      flexDirection: "row" as const,
      alignItems: "center",
      marginBottom: 12,
    },
    locationRow: {
      flex: 1,
      flexDirection: "row" as const,
      alignItems: "center",
      gap: 4,
    },
    deliverTo: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    location: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    cartBtn: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    cartBadge: {
      position: "absolute",
      top: 0,
      right: 0,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    cartBadgeText: {
      fontSize: 9,
      color: "#fff",
      fontWeight: "700" as const,
    },
    bannerContainer: {
      height: 200,
      marginHorizontal: 16,
      marginVertical: 14,
    },
    banner: {
      width: width - 32,
      height: 200,
      borderRadius: 18,
      overflow: "hidden",
      marginHorizontal: 0,
    },
    bannerImage: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.35,
    },
    bannerGradient: {
      ...StyleSheet.absoluteFillObject,
    },
    bannerContent: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: 22,
      justifyContent: "center",
    },
    bannerTag: {
      flexDirection: "row" as const,
      alignItems: "center",
      marginBottom: 8,
    },
    bannerTagText: {
      fontSize: 11,
      fontWeight: "600" as const,
      color: "rgba(255,255,255,0.85)",
      fontFamily: "Inter_600SemiBold",
      letterSpacing: 0.8,
      textTransform: "uppercase" as const,
    },
    bannerTitle: {
      fontSize: 24,
      fontWeight: "700" as const,
      color: "#fff",
      fontFamily: "Inter_700Bold",
      lineHeight: 30,
      marginBottom: 8,
    },
    bannerSubtitle: {
      fontSize: 12,
      color: "rgba(255,255,255,0.8)",
      fontFamily: "Inter_400Regular",
      lineHeight: 18,
      marginBottom: 16,
      maxWidth: "80%",
    },
    bannerShopBtn: {
      backgroundColor: "#fff",
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 22,
      alignSelf: "flex-start",
    },
    bannerShopBtnText: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: "#1a3a2a",
      fontFamily: "Inter_600SemiBold",
    },
    dotsRow: {
      flexDirection: "row" as const,
      justifyContent: "center",
      gap: 6,
      marginTop: -8,
      marginBottom: 8,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
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
    catContainer: {
      marginBottom: 16,
    },
    catScroll: {
      paddingHorizontal: 16,
      gap: 8,
    },
    catChip: {
      flexDirection: "row" as const,
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
    },
    catChipText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
    },
    productsGrid: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      paddingHorizontal: 12,
      gap: 12,
    },
    flashSaleHeader: {
      flexDirection: "row" as const,
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 16,
      marginBottom: 14,
    },
    flashBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    flashBadgeText: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: "#fff",
      fontFamily: "Inter_700Bold",
    },
    timerBox: {
      flexDirection: "row" as const,
      alignItems: "center",
      gap: 4,
    },
    timerDigit: {
      backgroundColor: "#1a1a1a",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    timerDigitText: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: "#fff",
      fontFamily: "Inter_700Bold",
    },
    timerColon: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: "#1a1a1a",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>S</Text>
        </View>
        <Text style={styles.storeName}>ShopHub</Text>
        <View style={styles.headerIcons}>
          <Pressable style={styles.headerIcon} onPress={() => router.push("/search" as never)}>
            <Feather name="search" size={20} color={colors.foreground} />
          </Pressable>
          <Pressable style={styles.headerIcon} onPress={() => router.push("/(tabs)/profile" as never)}>
            <Feather name="user" size={20} color={colors.foreground} />
          </Pressable>
          <Pressable
            style={styles.cartBtn}
            onPress={() => router.push("/(tabs)/cart" as never)}
          >
            <Feather name="shopping-cart" size={20} color={colors.foreground} />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItems > 99 ? "99+" : totalItems}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.bannerContainer}>
          <FlatList
            ref={bannerRef}
            data={BANNERS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width - 32}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
              setActiveBanner(idx);
            }}
            renderItem={({ item }) => (
              <View style={styles.banner}>
                <Image source={item.image} style={styles.bannerImage} contentFit="cover" />
                <LinearGradient
                  colors={item.gradient}
                  style={styles.bannerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={styles.bannerContent}>
                  <View style={styles.bannerTag}>
                    <Text style={styles.bannerTagText}>✦ {item.tag}</Text>
                  </View>
                  <Text style={styles.bannerTitle}>{item.title}</Text>
                  <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                  <Pressable style={styles.bannerShopBtn}>
                    <Text style={styles.bannerShopBtnText}>{item.cta}</Text>
                  </Pressable>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>

        <View style={styles.dotsRow}>
          {BANNERS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === activeBanner ? colors.primary : colors.border,
                  width: i === activeBanner ? 20 : 6,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.flashSaleHeader}>
          <View style={styles.flashBadge}>
            <Text style={styles.flashBadgeText}>FLASH SALE</Text>
          </View>
          <View style={styles.timerBox}>
            <Feather name="clock" size={14} color={colors.primary} />
            {["06", "23", "41"].map((v, i) => (
              <React.Fragment key={i}>
                <View style={styles.timerDigit}>
                  <Text style={styles.timerDigitText}>{v}</Text>
                </View>
                {i < 2 && <Text style={styles.timerColon}>:</Text>}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.catContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catScroll}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = cat.id === selectedCategory;
              return (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.catChip,
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
                      styles.catChipText,
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === "all" ? "All Products" : CATEGORIES.find((c) => c.id === selectedCategory)?.name}
          </Text>
          <Text style={styles.seeAll}>{filteredProducts.length} items</Text>
        </View>

        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>

        <View style={{ height: bottomPadding + 90 }} />
      </ScrollView>
    </View>
  );
}
