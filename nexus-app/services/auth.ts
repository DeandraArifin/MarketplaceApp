// services/auth.ts
import * as SecureStore from 'expo-secure-store';

export const saveAuthData = async (token: string, username: string, role: string) => {
  await SecureStore.setItemAsync('access_token', token);
  await SecureStore.setItemAsync('username', username);
  await SecureStore.setItemAsync('role', role);
};

export const getAccessToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync('access_token');
};

export const handleLogout = async () => {
  await SecureStore.deleteItemAsync('access_token');
  await SecureStore.deleteItemAsync('username');
  await SecureStore.deleteItemAsync('role');
};
