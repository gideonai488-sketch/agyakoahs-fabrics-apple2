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
    title: "Fashion Sale",
    subtitle: "Up to 80% off",
    gradient: ["#FF4500", "#FF6B35"] as const,
  },
  {
    id: "2",
    image: require("@/assets/images/banner2.png"),
    title: "Electronics",
    subtitle: "Best gadgets deals",
    gradient: ["#1a1a2e", "#16213e"] as const,
  },
  {
    id: "3",
    image: require("@/assets/images/banner3.png"),
    title: "Home & Living",
    subtitle: "Refresh your space",
    gradient: ["#2d6a4f", "#40916c"] as const,
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
      paddingTop: topPadding + 8,
      paddingHorizontal: 12,
      paddingBottom: 8,
      backgroundColor: colors.card,
      flexDirection: "row" as const,
      alignItems: "center",
      gap: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 3,
    },
    logoMark: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: "#fff",
      fontFamily: "Inter_700Bold",
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
      height: 180,
      marginVertical: 16,
    },
    banner: {
      width: width - 32,
      height: 180,
      borderRadius: 16,
      overflow: "hidden",
      marginHorizontal: 16,
    },
    bannerImage: {
      ...StyleSheet.absoluteFillObject,
    },
    bannerGradient: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.6,
    },
    bannerContent: {
      position: "absolute",
      bottom: 20,
      left: 20,
    },
    bannerTitle: {
      fontSize: 22,
      fontWeight: "700" as const,
      color: "#fff",
      fontFamily: "Inter_700Bold",
    },
    bannerSubtitle: {
      fontSize: 14,
      color: "rgba(255,255,255,0.9)",
      fontFamily: "Inter_400Regular",
    },
    bannerShopBtn: {
      marginTop: 8,
      backgroundColor: "#fff",
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: "flex-start",
    },
    bannerShopBtnText: {
      fontSize: 12,
      fontWeight: "600" as const,
      color: "#FF4500",
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
        <Pressable
          style={{ flex: 1 }}
          onPress={() => router.push("/search" as never)}
        >
          <View style={{
            flexDirection: "row" as const,
            alignItems: "center",
            backgroundColor: colors.background,
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 7,
            gap: 6,
          }}>
            <Feather name="search" size={15} color={colors.mutedForeground} />
            <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
              Search products...
            </Text>
          </View>
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.bannerContainer}>
          <FlatList
            ref={bannerRef}
            data={BANNERS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveBanner(idx);
            }}
            renderItem={({ item }) => (
              <View style={styles.banner}>
                <Image source={item.image} style={styles.bannerImage} contentFit="cover" />
                <LinearGradient
                  colors={item.gradient}
                  style={styles.bannerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerTitle}>{item.title}</Text>
                  <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                  <Pressable style={styles.bannerShopBtn}>
                    <Text style={styles.bannerShopBtnText}>Shop now</Text>
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
