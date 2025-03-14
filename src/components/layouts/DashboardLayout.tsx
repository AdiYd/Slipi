import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  HomeOutlined,
  ReadOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  BulbOutlined,
  BulbFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'לוח בקרה',
    },
    {
      key: '/trainings',
      icon: <ReadOutlined />,
      label: 'מרכז למידה',
    },
    {
      key: '/chat',
      icon: <QuestionCircleOutlined />,
      label: 'שאלות ותמיכה',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'הפרופיל שלי',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        width={200}
        theme={theme}
        className="fixed overflow-auto h-screen right-0 top-0 bottom-0 flex flex-col justify-between"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
      >
        <div>
          <div className="h-16 flex items-center justify-between px-4">
            <div className="h-8 flex-1 bg-white/20 dark:bg-black/20 rounded" />
            <Button
              title={collapsed ? 'הצג תפריט' : 'הסתר תפריט'}
              type="text"
              icon={!collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-text-light dark:text-text-dark ml-2"
            />
          </div>
          <Menu
            theme={theme}
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            className="text-text-light dark:text-text-dark border-r-0"
          />
        </div>
        <div className="p-4 border-t border-border-light dark:border-border-dark">
          <Button
            type="text"
            icon={theme !== 'dark' ?   <SunOutlined />: <MoonOutlined />}
            onClick={toggleTheme}
            className="w-full text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark"
          >
            {!collapsed && (theme !== 'dark' ? 'תצוגה בהירה' : 'תצוגה כהה')}
          </Button>
        </div>
      </Sider>
      <Layout className={`transition-all duration-300 ${collapsed ? 'mr-[80px]' : 'mr-[200px]'}`}>
        <Header
          className={`p-0 flex justify-between items-center px-6 ${
            theme === 'dark' ? 'bg-background-dark' : 'bg-background-light'
          }`}
        >
          <div className="flex items-center gap-4">
            <Button 
              type="text" 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              className="text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark"
            >
              התנתק
            </Button>
          </div>
          <div className="text-text-light dark:text-text-dark">
            שלום, {user?.fullName}
          </div>
        </Header>
        <Content className="m-4 p-6 min-h-[280px] bg-background-light dark:bg-background-dark rounded-lg">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
