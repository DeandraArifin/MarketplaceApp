// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="logout" options={{ href: null }} /> {/* hides it from the tab bar */}
    </Tabs>
  );
}
