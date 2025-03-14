import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Training {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  imageUrl: string;
  videoUrl: string;
  createdAt: string;
}

interface TrainingContextType {
  trainings: Training[];
  loading: boolean;
  error: string | null;
  fetchTrainings: () => Promise<void>;
  getTrainingById: (id: string) => Training | undefined;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTrainings();
    }
  }, [user]);

  const fetchTrainings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/trainings');
      setTrainings(response.data.trainings);
    } catch (error) {
      setError('שגיאה בטעינת האימונים');
      console.error('Failed to fetch trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrainingById = (id: string) => {
    return trainings.find(training => training.id === id);
  };

  return (
    <TrainingContext.Provider value={{ trainings, loading, error, fetchTrainings, getTrainingById }}>
      {children}
    </TrainingContext.Provider>
  );
};

export const useTraining = () => {
  const context = useContext(TrainingContext);
  if (context === undefined) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
}; 