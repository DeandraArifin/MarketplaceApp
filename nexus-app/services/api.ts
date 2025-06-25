// services/api.ts
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

if (!API_URL) {
  console.warn("API_URL is undefined! Check environment config.");
}


export const registerUser = async (data: any) => {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || 'Registration failed');
  return json;
};

export const loginUser = async (username: string, password: string) => {
  console.log('Using API url:', `${API_URL}/login`);
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
  });
  const json = await res.json();
  if(!res.ok) throw new Error(json.detail || 'Login failed');
  return json;
};

export const getProfile = async(token: string) => {
  const res = await fetch(`${API_URL}/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if(!res.ok) throw new Error(data.detail || 'Failed to fetch profile');
  return data;
}
