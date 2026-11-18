import { StyleSheet, Text, View } from "react-native";
import type { Test } from "@/types/test.types";

export interface TestCardProps {
  data: Test;
}

export function TestCard({ data }: TestCardProps) {
  return (
    <View style={styles.card} testID="test-card">
      <Text style={styles.title}>{data.test}</Text>
      <Text style={styles.subtitle}>ID: {data.id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
});
