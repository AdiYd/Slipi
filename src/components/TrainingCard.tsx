import React from 'react';
import { Card, Tag } from 'antd';
import { ClockCircleOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface TrainingCardProps {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  imageUrl: string;
}

const difficultyColors = {
  beginner: '#4CAF50',
  intermediate: '#FF9800',
  advanced: '#F44336'
};

const difficultyLabels = {
  beginner: 'בסיסי',
  intermediate: 'מתקדם',
  advanced: 'מומחה'
};

const TrainingCard: React.FC<TrainingCardProps> = ({
  id,
  title,
  description,
  duration,
  difficulty,
  category,
  imageUrl
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/trainings/${id}`);
  };

  return (
    <Card
      hoverable
      className="transition-transform duration-300 hover:scale-105 bg-card-light dark:bg-card-dark shadow-card dark:shadow-card-dark"
      cover={
        <div className="h-[200px] w-full overflow-hidden rounded-t-lg relative">
          <img
            alt={title}
            src={imageUrl}
            className="h-full w-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Tag color={difficultyColors[difficulty]} className="rounded-full px-3">
              {difficultyLabels[difficulty]}
            </Tag>
          </div>
        </div>
      }
      onClick={handleClick}
    >
      <div className="flex flex-col space-y-3 w-full">
        <h4 className="text-xl font-semibold text-text-light dark:text-text-dark m-0">
          {title}
        </h4>
        <p className="line-clamp-2 text-text-light dark:text-text-dark m-0">
          {description}
        </p>
        <div className="flex flex-wrap gap-2">
          <Tag color="blue" className="rounded-full px-3 flex items-center gap-1">
            <BookOutlined />
            {category}
          </Tag>
          <Tag color="cyan" className="rounded-full px-3 flex items-center gap-1">
            <ClockCircleOutlined />
            {duration} דקות
          </Tag>
        </div>
      </div>
    </Card>
  );
};

export default TrainingCard; 