import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../index.css';
import ThemeToggle from '../components/ThemeToggle';

const { Title } = Typography;

interface SignupForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const onFinish = async (values: SignupForm) => {
    if (values.password !== values.confirmPassword) {
      message.error('הסיסמאות אינן תואמות');
      return;
    }

    try {
      await signup({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password
      });
      message.success('נרשמת בהצלחה!');
      navigate('/dashboard');
    } catch (error) {
      message.error('שגיאה בהרשמה');
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-background-light dark:bg-background-dark">
      <ThemeToggle />
      <Card className="w-[400px] card p-4">
        <h2 className="text-2xl font-bold text-center text-text-light dark:text-text-dark mb-8">
          הרשמה
        </h2>
        <Form
          name="signup"
          onFinish={onFinish}
          layout="vertical"
          className="w-full"
        >
          <Form.Item
            name="fullName"
            rules={[{ required: true, message: 'נא להזין שם מלא' }]}
          >
            <Input
              prefix={<UserOutlined className="text-text-light dark:text-text-dark" />}
              placeholder="שם מלא"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'נא להזין כתובת אימייל' },
              { type: 'email', message: 'כתובת אימייל לא תקינה' }
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
            name="phone"
            rules={[
              { required: true, message: 'נא להזין מספר טלפון' },
              { pattern: /^[0-9]{9,10}$/, message: 'מספר טלפון לא תקין' }
            ]}
          >
            <Input
              prefix={<PhoneOutlined className="text-text-light dark:text-text-dark" />}
              placeholder="מספר טלפון"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'נא להזין סיסמה' },
              { min: 6, message: 'הסיסמה חייבת להכיל לפחות 6 תווים' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-text-light dark:text-text-dark" />}
              placeholder="סיסמה"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            rules={[
              { required: true, message: 'נא לאשר את הסיסמה' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('הסיסמאות אינן תואמות'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-text-light dark:text-text-dark" />}
              placeholder="אימות סיסמה"
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
              הרשם
            </Button>
          </Form.Item>

          <div className="text-center text-text-light dark:text-text-dark">
            יש לך כבר חשבון?{' '}
            <Link to="/login" className="text-primary-light dark:text-primary-dark hover:underline">
              התחבר
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Signup; 