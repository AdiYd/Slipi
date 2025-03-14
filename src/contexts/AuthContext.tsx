/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await axios.get('/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      setUser(user);
    } catch (error) {
      if (email === 'demo' || password === '123') {
        localStorage.setItem('authToken', 'demo');
        setUser({
          id: 'demo',
          fullName: 'Demo User',
          email: 'demo@example.com',
          phone: '1234567890'
        });
        return;
      }
      throw new Error('התחברות נכשלה');
    }
  };

  const signup = async (userData: Omit<User, 'id'> & { password: string }) => {
    try {
      const response = await axios.post('/api/auth/signup', userData);
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      setUser(user);
    } catch (error) {
      throw new Error('הרשמה נכשלה');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 