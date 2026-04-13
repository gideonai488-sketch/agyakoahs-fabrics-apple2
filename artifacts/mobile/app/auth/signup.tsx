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

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignup() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/" as never);
    } catch {
      Alert.alert("Signup failed", "Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#FF4500", "#FF6B35"]}
        style={{
          paddingTop: insets.top + 30,
          paddingBottom: 30,
          paddingHorizontal: 24,
          alignItems: "center",
        }}
      >
        <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
          <Feather name="user-plus" size={28} color="#fff" />
        </View>
        <Text style={{ fontSize: 24, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold", marginBottom: 4 }}>
          Create Account
        </Text>
        <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontFamily: "Inter_400Regular" }}>
          Join millions of happy shoppers
        </Text>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, paddingHorizontal: 24, paddingTop: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {[
          { label: "Full Name", value: name, setter: setName, icon: "user", placeholder: "John Doe", keyboard: "default" as const, autoCapitalize: "words" as const },
          { label: "Email", value: email, setter: setEmail, icon: "mail", placeholder: "your@email.com", keyboard: "email-address" as const, autoCapitalize: "none" as const },
        ].map((field) => (
          <View key={field.label} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: "600" as const, color: "#333", fontFamily: "Inter_600SemiBold", marginBottom: 8 }}>
              {field.label}
            </Text>
            <View style={{ flexDirection: "row" as const, alignItems: "center", backgroundColor: "#f5f5f5", borderRadius: 14, paddingHorizontal: 14 }}>
              <Feather name={field.icon as never} size={18} color="#888" style={{ marginRight: 10 }} />
              <TextInput
                style={{ flex: 1, height: 52, fontSize: 15, color: "#1a1a1a", fontFamily: "Inter_400Regular" }}
                value={field.value}
                onChangeText={field.setter}
                placeholder={field.placeholder}
                placeholderTextColor="#aaa"
                keyboardType={field.keyboard}
                autoCapitalize={field.autoCapitalize}
              />
            </View>
          </View>
        ))}

        <Text style={{ fontSize: 13, fontWeight: "600" as const, color: "#333", fontFamily: "Inter_600SemiBold", marginBottom: 8 }}>Password</Text>
        <View style={{ flexDirection: "row" as const, alignItems: "center", backgroundColor: "#f5f5f5", borderRadius: 14, paddingHorizontal: 14, marginBottom: 28 }}>
          <Feather name="lock" size={18} color="#888" style={{ marginRight: 10 }} />
          <TextInput
            style={{ flex: 1, height: 52, fontSize: 15, color: "#1a1a1a", fontFamily: "Inter_400Regular" }}
            value={password}
            onChangeText={setPassword}
            placeholder="Min 6 characters"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
          />
          <Pressable onPress={() => setShowPassword((v) => !v)}>
            <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#888" />
          </Pressable>
        </View>

        <Pressable
          onPress={handleSignup}
          disabled={isLoading}
          style={{ borderRadius: 16, overflow: "hidden", marginBottom: 20 }}
        >
          <LinearGradient colors={["#FF4500", "#FF6B35"]} style={{ paddingVertical: 16, alignItems: "center" }}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" }}>Create Account</Text>
            )}
          </LinearGradient>
        </Pressable>

        <Text style={{ fontSize: 11, color: "#aaa", textAlign: "center", marginBottom: 20, lineHeight: 16 }}>
          By signing up you agree to our Terms of Service and Privacy Policy
        </Text>

        <View style={{ flexDirection: "row" as const, justifyContent: "center", alignItems: "center", paddingBottom: insets.bottom + 20 }}>
          <Text style={{ fontSize: 14, color: "#888", fontFamily: "Inter_400Regular" }}>Already have an account? </Text>
          <Pressable onPress={() => router.replace("/auth/login" as never)}>
            <Text style={{ fontSize: 14, color: "#FF4500", fontFamily: "Inter_600SemiBold" }}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
