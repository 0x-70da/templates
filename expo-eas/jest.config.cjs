module.exports = {
  preset: "jest-expo",
  testMatch: ["**/test/**/*.test.[jt]s?(x)"],
  transformIgnorePatterns: [
    "node_modules/(?!(.pnpm|((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|nativewind|react-native-reanimated|@hookform|zustand|immer))",
  ],
};
