import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/" as never);
    } catch {
      Alert.alert("Login failed", "Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    gradient: {
      paddingTop: insets.top + 40,
      paddingBottom: 40,
      paddingHorizontal: 24,
      alignItems: "center",
    },
    logoContainer: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    appName: {
      fontSize: 28,
      fontWeight: "700" as const,
      color: "#fff",
      fontFamily: "Inter_700Bold",
      marginBottom: 6,
    },
    tagline: {
      fontSize: 14,
      color: "rgba(255,255,255,0.8)",
      fontFamily: "Inter_400Regular",
    },
    formContainer: {
      flex: 1,
      backgroundColor: "#fff",
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      marginTop: -20,
      paddingHorizontal: 24,
      paddingTop: 32,
    },
    title: {
      fontSize: 24,
      fontWeight: "700" as const,
      color: "#1a1a1a",
      fontFamily: "Inter_700Bold",
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 14,
      color: "#888",
      fontFamily: "Inter_400Regular",
      marginBottom: 28,
    },
    label: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: "#333",
      fontFamily: "Inter_600SemiBold",
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: "row" as const,
      alignItems: "center",
      backgroundColor: "#f5f5f5",
      borderRadius: 14,
      paddingHorizontal: 14,
      marginBottom: 16,
      borderWidth: 1.5,
      borderColor: "transparent",
    },
    inputContainerFocused: {
      borderColor: "#FF4500",
      backgroundColor: "#fff",
    },
    input: {
      flex: 1,
      height: 52,
      fontSize: 15,
      color: "#1a1a1a",
      fontFamily: "Inter_400Regular",
    },
    forgotPassword: {
      alignSelf: "flex-end",
      marginTop: -8,
      marginBottom: 24,
    },
    forgotPasswordText: {
      fontSize: 13,
      color: "#1F8C6B",
      fontFamily: "Inter_500Medium",
    },
    loginBtn: {
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 20,
    },
    loginBtnGradient: {
      paddingVertical: 16,
      alignItems: "center",
    },
    loginBtnText: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: "#fff",
      fontFamily: "Inter_700Bold",
    },
    dividerRow: {
      flexDirection: "row" as const,
      alignItems: "center",
      marginBottom: 20,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: "#e8e8e8",
    },
    dividerText: {
      fontSize: 13,
      color: "#888",
      marginHorizontal: 12,
    },
    signupRow: {
      flexDirection: "row" as const,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
    },
    signupText: {
      fontSize: 14,
      color: "#888",
      fontFamily: "Inter_400Regular",
    },
    signupLink: {
      fontSize: 14,
      color: "#1F8C6B",
      fontFamily: "Inter_600SemiBold",
    },
    guestBtn: {
      alignItems: "center",
      paddingVertical: 12,
    },
    guestText: {
      fontSize: 14,
      color: "#888",
      fontFamily: "Inter_400Regular",
    },
  });

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#1F8C6B", "#27A87E"]}
        style={styles.gradient}
      >
        <View style={styles.logoContainer}>
          <Feather name="shopping-bag" size={32} color="#fff" />
        </View>
        <Text style={styles.appName}>Agyakoahs Fabrics</Text>
        <Text style={styles.tagline}>Quality fabrics & products delivered to you</Text>
      </LinearGradient>

      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue shopping</Text>

        <Text style={styles.label}>Email</Text>
        <View style={[styles.inputContainer, emailFocused && styles.inputContainerFocused]}>
          <Feather name="mail" size={18} color="#888" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={[styles.inputContainer, passwordFocused && styles.inputContainerFocused]}>
          <Feather name="lock" size={18} color="#888" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
          <Pressable onPress={() => setShowPassword((v) => !v)}>
            <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#888" />
          </Pressable>
        </View>

        <Pressable style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </Pressable>

        <Pressable style={styles.loginBtn} onPress={handleLogin} disabled={isLoading}>
          <LinearGradient colors={["#1F8C6B", "#27A87E"]} style={styles.loginBtnGradient}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </LinearGradient>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <Pressable style={styles.guestBtn} onPress={() => router.replace("/(tabs)/" as never)}>
          <Text style={styles.guestText}>Continue as guest</Text>
        </Pressable>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Pressable onPress={() => router.replace("/auth/signup" as never)}>
            <Text style={styles.signupLink}>Sign up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
