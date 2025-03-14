import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../index.css';
import ThemeToggle from '../components/ThemeToggle';
import Header from '../components/layouts/Logo';
import Logo from '../components/layouts/Logo';


const { Title } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: LoginForm) => {
    try {
      await login(values.email, values.password);
      message.success('התחברת בהצלחה!');
      navigate('/dashboard');
    } catch {
      message.error('שגיאה בהתחברות');
    }
  };

  return (
    <div>
    <div className="min-h-screen flex flex-col justify-center  items-center bg-background-light dark:bg-background-dark">
      <ThemeToggle />
    <div className="fixed top-[-130px] right-[-210px] overflow-hidden w-[40vw] max-sm:w-[50vw] h-[40vh] max-sm:h-2/3 rounded-full bg-gradient-to-r filter from-teal-500/60  to-orange-300/40 blur-[200px] z-0"/>
    <div className="fixed bottom-[-130px] left-[-210px] overflow-hidden w-[40vw] max-sm:w-[50vw] h-[40vh] max-sm:h-2/3 rounded-full bg-gradient-to-r filter from-orange-500/60  to-blue-600/40 blur-[200px] z-0"/>
      
      <Card className="w-[500px] card backdrop-blur-lg p-4 bg-gradient-to-r bg-from-neutral-200/50 dark:bg-from-neutral-900/50 bg-to-transparent">
        <Logo />
        <h2 className="text-2xl font-bold text-center text-text-light dark:text-text-dark mb-8">
          התחברות לאיזור אישי
        </h2>
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          className="w-full"
        >
          <Form.Item
            name="email"
            
            rules={[
              { required: true, message: 'נא להזין כתובת אימייל' },
              // { type: 'email', message: 'כתובת אימייל לא תקינה' }
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-text-light dark:text-text-dark" />}
              placeholder="כתובת אימייל"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'נא להזין סיסמה' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-text-light dark:text-text-dark" />}
              placeholder="סיסמה"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              className="bg-primary-light hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-300"
            >
              התחבר
            </Button>
          </Form.Item>

          <div className="text-center text-text-light dark:text-text-dark">
            אין לך חשבון?{' '}
            <Link to="/signup" className="text-primary-light dark:text-primary-dark hover:underline">
              הרשם עכשיו
            </Link>
          </div>
        </Form>
      </Card>
    </div>
    </div>
  );
};

export default Login; 