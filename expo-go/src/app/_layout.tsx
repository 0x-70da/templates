import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Text, useColorScheme, View } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import migrations from "../../db/migrations/migrations";

SplashScreen.preventAutoHideAsync();

import "../global.css";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "../../db";
import { useEffect } from "react";

export default function TabLayout() {
  const { success, error } = useMigrations(db, migrations);
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!error) return;
    SplashScreen.hideAsync();
    console.error("DB migration failed:", error);
    // Sentry.captureException(error);
  }, [error]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-2 p-6">
        <Text className="text-lg font-semibold">
          There was an error while preparing the database
        </Text>
        <Text className="text-center text-neutral-500">
          Please try closing and reopening the app. If the problem persists,
          contact support.
        </Text>
        {__DEV__ && <Text className="text-red-500">{error.message}</Text>}
      </View>
    );
  }

  if (!success) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
