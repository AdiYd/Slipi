import React, { useState } from 'react';
import { Form, Input, Button, message, Avatar, Typography } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { Icon } from '@iconify/react';
import axios from 'axios';



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
  const [isOpen, setIsOpen] = useState(false);
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
      <div className=" my-8 px-6 max-sm:px-4">
        <div className='flex flex-row gap-4 mb-8 items-baseline justify-start'>
          <Avatar
          size={40}
          icon={<UserOutlined />}
          className='bg-primary-light dark:bg-primary-dark'
          />
          <h2 className="text-2xl font-bold text-text-light dark:text-text-dark ">
            פרופיל משתמש
          </h2>
        </div>
       

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="w-full"
          requiredMark={false}
        >
          
          <Form.Item
            name="fullName"
            label={<span className="text-sm">שם מלא</span>}
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
            label={<span className="text-sm">דואר אלקטרוני</span>}
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
            label={<span className="text-sm">מספר טלפון</span>}
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

          <div onClick={() => setIsOpen(!isOpen)} className='flex flex-row gap-2 cursor-pointer items-center hover:opacity-80 justify-start'>
            <Typography.Text  type="secondary" className="text-lg my-6">
              שינוי סיסמה 
            </Typography.Text>
           <Icon icon="ri:arrow-down-s-line"  className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </div>

          {isOpen && (
            <>
              <Form.Item
                name="currentPassword"
                className='mt-4'
                label={<span className="text-sm">סיסמה נוכחית</span>}
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
                label={<span className="text-sm">סיסמה חדשה</span>}
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
                label={<span className="text-sm">אימות סיסמה חדשה</span>}
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
          </>
          )}
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default Profile; 