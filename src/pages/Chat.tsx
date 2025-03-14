import React, { useState } from 'react';
import { Card, Empty, Typography, Space, Button, Badge, Input } from 'antd';
import { MessageOutlined, SendOutlined } from '@ant-design/icons';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { useTraining } from '../contexts/TrainingContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { exampleTrainings } from './Dashboard';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const ChatPage: React.FC = () => {
  const { trainings } = useTraining();
  const { user } = useAuth();
  const [activeTrainingId, setActiveTrainingId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Get all trainings with chat history
  const trainingsWithChats = (trainings || exampleTrainings)
    .filter(training => 
      user?.trainings.find(ut => ut.id === training.id && ut.chatSession?.length > 0)
    );

  // Get chat history for active training
  const currentChatHistory = user?.trainings
    .find(t => t.id === activeTrainingId)
    ?.chatSession || [];

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeTrainingId) return;
    
    // Here you would typically make an API call to your chatbot service
    // For now, we'll just add the message to the UI
    const newUserMessage = {
      role: 'user' as const,
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    // Simulate bot response
    const botResponse = {
      role: 'assistant' as const,
      content: 'תודה על ההודעה! אני אשמח לעזור לך. האם תוכל/י לפרט יותר?',
      timestamp: new Date().toISOString()
    };

    // Update chat history (in a real app, this would be handled by your backend)
    // For now, we're just simulating the update
    setNewMessage('');
  };

  return (
    <DashboardLayout>
      {/* Make the container responsive */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] gap-4">
        {/* Sidebar - full width on mobile, fixed width on desktop */}
        <motion.div 
          className="w-full lg:w-80 bg-white dark:bg-gray-800 rounded-lg p-4 overflow-y-auto"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Title level={4} className="mb-4">היסטוריית שיחות</Title>
          
          <div className="space-y-2">
            {trainingsWithChats.length > 0 ? (
              trainingsWithChats.map(training => {
                const chatCount = user?.trainings
                  .find(t => t.id === training.id)
                  ?.chatSession?.length || 0;
                
                return (
                  <motion.div
                    key={training.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type={activeTrainingId === training.id ? 'primary' : 'default'}
                      block
                      onClick={() => setActiveTrainingId(training.id)}
                      className="text-right h-auto py-2 flex items-center justify-between"
                    >
                      <div className="flex flex-col items-start overflow-hidden">
                        <Text strong className="truncate w-full">
                          {training.title}
                        </Text>
                        <Text type="secondary" className="text-sm truncate w-full">
                          {training.subtitle}
                        </Text>
                      </div>
                      <Badge count={chatCount} className="ml-2 flex-shrink-0" />
                    </Button>
                  </motion.div>
                );
              })
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="אין היסטוריית שיחות"
              />
            )}
          </div>
        </motion.div>

        {/* Main chat area - full width on mobile */}
        <Card className="flex-1 flex flex-col min-h-[500px] lg:min-h-0">
          <AnimatePresence mode="wait">
            {activeTrainingId ? (
              <motion.div
                key={activeTrainingId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col"
              >
                {/* Chat Header */}
                <div className="mb-4">
                  <Title level={4} className="text-lg lg:text-xl truncate">
                    {trainingsWithChats.find(t => t.id === activeTrainingId)?.title}
                  </Title>
                  <Text type="secondary" className="text-sm truncate">
                    {trainingsWithChats.find(t => t.id === activeTrainingId)?.subtitle}
                  </Text>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4">
                  {currentChatHistory.length > 0 ? (
                    currentChatHistory.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`inline-block p-3 max-w-[80%] rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-primary-light dark:bg-primary-dark text-white rounded-tr-none'
                              : 'bg-gray-100 dark:bg-gray-700 rounded-tl-none'
                          }`}
                        >
                          <div className="whitespace-pre-wrap break-words">
                            {message.content}
                          </div>
                          <Text 
                            className={`text-xs mt-1 block ${
                              message.role === 'user' 
                                ? 'text-white/80' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString('he-IL')}
                          </Text>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      אין הודעות עדיין. שלח/י הודעה להתחיל שיחה
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="mt-auto p-4 border-t dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <TextArea
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="כתוב/י הודעה..."
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      className="flex-1"
                      onPressEnter={e => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined rotate={180} />}
                      onClick={handleSendMessage}
                      className="flex-shrink-0 flex items-center justify-center"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center"
              >
                <Empty
                  image={<MessageOutlined style={{ fontSize: 48 }} />}
                  description="בחר הדרכה כדי לצפות בהיסטוריית השיחות"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ChatPage; 