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
  MenuOutlined,
} from '@ant-design/icons';
import ThemeToggle from '../ThemeToggle';
import Logo from './Logo';
import Title from 'antd/lib/typography/Title';
import { Icon } from '@iconify/react/dist/iconify.js';
import '../../index.css';
import { motion, AnimatePresence } from 'framer-motion';

const { Header, Sider, Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 769);
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
      <div className="fixed top-[-130px] right-[-210px] overflow-hidden w-[40vw] max-sm:w-[50vw] h-[40vh] max-sm:h-2/3 rounded-full bg-gradient-to-r filter from-teal-500/60  to-amber-400/40 blur-[200px] z-0"/>
      <div className="fixed bottom-[-130px] left-[-210px] overflow-hidden w-[40vw] max-sm:w-[50vw] h-[40vh] max-sm:h-2/3 rounded-full bg-gradient-to-r filter from-red-500/60  to-amber-400/40 blur-[200px] z-0"/>

      <Sider
        width={200}
        theme={theme}
        className={`card rounded-none shadow-none border-none fixed h-screen
          ${isMobile ? 'z-50' : 'z-40'} 
          ${isMobile ? (collapsed ? '-right-[200px]' : 'right-0') : 'right-0'}
          transition-all duration-300`}
        collapsible
        collapsed={!isMobile && collapsed}
        onCollapse={!isMobile ? setCollapsed : undefined}
        trigger={null}
      >
        <motion.div
          initial={false}
          animate={{ 
            x: isMobile ? (collapsed ? 200 : 0) : (collapsed ? 0 : 0)
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-full flex flex-col"
        >
          <div className="flex-1">
            <div className="h-16 flex items-center justify-between px-4">
              <div className="h-8 flex-1 bg-transparent dark:bg-black/20 rounded" />
              {(!isMobile || (isMobile && !collapsed)) && (
                <Button
                  title={collapsed ? 'הצג תפריט' : 'הסתר תפריט'}
                  type="text"
                  icon={!collapsed ? 
                    <Icon icon='ic:outline-double-arrow' className='text-text-light dark:text-text-dark transition-transform duration-300 text-2xl' /> : 
                    <Icon icon='ic:outline-double-arrow' className='text-text-light rotate-180 transition-transform duration-300 dark:text-text-dark text-2xl' />
                  }
                  onClick={() => setCollapsed(!collapsed)}
                  className="text-text-light dark:text-text-dark z-50 ml-2"
                />
              )}
            </div>
            <Menu
              theme={theme}
              mode="vertical"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={handleMenuClick}
              className="card rounded-none shadow-none border-none min-h-[250px] border-r-0 bg-transparent"
              style={{ background: 'transparent' }}
            />
          </div>
          <div className="mt-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button 
                title='התנתק'
                type="text" 
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
                className="text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark"
              >
                {!collapsed && 'התנתק'}
              </Button>
            </div>
            <div className="p-4 border-t flex justify-center border-border-light dark:border-border-dark">
              <ThemeToggle showCurrentTheme={collapsed} />
            </div>
          </div>
        </motion.div>
      </Sider>

      <Layout className={`transition-all duration-300 ${
        !isMobile ? (collapsed ? 'mr-[80px]' : 'mr-[200px]') : 'mr-0'
      }`}>
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`p-0 flex z-40 min-h-[60px] flex-row-reverse justify-between items-center align-middle card px-6 rounded-none shadow-none border-none`}
        >
          <Logo />
          <Title level={5} className='w-full !mb-0 self-center' >
            שלום, {user?.fullName}
          </Title>
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="relative self-center ml-4 bg-background-light dark:bg-background-dark z-50 text-text-light dark:text-text-dark"
            />
          )}
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="m-2 p-6 min-h-[280px] card* bg-white/50 backdrop-blur-xl shadow-none border-none rounded-lg dark:bg-zinc-950/50"
        >
          {children}
        </motion.div>
      </Layout>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobile && !collapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setCollapsed(true)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default DashboardLayout;
