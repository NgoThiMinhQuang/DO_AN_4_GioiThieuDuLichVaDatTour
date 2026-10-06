import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token');
    } catch (_) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  function persist(nextToken, nextUser) {
    if (nextToken) localStorage.setItem('token', nextToken);
    else localStorage.removeItem('token');
    if (nextUser) localStorage.setItem('user', JSON.stringify(nextUser));
    else localStorage.removeItem('user');
    setToken(nextToken || null);
    setUser(nextUser || null);
  }

  async function fetchMe() {
    try {
      const res = await api.get('/auth/me');
      const merged = { ...(user || {}), ...res.data };
      localStorage.setItem('user', JSON.stringify(merged));
      setUser(merged);
      return merged;
    } catch (_) {
      return null;
    }
  }

  useEffect(() => {
    if (token && !user?.role) {
      fetchMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(identifier, password) {
    const res = await api.post('/auth/login', { identifier, password });
    persist(res.data.token, res.data.user);
    return res.data;
  }

  async function register({ full_name, email, phone, password }) {
    await api.post('/auth/register', { full_name, email, phone, password });
    // Auto login after register
    const loginId = email || phone;
    const res = await api.post('/auth/login', { identifier: loginId, password });
    persist(res.data.token, res.data.user);
    return res.data;
  }

  function logout() {
    persist(null, null);
  }

  const role = user?.role || null;
  const value = {
    user,
    token,
    loading,
    setLoading,
    role,
    isCustomer: role === 'CUSTOMER',
    isStaff: role === 'STAFF' || role === 'ADMIN',
    isAdmin: role === 'ADMIN',
    login,
    register,
    logout,
    fetchMe
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
