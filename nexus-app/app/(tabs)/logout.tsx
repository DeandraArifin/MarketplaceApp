// app/(tabs)/logout.tsx
import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { Alert, View, ActivityIndicator } from 'react-native';

export default function LogoutScreen() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('username');
        await SecureStore.deleteItemAsync('role');

        Alert.alert('Logged out', 'You have been successfully logged out.');
        router.replace('/login');
      } catch (error) {
        Alert.alert('Logout Failed', 'Please try again.');
      }
    };

    performLogout();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
