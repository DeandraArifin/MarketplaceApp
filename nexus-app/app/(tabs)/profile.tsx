import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import {useRouter} from 'expo-router';
import { getAccessToken, handleLogout } from '@/services/auth';
import { getProfile } from '@/services/api';
import { RegisterRequest, AccountType, TradeType, ErrorFields} from '@/types/types';
import { validateRegistrationForm } from '@/utils/userformvalidation';
import TradePicker from '../../components/TradePicker' //TODO: fix and implement reusable TradePicker component
import { globalStyles } from '@/styles/global';

export default function Profile() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<ErrorFields>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [data, setData] = useState<Partial<RegisterRequest>>({});
  const [tradeOpen, setTradeOpen] = useState(false);

  useEffect (() => {
    const fetchProfile = async () => {
        const token = await getAccessToken();

        if(!token) {
            router.replace('/login');
            return;
        }

        try{
            const profile = await getProfile(token);
            
      if ('abn' in profile) {
        // BUSINESS
            setData({
            username: profile.username,
            email: profile.email,
            phone_number: profile.phone_number,
            abn: profile.abn,
            address: profile.address,
            account_type: AccountType.BUSINESS,
            });
        } else if ('first_name' in profile) {
            // SERVICEPROVIDER
            setData({
            username: profile.username,
            email: profile.email,
            phone_number: profile.phone_number,
            first_name: profile.first_name,
            last_name: profile.last_name,
            address: profile.address,
            trade: profile.trade,
            account_type: AccountType.SERVICEPROVIDER,
            });
        } else {
            Alert.alert('Profile fetch failed.');
        }


        } catch (error) {
            console.error('Network error:', error);
            Alert.alert('Network error');
        }

    };
    fetchProfile();
  }, []);

  const handleSubmit = async () => {
    setSubmitted(true);
    const validationErrors = validateRegistrationForm(data);
    const formIsValid = Object.keys(validationErrors).length === 0;
    
    setErrors(validationErrors);
    setIsFormValid(formIsValid);

    if(formIsValid){
        
    }
  }

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <Text style={styles.username}>Hi {data.username}!</Text>
      <Text style={styles.header}>Email: {data.email}</Text>
      {data.account_type === AccountType.SERVICEPROVIDER && (
        <>
        <Text>First Name</Text>
        <TextInput style={globalStyles.input} value={data.first_name} onChangeText={(text) => setData(prev => ({ ...prev, first_name: text }))} />
        <Text>Last Name</Text>
        <TextInput style={globalStyles.input} value={data.last_name} onChangeText={(text) => setData(prev => ({ ...prev, last_name: text }))} />
        <Text>Phone Number</Text>
        <TextInput style={globalStyles.input} value={data.phone_number} onChangeText={(text) => setData(prev => ({ ...prev, phone_number: text }))} />
        <Text>Address</Text>
        <TextInput style={globalStyles.input} value={data.address} onChangeText={(text) => setData(prev => ({ ...prev, address: text }))} />
        <TradePicker
            value={data.trade ?? ''}
            onChange={(val) => setData(prev => ({ ...prev, trade: val }))}
            error={errors.trade}
            open={tradeOpen}
            setOpen={setTradeOpen}
        />
        </>
      )}
      {data.account_type === AccountType.BUSINESS &&(
        <>
        <Text>ABN: {data.abn}</Text>
        <Text>Address: {data.address}</Text>
        </>
      )}

      <TouchableOpacity style={[globalStyles.button]}
            onPress={handleSubmit}>
            <Text style={globalStyles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      <Button title="Logout" onPress={async () => {await handleLogout(); router.replace('/login');}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow:1, justifyContent: 'center', padding:20 },
  username: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  role: { fontSize: 18, color: 'gray' },
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 10, padding: 5, backgroundColor: 'white', borderRadius: 10, },
  header: { fontSize: 15, fontWeight: 'bold', marginBottom:8},
});
