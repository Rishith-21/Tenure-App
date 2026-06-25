import { Platform } from 'react-native';
import { getToken } from './authStorage';
import { ChatMessage } from '../types/chat';


const getBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  return 'http://localhost:5000';
};

/**
 * Finds or creates the user by phone number and returns a JWT.
 * Same phone always maps to the same account + profile on re-login.
 */
export async function loginOrRegister(phone: string): Promise<string> {
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/api/users/phone-auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Authentication failed');
  }

  const data = await response.json();
  if (!data?.data?.token) {
    throw new Error('No token returned from authentication');
  }
  return data.data.token;
}

export type BackendUser = {
  id: string;
  email: string;
  phone: string | null;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type BackendProfile = {
  id: string;
  userId: string;
  tenureId: string;
  profilePhoto: string | null;
  fullName: string;
  dob: string | null;
  gender: string | null;
  country: string;
  state: string;
  district: string;
  pinCode: string;
  languages: string[];
  categories: string[];
  hourlyRate: number | null;
  about: string | null;
  vibes: string[];
  professions: string[];
  vehicles: string[];
  interests: string[];
  availableDays: string[];
  availableTimeRange: string | null;
  bestTime: string | null;
  comfortPreferredPlaces: string | null;
  comfortTravelRange: string | null;
  comfortWith: string | null;
  comfortNotWith: string | null;
  aadhaarVerified: boolean;
  aadhaarMasked: string | null;
  gallery: string[];
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  website: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfileFetchResult =
  | {kind: 'missing'}
  | {kind: 'found'; profile: BackendProfile}
  | {kind: 'failed'};

export type ProfileUpsertInput = {
  fullName: string;
  profilePhoto?: string | null;
  dob: string;
  gender: string;
  country: string;
  state: string;
  district: string;
  pinCode: string;
  languages: string[];
  categories?: string[];
  hourlyRate?: number | null;
  about?: string | null;
  vibes?: string[];
  professions?: string[];
  vehicles?: string[];
  interests?: string[];
  availableDays?: string[];
  availableTimeRange?: string | null;
  bestTime?: string | null;
  comfortPreferredPlaces?: string | null;
  comfortTravelRange?: string | null;
  comfortWith?: string | null;
  comfortNotWith?: string | null;
  aadhaarVerified?: boolean;
  aadhaarMasked?: string | null;
  gallery?: string[];
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  website?: string | null;
};

export async function fetchCurrentUser(): Promise<BackendUser | null> {
  const token = await getToken();
  if (!token) return null;

  const baseUrl = getBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/users/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch current user');
    }

    const data = await response.json();
    return data?.data?.user || null;
  } catch (error) {
    console.log('Error fetching current user:', error);
    return null;
  }
}

/**
 * Fetches the user profile from the backend. Returns null if 404 (no profile yet).
 */
export async function fetchProfile(): Promise<BackendProfile | null> {
  const result = await fetchProfileResult();
  if (result.kind === 'found') {
    return result.profile;
  }
  return null;
}

/**
 * Explicit profile fetch result for auth routing (distinguishes missing vs errors).
 */
export async function fetchProfileResult(): Promise<ProfileFetchResult> {
  const token = await getToken();
  if (!token) {
    return {kind: 'missing'};
  }

  const baseUrl = getBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/users/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return {kind: 'missing'};
    }

    if (!response.ok) {
      return {kind: 'failed'};
    }

    const data = await response.json();
    const profile = data?.data?.profile as BackendProfile | undefined;
    if (!profile) {
      return {kind: 'missing'};
    }
    return {kind: 'found', profile};
  } catch (error) {
    console.log('Error fetching profile:', error);
    return {kind: 'failed'};
  }
}

/**
 * Creates or updates the user profile on the backend.
 */
export async function upsertProfile(
  profileData: ProfileUpsertInput,
): Promise<BackendProfile> {
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

export type DiscoverMateApi = {
  userId: string;
  tenureId: string;
  fullName: string;
  profilePhoto: string | null;
  district: string;
  state: string;
  gender: string | null;
  dob: string;
  categories: string[];
  hourlyRate: number | null;
  languages: string[];
  about: string | null;
  aadhaarVerified: boolean;
  gallery: string[];
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  website: string | null;
};

export type DiscoverSearchParams = {
  q?: string;
  district?: string | null;
  category?: string | null;
  gender?: 'all' | 'male' | 'female';
  ageRange?: 'all' | 'under30' | '30to45' | 'over45';
  hourlyRateRange?: 'all' | 'under70' | '70to200' | '200to300' | 'custom';
  customHourlyRateMin?: number | null;
  customHourlyRateMax?: number | null;
};

/**
 * Search discoverable mates (excludes current user).
 */
export async function searchMates(
  params: DiscoverSearchParams,
): Promise<DiscoverMateApi[]> {
  const token = await getToken();
  if (!token) {
    return [];
  }

  const searchParams = new URLSearchParams();
  if (params.q?.trim()) {
    searchParams.set('q', params.q.trim());
  }
  if (params.district) {
    searchParams.set('district', params.district);
  }
  if (params.category) {
    searchParams.set('category', params.category);
  }
  if (params.gender && params.gender !== 'all') {
    searchParams.set('gender', params.gender);
  }
  if (params.ageRange && params.ageRange !== 'all') {
    searchParams.set('ageRange', params.ageRange);
  }
  if (params.hourlyRateRange && params.hourlyRateRange !== 'all') {
    searchParams.set('hourlyRateRange', params.hourlyRateRange);
  }
  if (params.customHourlyRateMin != null) {
    searchParams.set('customHourlyRateMin', String(params.customHourlyRateMin));
  }
  if (params.customHourlyRateMax != null) {
    searchParams.set('customHourlyRateMax', String(params.customHourlyRateMax));
  }

  const baseUrl = getBaseUrl();
  const qs = searchParams.toString();
  const url = `${baseUrl}/api/users/discover${qs ? `?${qs}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search mates');
    }

    const data = await response.json();
    return data?.data?.mates ?? [];
  } catch (error) {
    console.log('Error searching mates:', error);
    throw error;
  }
}

/**
 * Public mate profile for profile screen (another user's discoverable profile).
 */
export async function fetchMatePublicProfile(
  userId: string,
): Promise<DiscoverMateApi | null> {
  const token = await getToken();
  if (!token) {
    return null;
  }

  const baseUrl = getBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/users/mates/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch mate profile');
    }

    const data = await response.json();
    return data?.data?.mate ?? null;
  } catch (error) {
    console.log('Error fetching mate profile:', error);
    return null;
  }
}

export type SendRequestInput = {
  receiverId: string;
  categoryId: string;
  categoryLabel: string;
  meetLocation: string;
  fromDateTime: string;
  toDateTime: string;
  message?: string | null;
};

export type ApiMateRequest = {
  id: string;
  direction: 'sent' | 'received';
  mateUserId: string;
  mateName: string;
  mateTenureId: string;
  mateAvatar: string;
  categoryId: string;
  categoryLabel: string;
  meetLocation: string;
  fromDateTime: string;
  toDateTime: string;
  message: string;
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'expired';
  sentAt: string;
};

export async function sendMateRequest(
  payload: SendRequestInput,
): Promise<ApiMateRequest> {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to send mate request');
  }

  const data = await response.json();
  return data?.data?.request;
}

export async function fetchMateRequests(): Promise<{
  sent: ApiMateRequest[];
  received: ApiMateRequest[];
}> {
  const token = await getToken();
  if (!token) {
    return { sent: [], received: [] };
  }

  const baseUrl = getBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/requests`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch mate requests');
    }

    const data = await response.json();
    return (
      data?.data ?? { sent: [], received: [] }
    );
  } catch (error) {
    console.log('Error fetching mate requests:', error);
    return { sent: [], received: [] };
  }
}

export async function updateMateRequestStatus(
  requestId: string,
  status: 'confirmed' | 'declined' | 'cancelled',
): Promise<ApiMateRequest> {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/requests/${requestId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update request status');
  }

  const data = await response.json();
  return data?.data?.request;
}

export async function deactivateAccount(): Promise<void> {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/users/deactivate-me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to deactivate account');
  }
}

export async function deleteAccount(): Promise<void> {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/users/delete-me`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete account');
  }
}

export const getWebSocketUrl = (): string => {
  const baseUrl = getBaseUrl();
  return baseUrl.replace(/^http/, 'ws');
};

export async function fetchRequestMessages(requestId: string): Promise<ChatMessage[]> {
  const token = await getToken();
  if (!token) {
    return [];
  }

  const baseUrl = getBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/requests/${requestId}/messages`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch request messages');
    }

    const data = await response.json();
    return data?.data?.messages ?? [];
  } catch (error) {
    console.log('Error fetching request messages:', error);
    return [];
  }
}

export type BackendSession = {
  id: string;
  requestId: string;
  senderId: string;
  receiverId: string;
  status: 'running' | 'pause_requested' | 'paused' | 'resume_requested' | 'ended';
  startedAt: number;
  endedAt: number | null;
  elapsedSec: number;
  mateUserId: string;
  mateName: string;
  mateTenureId: string;
  mateAvatar: string;
  hourlyRate: number;
  billingAmount: number;
  lastActionBy: string | null;
};

async function postSessionAction(requestId: string, action: string): Promise<BackendSession> {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');

  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/requests/${requestId}/session/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to perform ${action}`);
  }

  const data = await response.json();
  return data?.data?.session;
}

export async function startSession(requestId: string): Promise<BackendSession> {
  return postSessionAction(requestId, 'start');
}

export async function pauseSessionRequest(requestId: string): Promise<BackendSession> {
  return postSessionAction(requestId, 'pause-request');
}

export async function pauseSessionConfirm(requestId: string): Promise<BackendSession> {
  return postSessionAction(requestId, 'pause-confirm');
}

export async function resumeSessionRequest(requestId: string): Promise<BackendSession> {
  return postSessionAction(requestId, 'resume-request');
}

export async function resumeSessionConfirm(requestId: string): Promise<BackendSession> {
  return postSessionAction(requestId, 'resume-confirm');
}

export async function endSession(requestId: string): Promise<BackendSession> {
  return postSessionAction(requestId, 'end');
}

export async function fetchActiveSession(): Promise<BackendSession | null> {
  const token = await getToken();
  if (!token) return null;

  const baseUrl = getBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/users/active-session`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data?.data?.session || null;
  } catch (error) {
    console.log('Error fetching active session:', error);
    return null;
  }
}


