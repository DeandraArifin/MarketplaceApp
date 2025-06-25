import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import {useRouter} from 'expo-router';
import { getAccessToken, handleLogout } from '@/services/auth';
import { getProfile } from '@/services/api';
import { AccountType, TradeType, ErrorFields} from '@/types/types';
import { validateRegistrationForm } from '@/utils/userformvalidation';

export default function Profile() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [trade, setTrade] = useState('');
  const [abn, setAbn] = useState('');
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<ErrorFields>({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect (() => {
    const fetchProfile = async () => {
        const token = await getAccessToken();

        if(!token) {
            router.replace('/login');
            return;
        }

        try{
            const data = await getProfile(token);
            setUsername(data.username);
            setEmail(data.email);

            if ('abn' in data) {
            // It's a BUSINESS
                setAbn(data.abn);
                setAddress(data.address);
            } else if ('first_name' in data) {
            // It's a SERVICEPROVIDER
                setFirstName(data.first_name);
                setLastName(data.last_name);
                setAddress(data.address);
                setTrade(data.trade);
            }

            else{
                Alert.alert("Profile fetch failed.")
            }


        } catch (error) {
            console.error('Network error:', error);
            Alert.alert('Network error');
        }

    };
    fetchProfile();
  }, []);

//   const handleSubmit = async () => {
//     setSubmitted(true);
//     const validationErrors = validateRegistrationForm(data);
//     const formIsValid = Object.keys(validationErrors).length === 0;
    
//     setErrors(validationErrors);
//     setIsFormValid(formIsValid); // still useful for UI
//   }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.username}>Hi {username}!</Text>
      <Text style={styles.header}>Email: {email}</Text>
      {trade !== '' && (
        <>
        <Text>First Name</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
        <Text>Last Name</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
        <Text>Address</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} />
        <Text>Trade</Text>
        <TextInput style={styles.input} value={trade} onChangeText={setTrade} />
        </>
      )}
      {abn !== '' &&(
        <>
        <Text>ABN: {abn}</Text>
        <Text>Address: {address}</Text>
        </>
      )}
      <Text></Text>
      <Button title="Logout" onPress={async () => {await handleLogout(); router.replace('/login');}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow:1, justifyContent: 'center', padding:20 },
  username: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  role: { fontSize: 18, color: 'gray' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 5 },
  header : { fontSize: 15, fontWeight: 'bold', marginBottom:8},
});
