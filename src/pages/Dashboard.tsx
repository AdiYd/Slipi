import React from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Carousel, Button, Progress, List, Avatar } from 'antd';
import { VideoCameraOutlined, ClockCircleOutlined, TrophyOutlined, LeftOutlined, RightOutlined, CheckCircleOutlined, MessageOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTraining } from '../contexts/TrainingContext';
import TrainingCard from '../components/TrainingCard';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export const exampleTrainings = [
  {
    id: '1',
    title: 'ברוכים הבאים ל-Slipi',
    subtitle: 'מבוא לשינה איכותית',
    description: 'הכרת החברה, הערכים שלנו והחזון - כל מה שהופך אותנו למובילים בתחום השינה האיכותית.',
    duration: 30,
    difficulty: 'beginner',
    category: 'מבוא',
    imageUrl: 'https://picsum.photos/seed/welcome/200/300'
  },
  {
    id: '2',
    title: 'עולם השינה האיכותית',
    subtitle: 'מבוא לשינה איכותית',
    description: 'למידה מעמיקה על שלבי השינה, חשיבות המזרן המתאים, וכיצד שינה איכותית משפיעה על הבריאות.',
    duration: 45,
    difficulty: 'beginner',
    category: 'ידע מקצועי',
    imageUrl: 'https://picsum.photos/seed/sleep/200/300'
  },
  {
    id: '3',
    title: 'הכרת מוצרי החברה',
    subtitle: 'מבוא לשינה איכותית',
    description: 'סקירה מקיפה של קולקציית המוצרים שלנו: מזרנים, מיטות מתכווננות, כריות ואביזרי שינה.',
    duration: 60,
    difficulty: 'intermediate',
    category: 'מוצרים',
    imageUrl: 'https://picsum.photos/seed/products/200/300'
  },
  {
    id: '4',
    title: 'אמנות המכירה והשירות',
    subtitle: 'מבוא לשינה איכותית',
    description: 'טכניקות מתקדמות לזיהוי צרכי לקוח, בניית אמון והתאמת פתרון מושלם.',
    duration: 75,
    difficulty: 'intermediate',
    category: 'מכירות',
    imageUrl: 'https://picsum.photos/seed/sales/200/300'
  },
  {
    id: '5',
    title: 'פתרונות מותאמים אישית',
    subtitle: 'מבוא לשינה איכותית',
    description: 'כיצד להתאים פתרון שינה מושלם לכל לקוח: ניתוח צרכים, התמודדות עם אתגרי שינה ובחירת המוצר המתאים.',
    duration: 90,
    difficulty: 'advanced',
    category: 'טכנולוגיה ומערכות',
    imageUrl: 'https://picsum.photos/seed/solutions/200/300'
  },
  {
    id: '6',
    title: 'מצוינות בשירות',
    subtitle: 'מבוא לשינה איכותית',
    description: 'שירות לקוחות ברמה הגבוהה ביותר: טיפול במקרים מיוחדים, שירות לאחר מכירה ובניית נאמנות לקוחות.',
    duration: 60,
    difficulty: 'advanced',
    category: 'שירות לקוחות',
    imageUrl: 'https://picsum.photos/seed/service/200/300'
  }
];

export const demoUser = {
  id: 'demo',
  fullName: 'ישראל ישראלי',
  email: 'Israel@Israeli.co.il',
  phone: '0541234567',
  trainings: [{
    id: '1',
    finished: true,
    chatSession: [{
     role: 'user',
     content: 'Hello',
     timestamp: '2021-01-01T00:00:00.000Z'
    },
    {
      role: 'assistant',
      content: 'Hello',
      timestamp: '2021-01-01T00:00:00.000Z'
    },
    {
      role: 'user',
      content: 'Hello',
      timestamp: '2021-01-01T00:00:00.000Z'
    },
    {
      role: 'assistant',
      content: 'Hello',
      timestamp: '2021-01-01T00:00:00.000Z'
    }
  ]},
  {
    id: '2',
    finished: false,
    chatSession: []
  }
]
};

const Dashboard: React.FC = () => {
  const { trainings, loading, error, fetchTrainings } = useTraining();
  const { user } = useAuth();
  const carouselRef = React.useRef<any>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);
  
  const allTrainings = trainings || exampleTrainings;
  
  const completedTrainingsList = allTrainings.filter(training => 
    user?.trainings.find(ut => ut.id === training.id && ut.finished)
  );

  const remainingTrainingsList = allTrainings.filter(training => 
    !user?.trainings.find(ut => ut.id === training.id && ut.finished)
  );

  const completionPercentage = Math.round((completedTrainingsList.length / allTrainings.length) * 100);
  const totalDuration = completedTrainingsList.reduce((acc, training) => acc + training.duration, 0);

  const chatHistory = user?.trainings
    .flatMap(training => training.chatSession)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
    .map((chat, id) => ({
      id,
      message: chat.content,
      timestamp: new Date(chat.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      date: new Date(chat.timestamp).toLocaleDateString('he-IL', { weekday: 'long' })
    }));

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  const handlePrev = () => carouselRef.current?.prev();
  const handleNext = () => carouselRef.current?.next();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-500">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className=" text-center items-center mt-4 mb-8">
        <Title level={2}>איזור אישי</Title>
        <span className='text-textSecondary-light text-base dark:text-textSecondary-dark'>פה תוכלו למצוא את כל הדרכות שלכם,לשאול שאלות ולקבל תמיכה בכל שלב.</span>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Card className="card* text-center">
            <Statistic
              title={<span className="text-text-light dark:text-text-dark">סה״כ הדרכות</span>}
              value={allTrainings.length}
              prefix={<VideoCameraOutlined className="text-primary-light mx-4 dark:text-primary-dark" />}
              className="text-text-light dark:text-text-dark"
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Card className="card* text-center">
            <Statistic
              title={<span className="text-text-light dark:text-text-dark">זמן למידה כולל</span>}
              value={totalDuration}
              suffix="דקות"
              prefix={<ClockCircleOutlined className="text-primary-light mx-4 dark:text-primary-dark" />}
              className="text-text-light dark:text-text-dark"
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Card className="card* text-center">
            <Statistic
              title={<span className="text-text-light dark:text-text-dark">הדרכות שהושלמו</span>}
              value={completedTrainingsList.length}
              prefix={<TrophyOutlined className="text-primary-light mx-4 dark:text-primary-dark" />}
              className="text-text-light dark:text-text-dark"
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-12 mb-8"
      >
        <div className='my-8'>
          <div className="flex items-center justify-center gap-8">
            <Progress
              type="circle"
              percent={completionPercentage}
              format={percent => `${percent}%`}
              strokeColor={{ '0%': '#337ab7', '100%': '#28a745' }}
            />
            <div className="text-center">
              <p className="text-lg mb-2">
                השלמת {completedTrainingsList.length} מתוך {allTrainings.length} הדרכות
              </p>
              <p className="text-gray-500">
                {completedTrainingsList.length === allTrainings.length 
                  ? 'כל הכבוד! השלמת את כל ההדרכות'
                  : 'המשך ללמוד כדי להשלים את כל ההדרכות'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative overflow-visible my-8">
        <h2 className="text-2xl font-bold text-text-light dark:text-text-dark my-6">
          הדרכות מומלצות
        </h2>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-visible px-8"
        >
          <Button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
            shape="circle"
            icon={<RightOutlined />}
            onClick={handlePrev}
          />
          
          <Carousel  ref={carouselRef} {...settings}>
            {allTrainings.map((training) => (
              <div key={training.id} className="px-2 overflow-visible">
                <TrainingCard {...training} />
              </div>
            ))}
          </Carousel>

          <Button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
            shape="circle"
            icon={<LeftOutlined />}
            onClick={handleNext}
          />
        </motion.div>
      </div>

      {/* Completed Trainings Section */}
      <motion.div className="my-8">
        <Card className="card*">
          <Title level={3}>הדרכות שהושלמו</Title>
          <List
            dataSource={completedTrainingsList}
            renderItem={training => (
              <List.Item>
                <List.Item.Meta
                  avatar={<CheckCircleOutlined className="text-success text-xl" />}
                  title={training.title}
                  description={
                    <div>
                      <div>{training.subtitle}</div>
                      <div>{`${training.duration} דקות • ${training.category}`}</div>
                    </div>
                  }
                />
              </List.Item>
            )}
            locale={{ emptyText: 'טרם השלמת הדרכות' }}
          />
        </Card>
      </motion.div>

      {/* Products Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="my-8"
      >
        <Card className="card*">
          <Title level={3}>המוצרים שלנו</Title>
          <Row gutter={[16, 16]}>
            {exampleTrainings.map(product => (
              <Col key={product.id} xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  cover={<img alt={product.title} src={product.imageUrl} className="h-48 object-cover" />}
                >
                  <Card.Meta
                    title={product.title}
                    description={product.description}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </motion.div>

      {/* Remaining Trainings Section */}
      <motion.div className="my-8">
        <Card className="card*">
          <Title level={3}>הדרכות להשלמה</Title>
          <List
            dataSource={remainingTrainingsList}
            renderItem={training => (
              <List.Item
                actions={[
                  <Button type="primary" onClick={() => navigate(`/trainings/${training.id}`)}>
                    התחל הדרכה
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={training.imageUrl} />}
                  title={training.title}
                  description={
                    <div>
                      <div>{training.subtitle}</div>
                      <div>{`${training.duration} דקות • ${training.category}`}</div>
                    </div>
                  }
                />
              </List.Item>
            )}
            locale={{ emptyText: 'כל הכבוד! השלמת את כל ההדרכות' }}
          />
        </Card>
      </motion.div>

      {/* Chat History Section */}
      <motion.div className="my-8">
        <Card className="card*">
          <Title level={3}>היסטוריית שיחות</Title>
          <List
            dataSource={chatHistory}
            renderItem={chat => (
              <List.Item>
                <List.Item.Meta
                  avatar={<MessageOutlined className="text-primary-light dark:text-primary-dark text-xl" />}
                  title={chat.message}
                  description={`${chat.date} • ${chat.timestamp}`}
                />
              </List.Item>
            )}
            locale={{ emptyText: 'אין היסטוריית שיחות' }}
          />
          <div className="text-center mt-4">
            <Button type="primary" onClick={() => navigate('/chat')}>
              צפה בכל השיחות
            </Button>
          </div>
        </Card>
      </motion.div>

      <div className='flex h-24 my-8 gap-4 justify-center items-center'>
     
      </div>
    </DashboardLayout>
  );
};

export default Dashboard; 