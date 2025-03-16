import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Typography } from 'antd';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
import { Icon } from '@iconify/react/dist/iconify.js';
import '../../index.css';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Title from 'antd/es/typography/Title';
import { useMediaQuery } from 'react-responsive';
const { Sider } = Layout;
const { Text } = Typography;


interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(true);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  // Add animation controls for the header
  const headerControls = useAnimation();
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollThreshold = 50; // Adjust this value as needed

  // Add scroll handler effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
        // Scrolling down past threshold - slide header out
        headerControls.start({
          y: -100,
          opacity: 1,
          transition: { duration: 0.3, ease: "easeInOut" }
        });
      } else if (currentScrollY < lastScrollY || currentScrollY <= scrollThreshold) {
        // Scrolling up or within threshold - slide header in
        headerControls.start({
          y: 0,
          opacity: 1,
          transition: { duration: 0.3, ease: "easeInOut" }
        });
      }
      
      setLastScrollY(currentScrollY);
    };
    
    // Add passive event listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, headerControls]);

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
      <div className="fixed top-[-130px] right-[-210px] overflow-hidden w-[40vw] max-sm:w-[50vw] h-[40vh] max-sm:h-2/3 rounded-full bg-gradient-to-r filter from-teal-500/40  to-amber-400/20 blur-[200px] z-0"/>
      <div className="fixed bottom-[-130px] left-[-210px] overflow-hidden w-[40vw] max-sm:w-[50vw] h-[40vh] max-sm:h-2/3 rounded-full bg-gradient-to-r filter from-red-500/40  to-amber-400/20 blur-[200px] z-0"/>

      <Sider
        width={200}
        theme={theme}
        className={`card* bg-white/90 dark:bg-neutral-900/90 rounded-lg my-4 shadow-none border-none fixed h-[fill-available] backdrop-blur-lg
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
            <div className="h-16 mt-4 flex items-center justify-between px-4">        
              {/* <div 
              onClick={() => setCollapsed(!collapsed)}
              className="h-6 flex-1 bg-gray-200 cursor-pointer dark:bg-black rounded" /> */}

              {(!isMobile || (isMobile && !collapsed)) && (
                <Button
                  title={collapsed ? 'הצג תפריט' : 'הסתר תפריט'}
                  type="text"
                  icon={!collapsed ? 
                    <Icon icon='ic:outline-double-arrow' className='text-text-light dark:text-text-dark transition-transform duration-300 text-2xl' /> : 
                    <Icon icon='ic:outline-double-arrow' className='text-text-light rotate-180 transition-transform duration-300 dark:text-text-dark text-2xl' />
                  }
                  onClick={() => setCollapsed(!collapsed)}
                  className="text-text-light mx-auto dark:text-text-dark z-50 ml-2"
                />
              )}
              </div>
          
            <div className='flex flex-col items-center justify-center '>
              <Title level={5} className='w-full text-center' >תפריט</Title>
              {/* {!isMobile && !collapsed &&
               <span className='w-full text-base text-center my-2 self-center' >
                    שלום, {user?.fullName}
              </span>} */}
            </div>
            <Menu
              theme={theme}
              mode="vertical"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={handleMenuClick}
              className="card rounded-none shadow-none border-none justify-between flex flex-col mt-4 min-h-[250px] border-r-0 bg-transparent"
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

      <Layout className={`transition-all px-2 duration-300 ${
        !isMobile ? (collapsed ? 'mr-[80px]' : 'mr-[200px]') : 'mr-0'
      }`}>
       {!id && !isMobile &&
        <motion.header
          initial={{ y: 0, opacity: 1 }}
          animate={headerControls}
          className={`p-0 flex w-[fill-available] mt-4 ml-2 backdrop-blur-xl fixed z-40 min-h-[60px] flex-row-reverse justify-between items-center align-middle bg-white/85 dark:bg-neutral-900/90 px-6 max-sm:px-2 rounded-lg`}
        >
          <div className='relative -top-1'>
            <Logo />
          </div>
          <Text  style={{fontSize: '0.8rem'}} className='w-full font-semibold !mb-0 self-center' >
            שלום, {user?.fullName}
          </Text>
          <Avatar 
          onClick={() => navigate('/profile')}  
          size={27} className='bg-primary-light cursor-pointer ml-3 min-w-7 min-h-7 dark:bg-primary-dark' icon={<UserOutlined />} />
          {isMobile && (            
            <Button
              type="text"
              icon={<MenuOutlined className='px-2' />}
              onClick={() => setCollapsed(!collapsed)}
              className="relative self-center ml-2 bg-background-light dark:bg-background-dark z-50 text-text-light dark:text-text-dark"
            />
          )}
        </motion.header>}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`my-4 relative ${(id && !isMobile) ? '' : 'mt-[84px]'} overflow-y-auto p-6 max-sm:p-2 min-h-[280px] bg-white/40 backdrop-blur-xl shadow-none border-none rounded-lg dark:bg-gray-950/40`}
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
