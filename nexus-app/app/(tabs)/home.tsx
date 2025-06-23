import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {useRouter} from 'expo-router';

export default function HomeScreen() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      // Replace these keys with how you actually store username & role
      const storedUsername = await SecureStore.getItemAsync('username');
      const storedRole = await SecureStore.getItemAsync('role');

      setUsername(storedUsername || 'User');
      setRole(storedRole || 'Unknown');
    };

    loadUserData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {username}!</Text>
      <Text style={styles.role}>Your role: {role}</Text>
      <Button title="Logout" onPress={() => router.replace('/logout')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  role: { fontSize: 18, color: 'gray' },
});
