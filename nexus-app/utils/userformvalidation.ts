// utils/validation.ts
import { AccountType, ErrorFields } from '../types/types';

//TODO: update to take data instead of specific parameters
export const validateRegistrationForm = (
  username: string,
  email: string,
  password: string,
  phoneNum: string,
  accountType: string,
  abn: string,
  address: string,
  firstName: string,
  lastName: string,
  trade: string
): ErrorFields => {
  const errors: ErrorFields = {};

  if (!username) errors.username = 'Username is required';
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Email is invalid.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password)
  ) {
    errors.password =
      'Password must be at least 8 chars, with uppercase, lowercase, and a number.';
  }

  if(!phoneNum) errors.phoneNum = 'Phone number is required.';
  if (phoneNum.length != 10) errors.phoneNum = 'Phone number must be 10 digits long.'

  if (!accountType) {
    errors.accountType = 'Please choose an account type.';
  } else if (!(accountType in AccountType)) {
    errors.accountType = 'Invalid account type.';
  }

  if (accountType === AccountType.BUSINESS) {
    if (!abn) {
      errors.abn = 'Please enter your registered ABN.';
    } else if (abn.length !== 11) {
      errors.abn = 'Invalid ABN. It must be exactly 11 digits.';
    }

    if (!address) errors.address = 'Please enter your business address.';
  }

  if (accountType === AccountType.SERVICEPROVIDER) {
    if (!firstName) errors.firstName = 'Please enter your first name.';
    if (!lastName) errors.lastName = 'Please enter your last name.';
    if (!address) errors.address = 'Please enter your address.';
    if (!trade) errors.trade = 'Please select a trade.';
  }

  return errors;
};
