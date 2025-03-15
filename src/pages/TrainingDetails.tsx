import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, Typography, Input, Row, Col, Card, List, Avatar } from 'antd';
import { 
  ArrowRightOutlined, 
  SendOutlined, 
  WhatsAppOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  BookOutlined,
  StarOutlined,
  VideoCameraOutlined,
  QuestionCircleOutlined,
  LinkedinOutlined
} from '@ant-design/icons';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { exampleTrainings, useTraining } from '../contexts/TrainingContext';
import { motion } from 'framer-motion';
import DocxRenderer from '../components/DocxRenderer';
import '../index.css';

const { Title } = Typography;
const { TextArea } = Input;

// interface Training {
//   id: string;
//   title: string;
//   subtitle: string;
//   description: string;
//   duration: number;
//   difficulty: 'beginner' | 'intermediate' | 'advanced';
//   category: string;
//   imageUrl: string;
// }

const TrainingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trainings } = useTraining();
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);


  // Find the current training
  const training = (trainings || exampleTrainings)?.find(t => t.id === id) || null;

  if (!training) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <Title level={3}>ההדרכה לא נמצאה</Title>
          <Button type="primary" onClick={() => navigate('/trainings')}>
            חזרה להדרכות
            <ArrowRightOutlined />
          </Button>
        </div>
      </DashboardLayout>
    );
  }


  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    // Add user message
    setChatMessages(prev => [...prev, { text: chatMessage, isUser: true }]);

    // Here you would typically make an API call to your chatbot service
    // For now, we'll simulate a response
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        text: "תודה על השאלה! אני אשמח לעזור לך. האם תוכל/י לפרט יותר?",
        isUser: false
      }]);
    }, 1000);

    setChatMessage('');
  };

  return (
    <DashboardLayout>
      <motion.div 
        className="max-w-7xl mx-auto p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
   

        {/* Main Content */}
        <motion.div
        className="w-fit h-fit mx-auto my-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        >
            <DocxRenderer />
        </motion.div>

        {/* Chat Section */}
        <motion.div 
          className="card rounded-lg p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Title level={4} className="mb-4">שאלות ותשובות</Title>
          
          {/* Chat Messages */}
          <div className="max-h-[500px] chat-container min-h-24 overflow-y-auto border-[1px] px-4 py-8 border-gray-300 dark:border-gray-700 rounded-lg mb-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                אין הודעות עדיין. שאל/י שאלה להתחיל שיחה
              </div>
            ) : (
              chatMessages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: message.isUser ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-3 max-w-[80%] ${
                    message.isUser
                      ? 'bg-primary-light dark:bg-primary-dark ml-auto w-fit rounded-t-2xl rounded-l-2xl text-white'
                      : 'bg-gray-100 dark:bg-gray-700 mr-auto w-fit rounded-t-2xl rounded-r-2xl'
                  }`}
                >
                  {message.text}
                </motion.div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <div className="flex items-center gap-2">
            <TextArea
              size="large"
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              placeholder="שאל/י שאלה..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              className="rounded-lg align-middle"
              onPressEnter={e => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined rotate={180} />}
              onClick={handleSendMessage}
              className="rounded-lg flex items-center justify-center"
            />
          </div>
        </motion.div>

        {/* Related Trainings */}
        <motion.div 
          className="card rounded-lg p-6 shadow-sm my-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Title level={4} className="mb-4">הדרכות קשורות</Title>
          <Row gutter={[16, 16]}>
            {exampleTrainings
              .filter(t => t.category === training.category && t.id !== training.id)
              .slice(0, 2)
              .map(relatedTraining => (
                <Col key={relatedTraining.id} xs={24} md={12}>
                  <Card 
                    hoverable 
                    onClick={() => navigate(`/trainings/${relatedTraining.id}`)}
                    cover={
                      <img 
                        alt={relatedTraining.title} 
                        src={relatedTraining.imageUrl}
                        className="h-40 object-cover"
                      />
                    }
                  >
                    <Card.Meta
                      title={relatedTraining.title}
                      description={relatedTraining.subtitle}
                    />
                  </Card>
                </Col>
              ))}
          </Row>
        </motion.div>

        {/* Key Learning Points */}
        <motion.div 
          className="card rounded-lg p-6 shadow-sm my-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Title level={4} className="mb-4">נקודות מפתח בהדרכה</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card className="text-center">
                <BookOutlined className="text-3xl text-primary-light mb-2" />
                <Title level={5}>ידע מקצועי</Title>
                <p>העמקת הידע בתחום השינה האיכותית</p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="text-center">
                <StarOutlined className="text-3xl text-primary-light mb-2" />
                <Title level={5}>מיומנויות מעשיות</Title>
                <p>כלים פרקטיים ליישום מיידי</p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="text-center">
                <TeamOutlined className="text-3xl text-primary-light mb-2" />
                <Title level={5}>עבודת צוות</Title>
                <p>שיתוף פעולה והעברת ידע</p>
              </Card>
            </Col>
          </Row>
        </motion.div>

        {/* Support Section */}
        <motion.div 
          className="card rounded-lg p-6 shadow-sm my-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Title level={4} className="mb-4">תמיכה וסיוע</Title>
          <Row gutter={[16, 16]} className="text-center">
            <Col xs={24} sm={8}>
              <Button type="link" icon={<WhatsAppOutlined />} size="large" className="w-full">
                WhatsApp תמיכה
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Button type="link" icon={<MailOutlined />} size="large" className="w-full">
                שליחת מייל
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Button type="link" icon={<PhoneOutlined />} size="large" className="w-full">
                יצירת קשר טלפוני
              </Button>
            </Col>
          </Row>
        </motion.div>

        {/* Additional Resources */}
        <motion.div 
          className="card rounded-lg p-6 shadow-sm my-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Title level={4} className="mb-4">חומרים נוספים</Title>
          <List
            itemLayout="horizontal"
            dataSource={[
              {
                title: 'מדריך למוכר המתחיל',
                description: 'PDF מקיף עם טיפים והנחיות',
                icon: <BookOutlined />
              },
              {
                title: 'סרטוני הדרכה נוספים',
                description: 'ספריית וידאו מקצועית',
                icon: <VideoCameraOutlined />
              },
              {
                title: 'שאלות נפוצות',
                description: 'תשובות לשאלות מובילות',
                icon: <QuestionCircleOutlined />
              }
            ]}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={item.icon} />}
                  title={<a href="#">{item.title}</a>}
                  description={item.description}
                />
              </List.Item>
            )}
          />
        </motion.div>

        {/* Footer Note */}
        <motion.div 
          className="text-center my-8 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <p>מצאת את ההדרכה מועילה? שתף עם עמיתים!</p>
          <Space className="mt-2">
            <Button type="text" icon={<LinkedinOutlined />} />
            <Button type="text" icon={<WhatsAppOutlined />} />
            <Button type="text" icon={<MailOutlined />} />
          </Space>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default TrainingDetails;