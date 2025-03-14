import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography } from 'antd';
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
  MenuOutlined,
} from '@ant-design/icons';
import ThemeToggle from '../ThemeToggle';
import Logo from './Logo';
import Title from 'antd/lib/typography/Title';
import { Icon } from '@iconify/react/dist/iconify.js';

const { Header, Sider, Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'דף הבית',
    },
    {
      key: '/trainings',
      icon: <ReadOutlined />,
      label: 'הדרכות',
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
    if (isMobile) {
      setCollapsed(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout className="min-h-screen z-10">
      <Sider
        width={200}
        theme={theme}
        className={`${isMobile ? 'fixed transition-all duration-300 z-40' : 'fixed'} 
          overflow-auto h-screen ${isMobile ? (collapsed ? '-right-[200px]' : 'right-0') : 'right-0'} 
          top-0 bottom-0 flex flex-col justify-between `}
        collapsible
        collapsed={!isMobile && collapsed}
        onCollapse={!isMobile ? setCollapsed : undefined}
        trigger={null}
      >
        <div>
          <div className="h-16 flex items-center justify-between px-4">
            <div className="h-8 flex-1 bg-white/20 dark:bg-black/20 rounded" />
            <Button
              title={collapsed ? 'הצג תפריט' : 'הסתר תפריט'}
              type="text"
              icon={!collapsed ? <Icon icon='ic:outline-double-arrow' className='text-text-light dark:text-text-dark transition-transform duration-300 text-2xl' /> : <Icon icon='ic:outline-double-arrow' className='text-text-light rotate-180 transition-transform duration-300 dark:text-text-dark text-2xl' />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-text-light dark:text-text-dark ml-2"
            />
          </div>
          <Menu
            theme={theme}
            mode="vertical"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            className="text-text-light flex flex-col justify-between dark:text-text-dark min-h-[250px] border-r-0"
          />
        </div>
        <div className="absolute bottom-20 left-0 right-0 flex items-center justify-center gap-4">
            <Button 
              title='התנתק'
              type="text" 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              className="text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark"
            >
              {collapsed ? '' : 'התנתק'}
            </Button>
          </div>
        <div className="p-4 absolute bottom-0 left-0 right-0 flex justify-center border-t border-border-light dark:border-border-dark">
          <ThemeToggle showCurrentTheme={collapsed} />
        </div>
      </Sider>
      <Layout className={`transition-all duration-300 ${
        !isMobile ? (collapsed ? 'mr-[80px]' : 'mr-[200px]') : 'mr-0'
      }`}>
        <Header
          className={`p-0 flex z-20 flex-row-reverse justify-between items-center px-6 ${
            theme === 'dark' ? 'bg-background-dark' : 'bg-background-light'
          }`}
        >
          <Logo />
          <Title level={5} className='w-full' >
            שלום, {user?.fullName}
          </Title>
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="fixed top-4 bg-background-light dark:bg-background-dark right-4 z-50 text-text-light dark:text-text-dark"
            />
          )}
        </Header>
        <Content className="m-2 p-6 min-h-[280px] bg-background-light dark:bg-background-dark rounded-lg">
          {children}
        </Content>
      </Layout>
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setCollapsed(true)}
        />
      )}
    </Layout>
  );
};

export default DashboardLayout;
