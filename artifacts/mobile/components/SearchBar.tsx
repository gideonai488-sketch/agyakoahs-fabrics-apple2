import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onPress?: () => void;
  editable?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search products...",
  onPress,
  editable = true,
}: SearchBarProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row" as const,
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 25,
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      padding: 0,
    },
  });

  const content = (
    <View style={styles.container}>
      <Feather name="search" size={18} color={colors.mutedForeground} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        returnKeyType="search"
        editable={editable}
        pointerEvents={editable ? "auto" : "none"}
      />
      <Feather name="camera" size={18} color={colors.mutedForeground} />
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}
