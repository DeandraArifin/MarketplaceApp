// RegisterScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity, FlatList } from 'react-native';
import {useRouter} from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';


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

export default function RegisterScreen() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(
    tradeOptions.map((tradeOption) => ({
      label: tradeOption,
      value: tradeOption,
    }))
  );


  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState(''); // or 'SERVICEPROVIDER'
  const [abn, setAbn] = useState('');
  const [address, setAddress] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [trade, setTrade] = useState('');

  const router = useRouter();

  const handleRegister = async () => {

    const requestBody = {
    username,
    email,
    password,
    account_type: accountType
    } as any;

    if (accountType === 'BUSINESS') {
        requestBody.abn = abn;
        requestBody.address = address;
    } else if (accountType === 'SERVICEPROVIDER') {
        requestBody.first_name = firstName;
        requestBody.last_name = lastName;
        requestBody.address = address;
        requestBody.trade = trade;
    }

    console.log("Register request body:", requestBody); // DEBUG

    try {
      const response = await fetch('http://192.168.8.198:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Registration successful! Please login.');
        router.replace('/login');
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
            <DropDownPicker
              open={open}
              value={trade}
              items={items}
              setOpen={setOpen}
              setValue={setTrade}
              setItems={setItems}
              placeholder="Select a trade"
              style={{ marginBottom: open ? 180 : 10 }} // makes space for dropdown
            />

        </>
      )}
      <Button title="Register" onPress={handleRegister} />
      <Button title="Back to Login" onPress={() => router.replace('/login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 5 },
});
