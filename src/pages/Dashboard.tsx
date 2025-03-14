import React from 'react';
import { Row, Col, Card, Statistic, Typography, Spin } from 'antd';
import { VideoCameraOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { useTraining } from '../contexts/TrainingContext';
import TrainingCard from '../components/TrainingCard';
import DashboardLayout from '../components/layouts/DashboardLayout';

const { Title } = Typography;

const exampleTrainings = [
  {
    id: '1',
    title: 'היכרות עם Slipi Comfort',
    description: 'מי אנחנו ומה היתרון שלנו? הכרת החברה, הערכים, הסניפים והיתרונות התחרותיים שלנו.',
    duration: 45,
    difficulty: 'beginner',
    category: 'מבוא לחברה',
    imageUrl: 'https://picsum.photos/seed/picsum/200/300'
  },
  {
    id: '2',
    title: 'מוצרי החברה',
    description: 'הכרת המוצרים שלנו: מזרנים אורתופדיים, מיטות בהתאמה אישית וספות נוער מתכווננות.',
    duration: 60,
    difficulty: 'intermediate',
    category: 'מוצרים',
    imageUrl: 'https://picsum.photos/seed/picsum2/200/300'
  },
  {
    id: '3',
    title: 'תהליך המכירה',
    description: 'כיצד עובדים מול לקוח? מזיהוי צרכים ועד סגירת עסקה.',
    duration: 90,
    difficulty: 'advanced',
    category: 'מכירות',
    imageUrl: 'https://picsum.photos/seed/picsum3/200/300'
  }
];

const Dashboard: React.FC = () => {
  const { trainings, loading, error, fetchTrainings } = useTraining();

  React.useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);
  
  const totalDuration = (trainings || exampleTrainings)?.reduce((acc, training) => acc + training?.duration, 0);
  const completedTrainings = (trainings || exampleTrainings)?.length;

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
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card className="bg-card-light dark:bg-card-dark shadow-card dark:shadow-card-dark">
            <Statistic
              title={<span className="text-text-light dark:text-text-dark">סה״כ הדרכות</span>}
              value={completedTrainings}
              prefix={<VideoCameraOutlined className="text-primary-light dark:text-primary-dark" />}
              className="text-text-light dark:text-text-dark"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="bg-card-light dark:bg-card-dark shadow-card dark:shadow-card-dark">
            <Statistic
              title={<span className="text-text-light dark:text-text-dark">זמן למידה כולל</span>}
              value={totalDuration}
              suffix="דקות"
              prefix={<ClockCircleOutlined className="text-primary-light dark:text-primary-dark" />}
              className="text-text-light dark:text-text-dark"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="bg-card-light dark:bg-card-dark shadow-card dark:shadow-card-dark">
            <Statistic
              title={<span className="text-text-light dark:text-text-dark">הדרכות שהושלמו</span>}
              value={completedTrainings}
              prefix={<TrophyOutlined className="text-primary-light dark:text-primary-dark" />}
              className="text-text-light dark:text-text-dark"
            />
          </Card>
        </Col>
      </Row>

      <h2 className="text-2xl font-bold text-text-light dark:text-text-dark my-6">
        הדרכות מומלצות
      </h2>

      <Row gutter={[16, 16]}>
        {(trainings || exampleTrainings).slice(0, 3).map((training) => (
          <Col key={training.id} xs={24} sm={12} md={8}>
            <TrainingCard {...training} />
          </Col>
        ))}
      </Row>
    </DashboardLayout>
  );
};

export default Dashboard; 