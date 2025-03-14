import React from 'react';
import { Card } from 'antd';
import DashboardLayout from '../components/layouts/DashboardLayout';
import ChatComponent from '../components/Chat';

const ChatPage: React.FC = () => {
  return (
    <DashboardLayout>
      <Card style={{ height: 'calc(100vh - 200px)' }}>
        <ChatComponent />
      </Card>
    </DashboardLayout>
  );
};

export default ChatPage; 