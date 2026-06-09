import { Platform } from 'react-native';
import { getToken } from './authStorage';

const getBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  return 'http://localhost:5000';
};

/**
 * Handles behind-the-scenes auth mapping. Logs in if user exists, registers otherwise.
 * Returns the JWT auth token.
 */
export async function loginOrRegister(phone: string): Promise<string> {
  const email = `phone_${phone}@tenure.app`;
  const password = `pass_${phone}`;
  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.data?.token) {
        return data.data.token;
      }
    }
  } catch (err) {
    console.log('Login request error, proceeding to register:', err);
  }

  // Fallback to register
  const regResponse = await fetch(`${baseUrl}/api/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      name: `User ${phone}`,
    }),
  });

  if (!regResponse.ok) {
    const errorData = await regResponse.json().catch(() => ({}));
    throw new Error(errorData.message || 'Authentication failed');
  }

  const regData = await regResponse.json();
  if (!regData?.data?.token) {
    throw new Error('No token returned from registration');
  }
  return regData.data.token;
}

/**
 * Fetches the user profile from the backend. Returns null if 404 (no profile yet).
 */
export async function fetchProfile(): Promise<any | null> {
  const token = await getToken();
  if (!token) return null;

  const baseUrl = getBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/users/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const data = await response.json();
    return data?.data?.profile || null;
  } catch (error) {
    console.log('Error fetching profile:', error);
    return null;
  }
}

/**
 * Creates or updates the user profile on the backend.
 */
export async function upsertProfile(profileData: any): Promise<any> {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/users/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update profile');
  }

  const data = await response.json();
  return data?.data?.profile;
}
