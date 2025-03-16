/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


interface TrainingUser {
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
  trainings: TrainingUser[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User| null) => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => { 
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      } 
      const response = await axios.post('/api/auth/validate', { token });
      if (response.status === 200 && response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === 'development') {
        // In development, use example user
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUser(exampleUser);
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (import.meta.env.VITE_NODE_ENV === 'development') {
        // In development, use example user
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUser(exampleUser);
        localStorage.setItem('authToken', 'demo-token');
        navigate('/dashboard');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: Omit<User, 'id'> & { password: string }) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/signup', userData);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      setError('Signup failed. Please try again.');
    }
  };

  const updateUser = async (userData: User | null) => {
    try {
      setError(null);
      if (import.meta.env.VITE_NODE_ENV === 'development') {
        // In development, simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('userData', userData);
        setUser(userData);
      } else {
        const response = await axios.post('/api/auth/update', userData);
        if (response.status === 200 && response.data.user) {
          setUser(response.data.user);
        }
      }
    } catch (error) {
      console.error('User update failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
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