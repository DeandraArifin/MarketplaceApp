import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, ScrollView, TextInput, Button, Text, StyleSheet, Alert, Platform, TouchableOpacity } from 'react-native';
import {useRouter} from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { registerUser } from '../services/api';
import { RegisterRequest, AccountType, TradeType, ErrorFields} from '../types/types';
import { validateRegistrationForm } from '@/utils/userformvalidation';


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
    setIsFormValid(formIsValid); // still useful for UI

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
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text>Username</Text>
        <TextInput style={[styles.input, submitted && errors.username && styles.inputError]} value={username} onChangeText={setUsername} autoCapitalize="none" />
        {submitted && errors.username && <Text style={styles.error}>{errors.username}</Text>}

        <Text>Email</Text>
        <TextInput style={[styles.input, submitted && errors.email && styles.inputError]} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        {submitted && errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <Text>Phone Number</Text>
        <TextInput style={[styles.input, submitted && errors.phoneNum && styles.inputError]} value={phoneNum} onChangeText={setPhoneNum}></TextInput>
        {submitted && errors.phoneNum && <Text style={styles.error}>{errors.phoneNum}</Text>}

        <Text>Password</Text>
        <TextInput style={[styles.input, submitted && errors.password && styles.inputError]} value={password} onChangeText={setPassword} secureTextEntry />
        {submitted && errors.password && <Text style={styles.error}>{errors.password}</Text>}

        <Text>Account Type</Text>
        <DropDownPicker
              open={accountOpen}
              value={accountType}
              items={accountItems}
              setOpen={setAccountOpen}
              setValue={setAccountType}
              setItems={setAccountItems}
              placeholder="Select an account type."
              style={[styles.input, {marginBottom: open ? 100 : 20},  submitted && errors.accountType && styles.inputError]}
        />
        {submitted && errors.accountType && <Text style={styles.error}>{errors.accountType}</Text>}

        {accountType === 'BUSINESS' && (
          <>
            <Text>ABN</Text>
            <TextInput style={[styles.input, submitted && errors.abn && styles.inputError]} value={abn} onChangeText={setAbn} keyboardType='numeric' maxLength={11} />
            {submitted && errors.abn && <Text style={styles.error}>{errors.abn}</Text>}

            <Text>Address</Text>
            <TextInput style={[styles.input, submitted && errors.address && styles.inputError]} value={address} onChangeText={setAddress}/>
            {submitted && errors.address && <Text style={styles.error}>{errors.address}</Text>}
          </>
        )}

        {accountType === 'SERVICEPROVIDER' && (
          <>
            <Text>First Name</Text>
            <TextInput style={[styles.input, submitted && errors.firstName && styles.inputError]} value={firstName} onChangeText={setFirstName} />
            {submitted && errors.firstName && <Text style={styles.error}>{errors.firstName}</Text>}

            <Text>Last Name</Text>
            <TextInput style={[styles.input, submitted && errors.lastName && styles.inputError]} value={lastName} onChangeText={setLastName} />
            {submitted && errors.lastName && <Text style={styles.error}>{errors.lastName}</Text>}

            <Text>Address</Text>
            <TextInput style={[styles.input, submitted && errors.address && styles.inputError]} value={address} onChangeText={setAddress} />
            {submitted && errors.address && <Text style={styles.error}>{errors.address}</Text>}

            <Text>Trade</Text>
            <DropDownPicker
              open={tradeOpen}
              value={trade}
              items={items}
              setOpen={setTradeOpen}
              setValue={setTrade}
              setItems={setItems}
              placeholder="Select a trade"
              style={[styles.input, {marginBottom: open ? 180 : 10},  submitted && errors.trade && styles.inputError]}// makes space for dropdown
            />
            {submitted && errors.trade && <Text style={styles.error}>{errors.trade}</Text>}
          </>
        )}

        <TouchableOpacity style={[styles.button]}
          onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <Button title="Back to Login" onPress={() => router.replace('/login')} />

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 5 },
  button: { backgroundColor: 'blue', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 12, marginBottom: 12,},
  buttonText: { color: '#fff', fontSize: 20, marginBottom: 12,},
  error: { color: 'red', fontSize: 10, marginBottom: 12,},
  inputError: { borderColor: 'red',},
});
