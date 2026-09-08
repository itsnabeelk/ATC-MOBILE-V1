import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config';

const TOKEN_KEY = 'user_token';
const USERNAME_KEY = 'user_name';
const ROLE_KEY = 'user_role';

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const saveAuthData = async (token, username, role) => {
  try {
    const finalRole = role || (username?.toLowerCase() === 'admin' ? 'admin' : 'user');
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [USERNAME_KEY, username || ''],
      [ROLE_KEY, finalRole]
    ]);
  } catch (e) {
    console.error('Failed to save auth data', e);
  }
};

export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USERNAME_KEY, ROLE_KEY]);
  } catch (e) {
    console.error('Failed to clear auth data', e);
  }
};

export const getStoredUser = async () => {
  try {
    const pairs = await AsyncStorage.multiGet([TOKEN_KEY, USERNAME_KEY, ROLE_KEY]);
    const map = Object.fromEntries(pairs);
    const username = map[USERNAME_KEY] || '';
    let role = map[ROLE_KEY];

    // If username is admin, guarantee admin role
    if (username.toLowerCase() === 'admin') {
      role = 'admin';
    }

    return {
      token: map[TOKEN_KEY],
      username: username,
      role: role || (username.toLowerCase() === 'admin' ? 'admin' : 'user')
    };
  } catch {
    return { token: null, username: '', role: 'user' };
  }
};

const getHeaders = async () => {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return headers;
};

export const login = async (username, password) => {
  const res = await fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }

  // The backend returns { token, username, role } directly at top-level
  const role = data.role || data.user?.role || (username.toLowerCase() === 'admin' ? 'admin' : 'user');
  const user = data.username || data.user?.username || username;

  await saveAuthData(data.token, user, role);
  return { ...data, username: user, role };
};

export const updateProfile = async (payload) => {
  const headers = await getHeaders();
  const res = await fetch(API_BASE + '/auth/profile', {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update profile');
  }
  if (payload.username) {
    await AsyncStorage.setItem(USERNAME_KEY, payload.username);
  }
  return data;
};

// Admin User Management APIs
export const getUsers = async () => {
  const headers = await getHeaders();
  const res = await fetch(API_BASE + '/auth/users', { headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch portal users');
  }
  return data;
};

// Auto-sync real database role for current logged in user
export const syncUserRoleFromDb = async () => {
  try {
    const user = await getStoredUser();
    if (!user || !user.token) return user;

    const users = await getUsers();
    if (Array.isArray(users)) {
      const dbUser = users.find((u) => (u.username || '').toLowerCase() === (user.username || '').toLowerCase());
      const actualRole = dbUser ? dbUser.role : (user.username.toLowerCase() === 'admin' ? 'admin' : 'user');
      await AsyncStorage.setItem(ROLE_KEY, actualRole);
      return { ...user, role: actualRole };
    }
  } catch (e) {
    // If user is not admin, getUsers() throws 403, so they are a standard user
  }
  return await getStoredUser();
};

export const registerUser = async (payload) => {
  const headers = await getHeaders();
  const res = await fetch(API_BASE + '/auth/register', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to register portal user');
  }
  return data;
};

export const updateUserStatus = async (id, status) => {
  const headers = await getHeaders();
  const res = await fetch(API_BASE + '/auth/users/' + id + '/status', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update user status');
  }
  return data;
};

export const resetUserPassword = async (id, password) => {
  const headers = await getHeaders();
  const res = await fetch(API_BASE + '/auth/users/' + id + '/password', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to reset password');
  }
  return data;
};

export const deleteUser = async (id) => {
  const headers = await getHeaders();
  const res = await fetch(API_BASE + '/auth/users/' + id, {
    method: 'DELETE',
    headers
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete user');
  }
  return data;
};

// Employees APIs
export const getEmployees = async () => {
  const headers = await getHeaders();
  const res = await fetch(API_BASE + '/employees', { headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch employees');
  }
  return data;
};

export const getEmployeeById = async (id) => {
  const res = await fetch(API_BASE + '/employees/' + id);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Employee not found');
  }
  return data;
};

export const updateEmployee = async (id, payload) => {
  const headers = await getHeaders();
  const res = await fetch(API_BASE + '/employees/' + id, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update employee details');
  }
  return data;
};

export const deleteEmployee = async (id) => {
  const headers = await getHeaders();
  const res = await fetch(API_BASE + '/employees/' + id, {
    method: 'DELETE',
    headers
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete employee');
  }
  return data;
};

export const getSettings = async () => {
  const res = await fetch(API_BASE + '/settings');
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch settings');
  }
  return data;
};
