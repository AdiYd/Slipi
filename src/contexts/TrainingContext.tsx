import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Training {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  imageUrl: string;
  videoUrl: string;
  fileUrl: string;
}

interface TrainingContextType {
  trainings: Training[];
  loading: boolean;
  error: string | null;
  fetchTrainings: () => Promise<void>;
  getTrainingById: (id: string) => Training | undefined;
}

export const exampleTrainings: Training[] = [
  {
    id: '1',
    title: 'ברוכים הבאים ל-Slipi',
    subtitle: 'מבוא לשינה איכותית',
    description: 'הכרת החברה, הערכים שלנו והחזון - כל מה שהופך אותנו למובילים בתחום השינה האיכותית.',
    duration: 30,
    difficulty: 'beginner',
    category: 'מבוא',
    imageUrl: 'https://picsum.photos/seed/welcome/500',
    videoUrl: 'https://www.slipi.co.il/wp-content/uploads/2024/03/ברוכים-הבאים-ל-Slipi.mp4',
    fileUrl: `${import.meta.env.VITE_BASE_URL}/assets/trainings/A.docx`
  },
  {
    id: '2',
    title: 'עולם השינה האיכותית',
    subtitle: 'מבוא לשינה איכותית',
    description: 'למידה מעמיקה על שלבי השינה, חשיבות המזרן המתאים, וכיצד שינה איכותית משפיעה על הבריאות.',
    duration: 45,
    difficulty: 'beginner',
    category: 'ידע מקצועי',
    imageUrl: 'https://picsum.photos/seed/sleep/500',
    videoUrl: 'https://www.slipi.co.il/wp-content/uploads/2024/03/עולם-השינה-האיכותית.mp4',
    fileUrl: `${import.meta.env.VITE_BASE_URL}/assets/trainings/B.docx`
  },
  {
    id: '3',
    title: 'הכרת מוצרי החברה',
    subtitle: 'מבוא לשינה איכותית',
    description: 'סקירה מקיפה של קולקציית המוצרים שלנו: מזרנים, מיטות מתכווננות, כריות ואביזרי שינה.',
    duration: 60,
    difficulty: 'intermediate',
    category: 'מוצרים',
    imageUrl: 'https://picsum.photos/seed/products/500',
    videoUrl: 'https://www.slipi.co.il/wp-content/uploads/2024/03/הכרת-מוצרי-החברה.mp4',
    fileUrl: `${import.meta.env.VITE_BASE_URL}/assets/trainings/C.docx`
  },
  {
    id: '4',
    title: 'אמנות המכירה והשירות',
    subtitle: 'מבוא לשינה איכותית',
    description: 'טכניקות מתקדמות לזיהוי צרכי לקוח, בניית אמון והתאמת פתרון מושלם.',
    duration: 75,
    difficulty: 'intermediate',
    category: 'מכירות',
    imageUrl: 'https://picsum.photos/seed/sales/500',
    videoUrl: 'https://www.slipi.co.il/wp-content/uploads/2024/03/אמנות-המכירה-והשירות.mp4',
    fileUrl: `${import.meta.env.VITE_BASE_URL}/assets/trainings/D.docx`
  },
  {
    id: '5',
    title: 'פתרונות מותאמים אישית',
    subtitle: 'מבוא לשינה איכותית',
    description: 'כיצד להתאים פתרון שינה מושלם לכל לקוח: ניתוח צרכים, התמודדות עם אתגרי שינה ובחירת המוצר המתאים.',
    duration: 90,
    difficulty: 'advanced',
    category: 'טכנולוגיה ומערכות',
    imageUrl: 'https://picsum.photos/seed/solutions/500',
    videoUrl: 'https://www.slipi.co.il/wp-content/uploads/2024/03/פתרונות-מותאמים-אישית.mp4',
    fileUrl: `${import.meta.env.VITE_BASE_URL}/assets/trainings/E.docx`
  },
  {
    id: '6',
    title: 'מצוינות בשירות',
    subtitle: 'מבוא לשינה איכותית',
    description: 'שירות לקוחות ברמה הגבוהה ביותר: טיפול במקרים מיוחדים, שירות לאחר מכירה ובניית נאמנות לקוחות.',
    duration: 60,
    difficulty: 'advanced',
    category: 'שירות לקוחות',
    imageUrl: 'https://picsum.photos/seed/service/500',
    videoUrl: 'https://www.slipi.co.il/wp-content/uploads/2024/03/מצוינות-בשירות.mp4',
    fileUrl: `${import.meta.env.VITE_BASE_URL}/assets/trainings/F.docx`
  }
];


const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
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
      if (response.data.trainings) {
        setTrainings(response.data.trainings);
      } else {
        throw new Error('שגיאה בטעינת ההדרכות');
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTrainings(exampleTrainings);
      } else {
        setError('שגיאה בטעינת ההדרכות');
        console.error('Failed to fetch trainings:', error);
      }
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