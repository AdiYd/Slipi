/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

interface Training {
  id: string;
  completed: boolean;
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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
  logout: () => void;
}

export const exampleUser = {
  id: '1234',
  fullName: 'ישראל ישראלי',
  email: 'Israel@Israeli.co.il',
  phone: '0541234567',
  trainings: [{
    id: '1',
    completed: true,
    chatSession: [{
     role: 'user',
     content: 'Hello',
     timestamp: '2021-01-01T00:00:00.000Z'
    },
    {
      role: 'assistant',
      content: 'Whats up?',
      timestamp: '2021-01-01T00:00:00.000Z'
    },
    {
      role: 'user',
      content: 'I have a question',
      timestamp: '2021-01-01T00:00:00.000Z'
    },
    {
      role: 'assistant',
      content: 'I can help you with that',
      timestamp: '2021-01-01T00:00:00.000Z'
    }
  ]},
  {
    id: '2',
    completed: true,
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
    completed: false,
    chatSession: []
  }
]
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (import.meta.env.VITE_NODE_ENV === 'development') {
      login('', '');
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
      setLoading(true);
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      setUser(user);
      message.success('התחברת בהצלחה!');
      return;
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === 'development') {
        localStorage.setItem('authToken', 'demo');
        setUser(exampleUser);
        message.success('התחברת בהצלחה!');
        navigate('/dashboard');
        return;
      }
      throw new Error('התחברות נכשלה');
    } finally {
      setLoading(false);
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