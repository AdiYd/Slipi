import React from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layouts/DashboardLayout';
import axios from 'axios';

const { Title } = Typography;

interface ProfileForm {
  fullName: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
      });
    }
  }, [user, form]);

  const onFinish = async (values: ProfileForm) => {
    if (values.newPassword && values.newPassword !== values.confirmPassword) {
      message.error('הסיסמאות החדשות אינן תואמות');
      return;
    }

    try {
      const response = await axios.put(`api/users/${user?.id}`, values);
      console.log(response.data);
      if (response.status === 200) {
        message.success('הפרופיל עודכן בהצלחה');
      } else {
        message.error('שגיאה בעדכון הפרופיל');
      }
    } catch (error) {
      console.error('שגיאה בעדכון הפרופיל', error);
    }
  };

  return (
    <DashboardLayout>
      <Card className="bg-card-light dark:bg-card-dark shadow-card dark:shadow-card-dark">
        <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-6">
          פרופיל משתמש
        </h2>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
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
              prefix={<MailOutlined className="text-text-light dark:text-text-dark" />}
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

          <h4 className="text-xl font-semibold text-text-light dark:text-text-dark mt-6 mb-4">
            שינוי סיסמה
          </h4>

          <Form.Item
            name="currentPassword"
            rules={[{ required: true, message: 'נא להזין את הסיסמה הנוכחית' }]}
          >
            <Input.Password
              placeholder="סיסמה נוכחית"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            rules={[
              { required: true, message: 'נא להזין סיסמה חדשה' },
              { min: 6, message: 'הסיסמה חייבת להכיל לפחות 6 תווים' }
            ]}
          >
            <Input.Password
              placeholder="סיסמה חדשה"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            rules={[
              { required: true, message: 'נא לאשר את הסיסמה החדשה' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('הסיסמאות אינן תואמות'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="אימות סיסמה חדשה"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              className="bg-primary-light hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary-light transition-colors duration-300"
            >
              שמור שינויים
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
};

export default Profile; 