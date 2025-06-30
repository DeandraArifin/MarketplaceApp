import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, ScrollView, TextInput, Button, Text, StyleSheet, Alert, Platform, TouchableOpacity } from 'react-native';
import {useRouter} from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { registerUser } from '../services/api';
import { RegisterRequest, AccountType, TradeType, ErrorFields} from '../types/types';
import { validateRegistrationForm } from '@/utils/userformvalidation';
import { globalStyles } from '@/styles/global';


const tradeOptions = Object.values(TradeType);
const accountOptions = Object.values(AccountType);

export default function RegisterScreen() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(
    tradeOptions.map((tradeOption) => ({
      label: tradeOption,
      value: tradeOption,
    }))
  );

  const [accountItems, setAccountItems] = useState(
    accountOptions.map((accountOption) => ({
      label: accountOption,
      value: accountOption,
    }))
  );

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [abn, setAbn] = useState('');
  const [address, setAddress] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [accountType, setAccountType] = useState<AccountType | "">("");
  const [trade, setTrade] = useState<TradeType | "">("");
  const [errors, setErrors] = useState<ErrorFields>({});
  const [submitted, setSubmitted] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);

  const router = useRouter();
  const data: Partial<RegisterRequest> = {
    username,
    email,
    password,
    phone_number: phoneNum,
    account_type: accountType as AccountType,
    abn,
    address,
    first_name: firstName,
    last_name: lastName,
    trade: trade as TradeType,
  };

  useEffect(() => {
    const errs = validateRegistrationForm(data);
    setErrors(errs);
    setIsFormValid(Object.keys(errs).length === 0);
  }, [username, email, password, phoneNum, accountType, abn, address, firstName, lastName, trade]);

  const handleRegister = async () => {
    setSubmitted(true);
    const validationErrors = validateRegistrationForm(data);
    const formIsValid = Object.keys(validationErrors).length === 0;

    setErrors(validationErrors);
    setIsFormValid(formIsValid); 

    if (!formIsValid) {
      console.log('Form has errors. Please correct them.');
      return;
    }

    const requestBody = {
      username,
      email,
      password,
      phone_number: phoneNum,
      account_type: accountType as AccountType,
      ...(accountType === 'BUSINESS' && { abn, address }),
      ...(accountType === 'SERVICEPROVIDER' && {
        first_name: firstName,
        last_name: lastName,
        address,
        trade: trade as TradeType,
      }),
    };

    console.log("Register request body:", requestBody); // DEBUG

    try {
      const data = await registerUser(requestBody);
      Alert.alert('Success', 'Registration successful! Please login.');
      router.replace('/login');

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Network error or server is down');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // adjust if you have header/navbar
    >
      <ScrollView
        contentContainerStyle={globalStyles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text>Username</Text>
        <TextInput style={[globalStyles.input, submitted && errors.username && globalStyles.inputError]} value={username} onChangeText={setUsername} autoCapitalize="none" />
        {submitted && errors.username && <Text style={globalStyles.errorText}>{errors.username}</Text>}

        <Text>Email</Text>
        <TextInput style={[globalStyles.input, submitted && errors.email && globalStyles.inputError]} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        {submitted && errors.email && <Text style={globalStyles.errorText}>{errors.email}</Text>}

        <Text>Phone Number</Text>
        <TextInput style={[globalStyles.input, submitted && errors.phoneNum && globalStyles.inputError]} value={phoneNum} onChangeText={setPhoneNum}></TextInput>
        {submitted && errors.phoneNum && <Text style={globalStyles.errorText}>{errors.phoneNum}</Text>}

        <Text>Password</Text>
        <TextInput style={[globalStyles.input, submitted && errors.password && globalStyles.inputError]} value={password} onChangeText={setPassword} secureTextEntry />
        {submitted && errors.password && <Text style={globalStyles.errorText}>{errors.password}</Text>}

        <Text>Account Type</Text>
        <DropDownPicker
              open={accountOpen}
              value={accountType}
              items={accountItems}
              setOpen={setAccountOpen}
              setValue={setAccountType}
              setItems={setAccountItems}
              placeholder="Select an account type."
              style={[globalStyles.input, {marginBottom: open ? 100 : 20},  submitted && errors.accountType && globalStyles.inputError]}
        />
        {submitted && errors.accountType && <Text style={globalStyles.errorText}>{errors.accountType}</Text>}

        {accountType === 'BUSINESS' && (
          <>
            <Text>ABN</Text>
            <TextInput style={[globalStyles.input, submitted && errors.abn && globalStyles.inputError]} value={abn} onChangeText={setAbn} keyboardType='numeric' maxLength={11} />
            {submitted && errors.abn && <Text style={globalStyles.errorText}>{errors.abn}</Text>}

            <Text>Address</Text>
            <TextInput style={[globalStyles.input, submitted && errors.address && globalStyles.inputError]} value={address} onChangeText={setAddress}/>
            {submitted && errors.address && <Text style={globalStyles.errorText}>{errors.address}</Text>}
          </>
        )}

        {accountType === 'SERVICEPROVIDER' && (
          <>
            <Text>First Name</Text>
            <TextInput style={[globalStyles.input, submitted && errors.firstName && globalStyles.inputError]} value={firstName} onChangeText={setFirstName} />
            {submitted && errors.firstName && <Text style={globalStyles.errorText}>{errors.firstName}</Text>}

            <Text>Last Name</Text>
            <TextInput style={[globalStyles.input, submitted && errors.lastName && globalStyles.inputError]} value={lastName} onChangeText={setLastName} />
            {submitted && errors.lastName && <Text style={globalStyles.errorText}>{errors.lastName}</Text>}

            <Text>Address</Text>
            <TextInput style={[globalStyles.input, submitted && errors.address && globalStyles.inputError]} value={address} onChangeText={setAddress} />
            {submitted && errors.address && <Text style={globalStyles.errorText}>{errors.address}</Text>}

            <Text>Trade</Text>
            <DropDownPicker
              open={tradeOpen}
              value={trade}
              items={items}
              setOpen={setTradeOpen}
              setValue={setTrade}
              setItems={setItems}
              placeholder="Select a trade"
              style={[globalStyles.input, {marginBottom: open ? 180 : 10},  submitted && errors.trade && globalStyles.inputError]}// makes space for dropdown
            />
            {submitted && errors.trade && <Text style={globalStyles.errorText}>{errors.trade}</Text>}
          </>
        )}

        <TouchableOpacity style={[globalStyles.button]}
          onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <Button title="Back to Login" onPress={() => router.replace('/login')} />

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: 'blue', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 12, marginBottom: 12,},
  buttonText: { color: '#fff', fontSize: 20, marginBottom: 12,},
});
