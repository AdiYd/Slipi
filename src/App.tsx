import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import heIL from 'antd/locale/he_IL';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChatProvider } from './contexts/ChatContext';
import { TrainingProvider } from './contexts/TrainingContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';
import Trainings from './pages/Trainings';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import { useTheme } from './contexts/ThemeContext';
import TrainingDetails from './pages/TrainingDetails';


const AppContent: React.FC = () => {
  const { theme: currentTheme } = useTheme();


  return (
    <ConfigProvider
      locale={heIL}
      direction="rtl"
      theme={{
        algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: currentTheme === 'dark' ? '#8299d6' : '#337ab7',
          colorBgContainer: currentTheme === 'dark' ? '#1a1a1a' : '#ffffff',
          colorText: currentTheme === 'dark' ? '#e2e8f0' : '#2d3748',
          colorBorder: currentTheme === 'dark' ? '#4a5568' : '#e2e8f0',
        },
        components: {
          Typography: {
            colorText: currentTheme === 'dark' ? '#e2e8f0' : '#2d3748',
            colorTextHeading: currentTheme === 'dark' ? '#e2e8f0' : '#2d3748',
          },
        },
      }}
    >
      <Router>
        <AuthProvider>
          <ChatProvider>
            <TrainingProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <PrivateRoute>
                      <Chat />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/trainings"
                  element={
                    <PrivateRoute>
                      <Trainings />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/trainings/:id"
                  element={
                    <PrivateRoute>
                      <TrainingDetails />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </TrainingProvider>
          </ChatProvider>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App; 