import React from 'react';
import { Row, Col, Typography, Spin, Select, Input } from 'antd';
import { SearchOutlined, BookOutlined } from '@ant-design/icons';
import { useTraining } from '../contexts/TrainingContext';
import TrainingCard from '../components/TrainingCard';
import DashboardLayout from '../components/layouts/DashboardLayout';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const exampleTrainings = [
  {
    id: '1',
    title: 'היכרות עם Slipi Comfort',
    description: 'מי אנחנו ומה היתרון שלנו? הכרת החברה, הערכים, הסניפים והיתרונות התחרותיים שלנו.',
    duration: 45,
    difficulty: 'beginner',
    category: 'מבוא לחברה',
    imageUrl: '/company-intro.jpg'
  },
  {
    id: '2',
    title: 'מוצרי החברה',
    description: 'הכרת המוצרים שלנו: מזרנים אורתופדיים, מיטות בהתאמה אישית וספות נוער מתכווננות.',
    duration: 60,
    difficulty: 'intermediate',
    category: 'מוצרים',
    imageUrl: '/products.jpg'
  },
  {
    id: '3',
    title: 'תהליך המכירה',
    description: 'כיצד עובדים מול לקוח? מזיהוי צרכים ועד סגירת עסקה.',
    duration: 90,
    difficulty: 'advanced',
    category: 'מכירות',
    imageUrl: '/sales.jpg'
  }
];

const Trainings: React.FC = () => {
  const { trainings, loading, error, fetchTrainings } = useTraining();
  const [searchText, setSearchText] = React.useState('');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('all');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  React.useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const categories = [
    'מבוא לחברה',
    'מוצרים',
    'מכירות',
    'שירות לקוחות',
    'טכנולוגיה ומערכות'
  ];

  const difficultyLabels = {
    all: 'כל הרמות',
    beginner: 'בסיסי',
    intermediate: 'מתקדם',
    advanced: 'מומחה'
  };

  const filteredTrainings = (trainings || exampleTrainings).filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         training.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || training.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === 'all' || training.category === selectedCategory;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

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
      <div className="flex items-center gap-3 mb-6">
        <BookOutlined className="text-2xl text-primary-light dark:text-primary-dark" />
        <h2 className="text-2xl font-bold text-text-light dark:text-text-dark m-0">
          מרכז למידה
        </h2>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Search
            placeholder="חיפוש הדרכות..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onChange={e => setSearchText(e.target.value)}
            className="w-full"
          />
        </Col>
        <Col xs={24} sm={8}>
          <Select
            className="w-full"
            placeholder="רמת הדרכה"
            size="large"
            value={selectedDifficulty}
            onChange={setSelectedDifficulty}
          >
            {Object.entries(difficultyLabels).map(([value, label]) => (
              <Option key={value} value={value}>{label}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8}>
          <Select
            className="w-full"
            placeholder="נושא"
            size="large"
            value={selectedCategory}
            onChange={setSelectedCategory}
          >
            <Option value="all">כל הנושאים</Option>
            {categories.map(category => (
              <Option key={category} value={category}>{category}</Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {filteredTrainings.map(training => (
          <Col key={training.id} xs={24} sm={12} md={8} lg={6}>
            <TrainingCard {...training} />
          </Col>
        ))}
        {filteredTrainings.length === 0 && (
          <Col span={24}>
            <div className="text-center text-text-light dark:text-text-dark py-8">
              לא נמצאו הדרכות התואמות את החיפוש
            </div>
          </Col>
        )}
      </Row>
    </DashboardLayout>
  );
};

export default Trainings; 