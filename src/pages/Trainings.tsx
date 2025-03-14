import React from 'react';
import { Row, Col, Typography, Spin, Select, Input, Tag, Space } from 'antd';
import { SearchOutlined, BookOutlined } from '@ant-design/icons';
import { useTraining } from '../contexts/TrainingContext';
import TrainingCard from '../components/TrainingCard';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { exampleTrainings } from './Dashboard';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export const categoryColors: Record<string, string> = {
  'מבוא לחברה': 'magenta',
  'מוצרים': 'purple',
  'מכירות': 'red',
  'שירות לקוחות': 'blue',
  'טכנולוגיה ומערכות': 'orange'
};
export const difficultyColors = {
  beginner: '#4CAF50',
  intermediate: '#FF9800',
  advanced: '#F44336'
};

export const categories = [
  'מבוא לחברה',
  'מוצרים',
  'מכירות',
  'שירות לקוחות',
  'טכנולוגיה ומערכות'
];

export const difficultyLabels = {
  all: 'כל הרמות',
  beginner: 'בסיסי',
  intermediate: 'מתקדם',
  advanced: 'מומחה'
};

export  const difficulties = [
  { value: 'beginner', label: 'בסיסי', color: 'success' },
  { value: 'intermediate', label: 'מתקדם', color: 'processing' },
  { value: 'advanced', label: 'מומחה', color: 'error' }
];

const Trainings: React.FC = () => {
  const { trainings, loading, error, fetchTrainings } = useTraining();
  const [searchText, setSearchText] = React.useState('');
  const [selectedDifficulties, setSelectedDifficulties] = React.useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);

  React.useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const handleDifficultyToggle = (difficulty: string) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filteredTrainings = (trainings || exampleTrainings).filter(training => {
    if (searchText === '' && selectedDifficulties.length === 0 && selectedCategories.length === 0) {
      return true;
    }

    const matchesSearch = searchText === '' || 
      training.title.toLowerCase().includes(searchText.toLowerCase()) ||
      training.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesDifficulty = selectedDifficulties.length === 0 || 
      selectedDifficulties.includes(training.difficulty);

    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(training.category);

    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const renderFilters = () => (
    <div className="mb-6 space-y-4">
      <div>
          <Title className='!text-sm' level={5}>רמת קושי:</Title>
        <Space size={[0, 8]} wrap>
          {difficulties.map(({ value, label, color }) => (
            <Tag
              key={value}
              color={!selectedDifficulties.includes(value) ? 'default' : color}
              className="cursor-pointer text-xs py-1 px-3 rounded-full hover:scale-105 transition-transform duration-300"
              onClick={() => handleDifficultyToggle(value)}
            >
              {label}
            </Tag>
          ))}
        </Space>
      </div>
      
      <div>
        <Title className='!text-sm' level={5}>נושא:</Title>
        <Space size={[0, 8]} wrap>
          {categories.map(category => (
            <Tag
              key={category}
              color={!selectedCategories.includes(category) ? 'default' : categoryColors[category]}
              className="cursor-pointer text-xs py-1 px-3 rounded-full hover:scale-105 transition-transform duration-300"
              onClick={() => handleCategoryToggle(category)}
            >
              {category}
            </Tag>
          ))}
        </Space>
      </div>
    </div>
  );

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
            onChange={handleSearchChange}
            value={searchText}
            className="w-full"
          />
        </Col>
      </Row>

      {renderFilters()}

      <Row gutter={[16, 16]}>
        {filteredTrainings.map(training => (
          <Col className='flex' key={training.id} xs={24} sm={12} md={8} lg={6}>
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