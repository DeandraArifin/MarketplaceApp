// LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      });

      const data = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync('access_token', data.access_token)
        Alert.alert('Login successful', `Token: ${data.access_token}`);
        navigation.navigate('Home')
        // Save token securely, then navigate to app home
      } else {
        Alert.alert('Login failed', data.detail || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error or server is down');
    }
  };

  return (
    <View style={styles.container}>
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
      <Button title="Go to Register" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 5 },
});
