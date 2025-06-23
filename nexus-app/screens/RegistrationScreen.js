// RegisterScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const TradeType = {
  BARISTA: 'BARISTA',
  BARTENDER: 'BARTENDER',
  CHEF: 'CHEF',
  CONCIERGE: 'CONCIERGE',
  FOH: 'FOH',
  MECHANIC: 'MECHANIC',
  PLUMBER: 'PLUMBER',
  ELECTRICIAN: 'ELECTRICIAN',
  HVACTECH: 'HVACTECH',
};

const tradeOptions = Object.values(TradeType)

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('BUSINESS'); // or 'SERVICEPROVIDER'
  const [abn, setAbn] = useState('');
  const [address, setAddress] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [trade, setTrade] = useState(tradeOptions[0])

  const handleRegister = async () => {

    const requestBody = {
    username,
    email,
    password,
    account_type: accountType,
    };

    if (accountType === 'BUSINESS') {
        requestBody.abn = abn;
        requestBody.address = address;
    } else if (accountType === 'SERVICEPROVIDER') {
        requestBody.first_name = firstName;
        requestBody.last_name = lastName;
        requestBody.address = address;
        requestBody.trade = trade;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Registration successful! Please login.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Registration failed', data.detail || JSON.stringify(data));
      }
    } catch (error) {
      Alert.alert('Error', 'Network error or server is down');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Username</Text>
      <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />
      <Text>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Text>Password</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
      <Text>Account Type</Text>
      <Button title="Business" onPress={() => setAccountType('BUSINESS')} />
      <Button title="Service Provider" onPress={() => setAccountType('SERVICEPROVIDER')} />
      <Text>Selected: {accountType}</Text>
      {accountType === 'BUSINESS' && (
        <>
            <Text>ABN</Text>
            <TextInput style={styles.input} value={abn} onChangeText={setAbn} keyboardType='numeric' maxLength={11} />
            <Text>Address</Text>
            <TextInput style={styles.input} value={address} onChangeText={setAddress}/>
        </>
      )}

      {accountType === 'SERVICEPROVIDER' && (
        <>
            <Text>First Name</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
            <Text>Last Name</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
            <Text>Address</Text>
            <TextInput style={styles.input} value={address} onChangeText={setAddress} />
            <Text>Trade</Text>
            <Picker
                selectedValue={trade}
                onValueChange={(itemValue) => setTrade(itemValue)}
                style={{ height: 50, width: 250}}
            >
                {tradeOptions.map((tradeOption) => (
                    <Picker.Item label={tradeOption} value={tradeOption} key={tradeOption} />
                ))}
            </Picker>
        </>
      )}
      <Button title="Register" onPress={handleRegister} />
      <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 5 },
});
