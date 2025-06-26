import { Slot, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const token = await SecureStore.getItemAsync('access_token');
      setUserToken(token);
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!userToken) {
        // User not logged in, route to login
        router.replace('/login');
      } else {
        // User logged in, route to protected tabs
        router.replace('/');
      }
    }
  }, [isLoading, userToken]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex:1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return <Slot />;
}
