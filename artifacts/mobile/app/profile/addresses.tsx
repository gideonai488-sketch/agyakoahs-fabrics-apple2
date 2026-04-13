import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  isDefault: boolean;
}

export default function AddressesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      label: "Home",
      name: "My Home",
      phone: "",
      address: "",
      city: "",
      region: "",
      isDefault: true,
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ label: "Home", name: "", phone: "", address: "", city: "", region: "" });

  function handleAdd() {
    if (!form.name.trim() || !form.address.trim() || !form.city.trim() || !form.region.trim()) {
      Alert.alert("Missing Info", "Please fill in all required fields.");
      return;
    }
    const newAddr: Address = {
      id: Date.now().toString(),
      label: form.label || "Home",
      name: form.name,
      phone: form.phone,
      address: form.address,
      city: form.city,
      region: form.region,
      isDefault: addresses.length === 0,
    };
    setAddresses((prev) => [...prev, newAddr]);
    setForm({ label: "Home", name: "", phone: "", address: "", city: "", region: "" });
    setShowModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleSetDefault(id: string) {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleDelete(id: string) {
    Alert.alert("Delete Address", "Remove this delivery address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setAddresses((prev) => prev.filter((a) => a.id !== id));
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  }

  const LABELS = ["Home", "Work", "Other"];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Addresses</Text>
        <Pressable onPress={() => setShowModal(true)} style={[styles.addBtn, { backgroundColor: colors.accent }]}>
          <Feather name="plus" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottomPadding + 40 }}>
        {addresses.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="map-pin" size={48} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No saved addresses</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Add a delivery address to speed up checkout</Text>
            <Pressable onPress={() => setShowModal(true)} style={[styles.addFirstBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.addFirstBtnText}>Add Address</Text>
            </Pressable>
          </View>
        ) : (
          addresses.map((addr) => (
            <View key={addr.id} style={[styles.addrCard, { backgroundColor: colors.card, borderColor: addr.isDefault ? colors.primary : "transparent", borderWidth: addr.isDefault ? 1.5 : 0 }]}>
              <View style={styles.addrTop}>
                <View style={[styles.addrIconBg, { backgroundColor: colors.accent }]}>
                  <Feather name="map-pin" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.addrLabelRow}>
                    <Text style={[styles.addrLabel, { color: colors.foreground }]}>{addr.label}</Text>
                    {addr.isDefault && (
                      <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.addrLine, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {addr.address ? `${addr.address}, ${addr.city}, ${addr.region}` : "Address not set"}
                  </Text>
                </View>
              </View>
              <View style={[styles.addrActions, { borderTopColor: colors.border }]}>
                {!addr.isDefault && (
                  <Pressable onPress={() => handleSetDefault(addr.id)} style={styles.addrAction}>
                    <Text style={[styles.addrActionText, { color: colors.primary }]}>Set as Default</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => handleDelete(addr.id)} style={styles.addrAction}>
                  <Text style={[styles.addrActionText, { color: colors.destructive }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Address Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setShowModal(false)}>
              <Text style={{ color: colors.mutedForeground, fontSize: 15, fontFamily: "Inter_400Regular" }}>Cancel</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Address</Text>
            <Pressable onPress={handleAdd}>
              <Text style={{ color: colors.primary, fontSize: 15, fontFamily: "Inter_600SemiBold", fontWeight: "600" }}>Save</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
            <View>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Label</Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                {LABELS.map((l) => (
                  <Pressable key={l} onPress={() => setForm((f) => ({ ...f, label: l }))}
                    style={[styles.labelChip, { backgroundColor: form.label === l ? colors.primary : colors.muted }]}>
                    <Text style={{ color: form.label === l ? "#fff" : colors.foreground, fontSize: 13, fontFamily: "Inter_500Medium" }}>{l}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {[
              { key: "name", label: "Recipient Name *", placeholder: "John Mensah", kb: "default" },
              { key: "phone", label: "Phone Number", placeholder: "+233 24 000 0000", kb: "phone-pad" },
              { key: "region", label: "Region *", placeholder: "Greater Accra", kb: "default" },
              { key: "city", label: "City / Town *", placeholder: "Accra", kb: "default" },
              { key: "address", label: "Street Address *", placeholder: "123 Liberation Road", kb: "default" },
            ].map((field) => (
              <View key={field.key}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{field.label}</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                  value={(form as any)[field.key]}
                  onChangeText={(v) => setForm((f) => ({ ...f, [field.key]: v }))}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType={field.kb as any}
                />
              </View>
            ))}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  addBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  addFirstBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  addFirstBtnText: { color: "#fff", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  addrCard: { borderRadius: 16, marginBottom: 12, overflow: "hidden" },
  addrTop: { flexDirection: "row", gap: 12, padding: 14, alignItems: "flex-start" },
  addrIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  addrLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  addrLabel: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  defaultBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  defaultBadgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_600SemiBold", fontWeight: "600" },
  addrLine: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  addrActions: { flexDirection: "row", borderTopWidth: 1, paddingVertical: 4 },
  addrAction: { flex: 1, alignItems: "center", paddingVertical: 10 },
  addrActionText: { fontSize: 13, fontFamily: "Inter_600SemiBold", fontWeight: "600" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  fieldLabel: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  textInput: { borderRadius: 12, paddingHorizontal: 14, height: 50, fontSize: 14, fontFamily: "Inter_400Regular", borderWidth: 1 },
  labelChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
});
