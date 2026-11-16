import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cognevance_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('cognevance_token');
      const storedUser = localStorage.getItem('cognevance_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);

          // Verify token validity by calling /auth/me
          const response = await api.get('/auth/me');
          if (response.success && response.user) {
            setUser(response.user);
            localStorage.setItem('cognevance_user', JSON.stringify(response.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.success && response.token) {
        localStorage.setItem('cognevance_token', response.token);
        localStorage.setItem('cognevance_user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        return { success: true, user: response.user };
      }
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      const message = err.data?.message || err.message || 'Login failed. Please check credentials.';
      setError(message);
      return { success: false, message };
    }
  };

  // Register handler
  const register = async (userData) => {
    setError(null);
    try {
      const response = await api.post('/auth/register', userData);
      if (response.success && response.token) {
        localStorage.setItem('cognevance_token', response.token);
        localStorage.setItem('cognevance_user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        return { success: true, user: response.user };
      }
      throw new Error(response.message || 'Registration failed');
    } catch (err) {
      const message = err.data?.message || err.message || 'Registration failed.';
      setError(message);
      return { success: false, message };
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('cognevance_user', JSON.stringify(response.user));
        return { success: true, user: response.user, message: response.message };
      }
      throw new Error(response.message || 'Profile update failed');
    } catch (err) {
      return {
        success: false,
        message: err.data?.message || err.message || 'Profile update failed',
      };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('cognevance_token');
    localStorage.removeItem('cognevance_user');
    setUser(null);
    setToken(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        loading,
        error,
        login,
        register,
        updateProfile,
        logout,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
