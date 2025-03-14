import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, List, Avatar, Typography } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import { useChat } from '../contexts/ChatContext';

const { TextArea } = Input;
const { Text } = Typography;

interface ChatComponentProps {
  trainingId?: string;
  initialMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ 
}) => {
  const [message, setMessage] = useState('');
  const { messages, loading, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage(message);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark">
      <div className="flex-1 overflow-auto p-4">
        <List
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item className={`justify-${msg.sender === 'user' ? 'end' : 'start'} py-2`}>
              <div className={`max-w-[70%] flex ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
                <Avatar 
                  icon={msg.sender === 'user' ? <UserOutlined /> : <RobotOutlined />} 
                  className={`${msg.sender === 'user' ? 'bg-primary-light' : 'bg-secondary-light'} dark:${msg.sender === 'user' ? 'bg-primary-dark' : 'bg-secondary-dark'}`}
                />
                <div className={`p-3 rounded-lg ${
                  msg.sender === 'user' 
                    ? 'bg-primary-light dark:bg-primary-dark text-white' 
                    : 'bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark'
                }`}>
                  <Text className={msg.sender === 'user' ? 'text-white' : 'text-text-light dark:text-text-dark'}>
                    {msg.content}
                  </Text>
                </div>
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-border-light dark:border-border-dark">
        <div className="flex gap-2">
          <TextArea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="הקלד הודעה..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="flex-1 rounded-md bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark border-border-light dark:border-border-dark"
          />
          <Button
            type="primary"
            icon={<SendOutlined rotate={180} />}
            onClick={handleSend}
            loading={loading}
            className="bg-primary-light hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-300"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatComponent; 