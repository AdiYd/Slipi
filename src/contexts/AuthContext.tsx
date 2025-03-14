/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

interface Training {
  id: string;
  finished: boolean;
  chatSession: ChatMessage[];
}

interface ChatMessage {
  role: string;
  content: string;
  timestamp: string;
}



interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  trainings: Training[];
  chatSession: ChatMessage[];
  finished: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const demoUser = {
  id: 'demo',
  fullName: 'ישראל ישראלי',
  email: 'Israel@Israeli.co.il',
  phone: '0541234567',
  trainings: [{
    id: '1',
    finished: true,
    chatSession: [{
     role: 'user',
     content: 'Hello',
     timestamp: '2021-01-01T00:00:00.000Z'
    },
    {
      role: 'assistant',
      content: 'Hello',
      timestamp: '2021-01-01T00:00:00.000Z'
    },
    {
      role: 'user',
      content: 'Hello',
      timestamp: '2021-01-01T00:00:00.000Z'
    },
    {
      role: 'assistant',
      content: 'Hello',
      timestamp: '2021-01-01T00:00:00.000Z'
    }
  ]},
  {
    id: '2',
    finished: true,
    chatSession: [
      {
        role: 'user',
        content: 'Hello',
        timestamp: '2021-01-01T00:00:00.000Z'
      },
      {
        role: 'assistant',
        content: 'Whats your name?',
        timestamp: '2021-01-01T00:00:00.000Z'
      },
      {
        role: 'user',
        content: 'My name is John Doe',
        timestamp: '2021-01-01T00:00:00.000Z'
      },
      {
        role: 'assistant',
        content: 'Nice to meet you John Doe',
        timestamp: '2021-01-01T00:00:00.000Z'
      }
    ]
  },
  {
    id: '3',
    finished: false,
    chatSession: []
  }
]
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (import.meta.env.VITE_NODE_ENV === 'development') {
      login('demo', '');
      setLoading(false);
      return;
    }
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await axios.post('/api/auth/validate', { token });
      if (response.status === 200) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('authToken');
      }
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
      if (email === 'demo') {
        localStorage.setItem('authToken', 'demo');
        setUser(demoUser);
        message.success('התחברת בהצלחה!');
        navigate('/dashboard');
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