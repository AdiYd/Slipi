import React from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Carousel, Button, Progress, List, Avatar } from 'antd';
import { VideoCameraOutlined, ClockCircleOutlined, TrophyOutlined, LeftOutlined, RightOutlined, CheckCircleOutlined, MessageOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTraining } from '../contexts/TrainingContext';
import TrainingCard from '../components/TrainingCard';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const { Title } = Typography;


const Dashboard: React.FC = () => {
  const { trainings, loading, error } = useTraining();
  const { user } = useAuth();
  const carouselRef = React.useRef<any>(null);
  const navigate = useNavigate();

  
  const completedTrainingsList = trainings?.filter(training => 
    user?.trainings.find(ut => ut.id === training.id && ut.completed)
  );

  const remainingTrainingsList = trainings?.filter(training => 
    !user?.trainings.find(ut => ut.id === training.id && ut.completed)
  );

  const completionPercentage = Math.round((completedTrainingsList.length / trainings?.length) * 100);
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
    // autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  const handlePrev = () => carouselRef.current?.prev();
  const handleNext = () => carouselRef.current?.next();

  if (loading || !trainings) {
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
        <span className='text-textSecondary-light text-base dark:text-textSecondary-dark'>פה תוכלו למצוא את כל ההדרכות שלכם,לשאול שאלות ולקבל תמיכה בכל שלב.</span>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Card className="card* text-center">
            <Statistic
              title={<span className="text-text-light dark:text-text-dark">סה״כ הדרכות</span>}
              value={trainings?.length}
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
                השלמת {completedTrainingsList.length} מתוך {trainings?.length} הדרכות
              </p>
              <p className="text-gray-500">
                {completedTrainingsList.length === trainings?.length 
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
          
          <Carousel 
            ref={carouselRef} 
            {...settings}
            className="training-carousel"
          >
            {trainings?.map((training) => ( 
              <div key={training.id} className="px-2 overflow-visible">
                <TrainingCard {...training} />
              </div>
            )).reverse()}
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
      <motion.div className="mt-12 mb-8">
        <Card className="card*">
          <Title level={3}>הדרכות שהושלמו</Title>
          <List
            dataSource={completedTrainingsList}
            renderItem={training => (
              <List.Item>
                <List.Item.Meta
                  avatar={<CheckCircleOutlined className="text-green-500 text-xl" />}
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
        <div className="card*">
          <Title level={3}>המוצרים שלנו</Title>
          <Row gutter={[16, 16]}>
            {trainings?.map(product => (
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
        </div>
      </motion.div>

      {/* Remaining Trainings Section */}
      <motion.div className="my-8">
        <Card className="card*">
          <Title level={3}>הדרכות שעדיין לא הושלמו</Title>
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