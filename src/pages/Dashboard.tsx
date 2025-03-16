import React from 'react';
import { Row, Col, Card, Typography, Spin, Carousel, Button, Progress, List, Avatar } from 'antd';
import { VideoCameraOutlined, ClockCircleOutlined, TrophyOutlined, LeftOutlined, RightOutlined, CheckCircleOutlined, MessageOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTraining } from '../contexts/TrainingContext';
import TrainingCard from '../components/TrainingCard';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import { useMediaQuery } from 'react-responsive';

const { Title } = Typography;


const Dashboard: React.FC = () => {
  const { trainings, loading, error } = useTraining();
  const { user } = useAuth();
  const carouselRef = React.useRef<any>(null);
  const isSmallScreen = useMediaQuery({ query: '(max-width: 480px)' });
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
        breakpoint: 769,
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
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="card* relative group overflow-hidden h-[180px]">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 dark:from-violet-500/20 dark:via-fuchsia-500/20 dark:to-pink-500/20 transition-opacity duration-300 group-hover:opacity-80" />
              
              {/* Decorative shapes - Circles pattern */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -right-4 top-4 w-8 h-8 rounded-full border-2 border-violet-500/20 dark:border-violet-500/30" />
                <div className="absolute right-8 top-12 w-4 h-4 rounded-full border-2 border-fuchsia-500/20 dark:border-fuchsia-500/30" />
                <div className="absolute -left-4 bottom-4 w-12 h-12 rounded-full border-2 border-pink-500/20 dark:border-pink-500/30" />
                <div className="absolute left-12 bottom-8 w-6 h-6 rounded-full border-2 border-violet-500/20 dark:border-violet-500/30" />
              </div>
              
              <div className="relative items-center my-auto flex gap-8 mt-6 h-full">
                {/* Updated icon container with gradient */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-[2px] transition-transform duration-300 group-hover:scale-110">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                    <VideoCameraOutlined style={{ fontSize: '24px', background: 'linear-gradient(to bottom right, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
                  </div>
                </div>

                <div className="text-right mt-auto">
                  <h3 className="text-3xl font-bold mb-2 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                    {trainings?.length || 0}
                    <span className="text-base font-normal mr-2 text-textSecondary-light dark:text-textSecondary-dark">הכשרות שונות במערכת</span>
                  </h3>
                  <Title level={5} className="text-textSecondary-light dark:text-textSecondary-dark text-base">
                    סה״כ הדרכות
                  </Title>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="card* relative group overflow-hidden h-[180px]">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-sky-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:via-sky-500/20 dark:to-blue-500/20 transition-opacity duration-300 group-hover:opacity-80" />
              
              {/* Decorative shapes - Squares pattern */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -right-2 top-6 w-8 h-8 border-2 border-cyan-500/20 dark:border-cyan-500/30 rotate-12" />
                <div className="absolute right-12 top-2 w-4 h-4 border-2 border-sky-500/20 dark:border-sky-500/30 -rotate-6" />
                <div className="absolute -left-4 bottom-4 w-10 h-10 border-2 border-blue-500/20 dark:border-blue-500/30 rotate-45" />
                <div className="absolute left-8 bottom-8 w-6 h-6 border-2 border-cyan-500/20 dark:border-cyan-500/30 -rotate-12" />
              </div>
              
              <div className="relative items-center my-auto flex gap-8 mt-6 h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-500 p-[2px] transition-transform duration-300 group-hover:scale-110">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                    <ClockCircleOutlined style={{ fontSize: '24px', background: 'linear-gradient(to bottom right, #06b6d4, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
                  </div>
                </div>

                <div className="text-right mt-auto">
                  <h3 className="text-3xl font-bold mb-2 bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-500 bg-clip-text text-transparent">
                    {totalDuration || 0}
                    <span className="text-base font-normal mr-2 text-textSecondary-light dark:text-textSecondary-dark">דקות</span>
                  </h3>
                  <Title level={5} className="text-textSecondary-light dark:text-textSecondary-dark text-base">
                    זמן למידה משוער
                  </Title>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="card* relative group overflow-hidden h-[180px]">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:via-green-500/20 dark:to-teal-500/20 transition-opacity duration-300 group-hover:opacity-80" />
              
              {/* Decorative shapes - Stars/Diamond pattern */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute right-4 top-4 w-8 h-8 border-2 border-emerald-500/20 dark:border-emerald-500/30 rotate-45" />
                <div className="absolute right-16 top-8 w-4 h-4 border-2 border-green-500/20 dark:border-green-500/30 rotate-45" />
                <div className="absolute -left-2 bottom-6 w-10 h-10 border-2 border-teal-500/20 dark:border-teal-500/30 rotate-45" />
                <div className="absolute left-12 bottom-2 w-6 h-6 border-2 border-emerald-500/20 dark:border-emerald-500/30 rotate-45" />
              </div>
              
              <div className="relative items-center my-auto flex gap-8 mt-6 h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 p-[2px] transition-transform duration-300 group-hover:scale-110">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                    <TrophyOutlined style={{ fontSize: '24px', background: 'linear-gradient(to bottom right, #10b981, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
                  </div>
                </div>

                <div className="text-right mt-auto">
                  <h3 className="text-3xl font-bold mb-2 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent">
                    {completedTrainingsList.length || 0}
                    <span className="text-base font-normal mr-2 text-textSecondary-light dark:text-textSecondary-dark">הדרכות הושלמו</span>
                  </h3>
                  <Title level={5} className="text-textSecondary-light dark:text-textSecondary-dark text-base">
                    נותרו עוד {trainings?.length - completedTrainingsList.length || 0} הדרכות
                  </Title>
                </div>
              </div>
            </Card>
          </motion.div>
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
          className="relative overflow-visible px-8 max-sm:px-2"
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
              <div key={training.id} className="px-2 max-sm:px-1 overflow-visible">
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
                actions={isSmallScreen ? [] :[
                  <Button type="primary" onClick={() => navigate(`/trainings/${training.id}`)}>
                    התחל הדרכה
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={training.imageUrl} />}
                  title={training.title}
                  description={
                    <>
                      <div>
                        <div>{training.subtitle}</div>
                        <div>{`${training.duration} דקות • ${training.category}`}</div>
                      </div>
                      {isSmallScreen &&
                      <Button className='mt-4' type="primary" onClick={() => navigate(`/trainings/${training.id}`)}>
                      התחל הדרכה
                    </Button>}
                    </>
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