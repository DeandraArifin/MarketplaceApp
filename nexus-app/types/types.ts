export enum TradeType {
  BARISTA = 'BARISTA',
  BARTENDER = 'BARTENDER',
  CHEF = 'CHEF',
  CONCIERGE = 'CONCIERGE',
  FOH = 'FOH',
  MECHANIC = 'MECHANIC',
  PLUMBER = 'PLUMBER',
  ELECTRICIAN = 'ELECTRICIAN',
  HVACTECH = 'HVACTECH',
}

export enum AccountType {
  BUSINESS = 'BUSINESS',
  SERVICEPROVIDER = 'SERVICEPROVIDER',
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phoneNum: string;
  account_type: AccountType;
  abn?: string;
  address?: string;
  first_name?: string;
  last_name?: string;
  trade?: TradeType;
}

export type ErrorFields = {
  username?: string;
  email?: string;
  password?: string;
  phoneNum?: string;
  accountType?: string;
  abn?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  trade?: string;
};

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: AccountType;
}

export interface UserProfile {
  username: string;
  email: string;
  address?: string;
  abn?: string;
  first_name?: string;
  last_name?: string;
  trade?: TradeType;
}
