import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, Typography, Input, Row, Col, Card, List, Avatar, Progress, message, Tag } from 'antd';
import { 
  ArrowRightOutlined, 
  ArrowLeftOutlined,
  SendOutlined, 
  WhatsAppOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  BookOutlined,
  StarOutlined,
  VideoCameraOutlined,
  QuestionCircleOutlined,
  LinkedinOutlined,

  CheckOutlined
} from '@ant-design/icons';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { useTraining } from '../contexts/TrainingContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import DocxRenderer from '../components/DocxRenderer';
import '../index.css';
import DocxConverter from '../components/DocxConverter';
import axios from 'axios';
import { useMediaQuery } from 'react-responsive';
import { RxDoubleArrowLeft, RxDoubleArrowRight } from 'react-icons/rx';

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
  const { user, updateUser } = useAuth();
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string; timestamp: string }>>([]);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  
  useEffect(() => {
    // Reset progress
    const isCompleted = user?.trainings?.find(t => t.id === id)?.completed;
    if (isCompleted) {
      setCompletionProgress(100);
    } else {
      setCompletionProgress(0);
    }
    // Setting message to the chat
    setChatMessages(user?.trainings?.find(t => t.id === id)?.chatSession || []);
  }, [user, id]);

  // Find the current training and adjacent trainings
  const { training, nextTraining, prevTraining } = useMemo(() => { 
    if (!trainings || !id) return { training: null, nextTraining: null, prevTraining: null };
    
    const currentIndex = trainings.findIndex(t => t.id === id);
    if (currentIndex === -1) return { training: null, nextTraining: null, prevTraining: null };
    
    return {
      training: trainings[currentIndex],
      nextTraining: currentIndex < trainings.length - 1 ? trainings[currentIndex + 1] : null,
      prevTraining: currentIndex > 0 ? trainings[currentIndex - 1] : null
    };
  }, [trainings, id]);



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

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', content: chatMessage, timestamp: new Date().toISOString() }]);

    let chatbotResponse = '';
    try {
      const response = await axios.post('/api/chatbot', {
        message: chatMessage
      });
      chatbotResponse = response.data;
    } catch (error) {
      chatbotResponse = 'תודה על השאלה! אני אשמח לעזור לך. האם תוכל/י לפרט יותר?';
    }

    // For now, we'll simulate a response
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: chatbotResponse,
        timestamp: new Date().toISOString()
      }]);
    }, 500);

    let updatedUser = user;
    const isTrainingExists = user?.trainings.find(t => t.id === training.id);
    if (!isTrainingExists) {
      updatedUser?.trainings.push({
        id: training.id,
        completed: false,
        chatSession: []
      });
    }

    const updatedTrainings = updatedUser?.trainings?.map(t => 
      t.id === training.id ? (
        { ...t, 
          chatSession: [...t.chatSession, {
          role: 'user',
          content: chatMessage,
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          content: chatbotResponse,
          timestamp: new Date().toISOString()
        }] 
      }) : t
    ) || [];
    console.log('updatedTrainings', updatedTrainings);
    if (updatedUser) {
      updatedUser.trainings = updatedTrainings;
    }
    
    await updateUser(updatedUser);

    setChatMessage('');
  };

  const handleCompleteTraining = async () => {
    try {
      setIsCompleting(true);
      
      // Start progress animation
      setCompletionProgress(0);
      const interval = setInterval(async () => {
        setCompletionProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            finishSequence();
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      if (!user) {
        throw new Error('User not found');
      }

      // Update user's training status
      const finishSequence = async () => {
        const updatedTrainings = user.trainings.map(t => 
          t.id === training.id ? { ...t, completed: true } : t
        );
        if (!updatedTrainings.find(t => t.id === training.id)) {
          updatedTrainings.push({
            id: training.id,
            completed: true,
            chatSession: []
          });
        }
        const updatedUser = {
          ...user,
          trainings: updatedTrainings
        };
        await updateUser(updatedUser); 
        // Ensure progress bar reaches 100%
        setCompletionProgress(100);
        setTimeout(() => {
          setIsCompleting(false);
          message.success('ההדרכה הושלמה בהצלחה 🎉');
          // navigate('/trainings');
        }, 300);
      };

      // await finishSequence();

    } catch (error) {
      console.error('Failed to complete training:', error);
      message.error('Failed to complete training. Please try again.');
      setIsCompleting(false);
      setCompletionProgress(0);
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        className="max-w-7xl mx-auto p-4 max-sm:p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
  

        {/* Navigation Buttons */}
        <div className="relative items-center mb-4">
          {prevTraining && (
            <Button
              type="default"
              size="small"
              icon={<RxDoubleArrowRight />}
              onClick={() => navigate(`/trainings/${prevTraining.id}`)}
              className="float-start z-20 items-center gap-1 text-primary-light hover:text-primary-dark"
            >
              {isMobile ? 'הקודם' : 'להדרכה הקודמת'}
            </Button>
          )}
          {nextTraining && (
            <Button
              type="default"
              size="small"
              onClick={() => navigate(`/trainings/${nextTraining.id}`)}
              className=" float-end z-20 items-center gap-1 text-primary-light hover:text-primary-dark"
            >
              {isMobile ? 'הבא' : 'להדרכה הבאה'}
              <RxDoubleArrowLeft />
            </Button>
          )}
        </div>
        <Title level={2} className="relative text-center -top-2 z-10">הדרכה {id}</Title>

        {/* Main Content */}
        <motion.div
          className="w-full h-fit mx-auto mb-8 mt-12 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Training Navigation Overlay */}
          {/* <div className="absolute top-2 right-2 left-2 flex justify-between z-10">
            {prevTraining && (
              <Button
                size="small"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate(`/trainings/${prevTraining.id}`)}
                className="bg-white/80 hover:bg-white shadow-sm"
              />
            )}
            {nextTraining && (
              <Button
                size="small"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(`/trainings/${nextTraining.id}`)}
                className="bg-white/80 hover:bg-white shadow-sm"
              />
            )}
          </div> */}
          <Title level={4} className="mb-4">{training.title}</Title>
          <Title level={5} className="mb-4">{training.subtitle}</Title>
          <p className="mb-4">{training.description}</p>
          {training.fileUrl ? 
            <DocxConverter className='overflow-x-auto max-w-[100%]' fileUrl={training.fileUrl} />
            :
            <DocxRenderer />
          }
        </motion.div>

        {/* Chat Section */}
        <motion.div 
          className="card rounded-lg p-6 max-sm:p-2 shadow-sm"
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
                  initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-3 w-fit max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary-light dark:bg-primary-dark ml-auto rounded-t-xl rounded-l-xl text-white'
                      : 'bg-gray-100 dark:bg-gray-700 mr-auto rounded-t-xl rounded-r-xl'
                  }`}
                >
                  {message.content}
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
        
        <div className="my-8">

        {/* Progress Bar */}
        {completionProgress > 0 && (
            <motion.div 
            className="flex justify-center  mb-4 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            >
            <Progress
                percent={completionProgress}
                status={completionProgress === 100 ? 'success' : 'active'}
                strokeColor={{
                '0%': '#108ee9',
                //   '50%': '#108ee9',
                '100%': '#87d068',
                }}
                className="mb-4 max-w-[80%] "
                />
            </motion.div>
        )}

          {/* Completion Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-between px-4">
            {/* Action Buttons */}
            {!Boolean(completionProgress === 100) ? (
              <Button
                type="primary"
                
                size={isMobile ? 'middle' : 'large'}
                onClick={handleCompleteTraining}
                loading={isCompleting}
                iconPosition='end'
                icon={<CheckOutlined />}
                className="bg-green-500"
              >
                {isMobile ? 'סיימתי' : 'סיימתי את ההדרכה'}
              </Button>
            ) : (
              <Tag color="success" icon={<CheckOutlined />} className="">
                  הדרכה הושלמה
              </Tag>
            )}
            {nextTraining && (
              <Button 
                type="default" 
                size={isMobile ? 'middle' : 'large'}
                iconPosition='end'
                onClick={() => navigate(`/trainings/${nextTraining.id}`)}
                icon={<ArrowLeftOutlined />}
              >
                {isMobile ? 'הבא' : 'להדרכה הבאה'}
              </Button>
            )}
          </motion.div>
        </div>

        {/* Related Trainings */}
        {/* <motion.div 
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
        </motion.div> */}

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