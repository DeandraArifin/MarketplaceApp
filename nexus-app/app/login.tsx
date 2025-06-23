// LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import {useRouter} from 'expo-router';


export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      console.log("Sending login request for username:", username);

      const response = await fetch('http://192.168.8.198:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      });

      console.log("Response status:", response.status);

      const data = await response.json();

      console.log("Response data:", data);

      if (response.ok) {
        if (!data.access_token || !data.role) {
            Alert.alert('Login error', 'Invalid server response. Please try again.');
            return;
        }
        await SecureStore.setItemAsync('access_token', data.access_token)
        await SecureStore.setItemAsync('username', username)
        await SecureStore.setItemAsync('role', data.role);

        Alert.alert('Login successful', `Token: ${data.access_token}`);

        router.replace('/home')
        // Save token securely, then navigate to app home
      } else {
        Alert.alert('Login failed', data.detail || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error or server is down');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titleText}>Welcome to Nexus App</Text>
      <Text>Username</Text>
      <TextInput 
        style={styles.input} 
        value={username} 
        onChangeText={setUsername} 
        autoCapitalize="none" 
      />
      <Text>Password</Text>
      <TextInput 
        style={styles.input} 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Go to Register" onPress={() => router.replace('/registration')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 5 },
  titleText: {fontWeight: 'bold', fontSize: 24, color: '#007AFF'},
});
