import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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

export default function PersonalInfoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Missing Info", "Please enter your full name.");
      return;
    }
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Saved", "Your profile has been updated.");
  }

  const FIELDS = [
    { label: "Full Name", value: name, onChange: setName, placeholder: "John Mensah", icon: "user", kb: "default" as const },
    { label: "Phone Number", value: phone, onChange: setPhone, placeholder: "+233 24 000 0000", icon: "phone", kb: "phone-pad" as const },
    { label: "Email Address", value: user?.email ?? "", onChange: () => {}, placeholder: "", icon: "mail", kb: "email-address" as const, disabled: true },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Personal Info</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottomPadding + 100 }}>
        <View style={[styles.avatarSection, { backgroundColor: colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
            </Text>
          </View>
          <View>
            <Text style={[styles.avatarName, { color: colors.foreground }]}>{name || "Your Name"}</Text>
            <Text style={[styles.avatarSub, { color: colors.mutedForeground }]}>ShopHub Member</Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PROFILE DETAILS</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {FIELDS.map((field, idx) => (
            <View key={field.label} style={[styles.fieldRow, idx < FIELDS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={[styles.fieldIcon, { backgroundColor: colors.accent }]}>
                <Feather name={field.icon as never} size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{field.label}</Text>
                <TextInput
                  style={[styles.fieldInput, { color: field.disabled ? colors.mutedForeground : colors.foreground }]}
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType={field.kb}
                  editable={!field.disabled}
                />
              </View>
              {field.disabled && (
                <Feather name="lock" size={14} color={colors.mutedForeground} />
              )}
            </View>
          ))}
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.accent }]}>
          <Feather name="info" size={14} color={colors.primary} />
          <Text style={{ flex: 1, fontSize: 12, color: colors.primary, fontFamily: "Inter_400Regular" }}>
            Your email address cannot be changed. Contact support if you need help.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomPadding + 12, backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Pressable
          style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: isSaving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Feather name="check" size={18} color="#fff" />
          <Text style={styles.saveBtnText}>{isSaving ? "Saving…" : "Save Changes"}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  avatarSection: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  avatarName: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  avatarSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", fontWeight: "600", letterSpacing: 0.8, marginBottom: 8 },
  card: { borderRadius: 16, overflow: "hidden", marginBottom: 14 },
  fieldRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  fieldIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 2 },
  fieldInput: { fontSize: 15, fontFamily: "Inter_500Medium" },
  infoBox: { flexDirection: "row", gap: 10, padding: 12, borderRadius: 12, alignItems: "flex-start" },
  bottomBar: { paddingHorizontal: 16, paddingTop: 14, borderTopWidth: 1 },
  saveBtn: { borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 15, gap: 8 },
  saveBtnText: { fontSize: 15, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
});
