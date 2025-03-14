import React from 'react';
import { Card, Tag } from 'antd';
import { ClockCircleOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { categoryColors, difficultyColors, difficultyLabels } from '../pages/Trainings';
import { motion } from 'framer-motion';

interface TrainingCardProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  imageUrl: string;
}

const TrainingCard: React.FC<TrainingCardProps> = ({
  id,
  title,
  subtitle,
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
    <motion.div
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='overflow-visible'
    >
      <Card
        hoverable
        className="flex flex-col justify-between duration-300 card my-8 overflow-visible"
        cover={
          <div className="h-[200px] w-full overflow-hidden rounded-t-lg relative">
            <img
              alt={title}
              src={imageUrl}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-2 right-2">
              <Tag bordered={false} style={{backgroundColor: difficultyColors[difficulty]}} className="rounded-full px-3 text-white">
                {difficultyLabels[difficulty]}
              </Tag>
            </div>
          </div>
        }
        onClick={handleClick}
      >
        <div className="flex flex-col space-y-3 w-full">
          <div>
            <h4 className="text-xl font-semibold text-text-light dark:text-text-dark m-0">
              {title}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          </div>
          <p className="line-clamp-2 text-text-light dark:text-text-dark m-0">
            {description}
          </p>
          <div className="flex flex-wrap gap-2">
            <Tag className="rounded-full px-3 flex items-center gap-1">
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
    </motion.div>
  );
};

export default TrainingCard; 