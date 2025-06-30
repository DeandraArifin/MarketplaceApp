import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import {useRouter} from 'expo-router';
import {getUsername, getRole} from '@/services/auth'

export default function HomeScreen() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {

      const storedUsername = await getUsername();
      const storedRole = await getRole();

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
