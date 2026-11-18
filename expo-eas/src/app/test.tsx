import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TestCard } from "@/components/test/TestCard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTestStore } from "@/stores/test/test.store";

export default function TestScreen() {
  const { items, addTest, clear } = useTestStore();

  const handleAdd = () => {
    addTest({
      id: String(Date.now()),
      test: `Test Item #${items.length + 1}`,
    });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title">Test Domain</ThemedText>
          <Link href="/" asChild>
            <Pressable style={styles.backButton}>
              <Text style={styles.buttonText}>Back Home</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.button} onPress={handleAdd}>
            <Text style={styles.buttonText}>Add Test Item</Text>
          </Pressable>
          {items.length > 0 && (
            <Pressable style={[styles.button, styles.clearButton]} onPress={clear}>
              <Text style={styles.buttonText}>Clear All</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.list}>
          {items.map((item) => (
            <TestCard key={item.id} data={item} />
          ))}
          {items.length === 0 && (
            <ThemedText type="default" style={styles.emptyText}>
              No test items added yet. Tap "Add Test Item" above.
            </ThemedText>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#e5e7eb",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearButton: {
    backgroundColor: "#dc2626",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    opacity: 0.6,
  },
});
