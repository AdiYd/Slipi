import React from 'react';

type ShapeType = 'circle' | 'square' | 'diamond';
type Position = { top?: number; right?: number; bottom?: number; left?: number };

const defaultColorScheme = {
  from: 'rgb(51, 122, 183)',
  via: 'rgb(82, 153, 214)',
  to: 'rgb(102, 187, 245)',
}

interface ShapeProps {
  size: number;
  color: string;
  darkColor: string;
  position: Position;
  rotation?: number;
}

const generateRandomPosition = (): Position => {
  // Generate random positions including negative values for overflow effect
  return {
    top: Math.random() * 140 - 20,    // -20 to 120
    right: Math.random() * 140 - 20,  // -20 to 120
    bottom: Math.random() * 140 - 20, // -20 to 120
    left: Math.random() * 140 - 20,   // -20 to 120
  };
};

const generateRandomSize = (): number => {
  // Generate sizes between 16px and 48px
  return Math.floor(Math.random() * 32) + 16;
};

const generateRandomRotation = (): number => {
  return Math.floor(Math.random() * 360);
};

export const generateShapes = (
  shape: ShapeType,
  count: number,
  colorScheme: {
    from: string;
    via: string;
    to: string;
  } = defaultColorScheme
): React.ReactNode => {
  const shapes: React.ReactNode[] = [];
  
  for (let i = 0; i < count; i++) {
    const position = generateRandomPosition();
    const size = generateRandomSize();
    const rotation = generateRandomRotation();
    
    // Randomly select a color from the scheme
    const colors = [colorScheme.from, colorScheme.via, colorScheme.to];
    const colorIndex = Math.floor(Math.random() * colors.length);
    const color = colors[colorIndex];
    
    const shapeStyle: React.CSSProperties = {
      position: 'absolute',
      width: size,
      height: size,
      border: `2px solid ${color}20`,
      ...position,
      transition: 'all 0.3s ease',
    };

    switch (shape) {
      case 'circle':
        shapeStyle.borderRadius = '50%';
        break;
      case 'square':
        shapeStyle.transform = `rotate(${rotation}deg)`;
        break;
      case 'diamond':
        shapeStyle.transform = `rotate(45deg)`;
        break;
    }

    shapes.push(
      <div
        key={i}
        className={`
          absolute border-2 transition-all duration-300
          group-hover:scale-110 group-hover:opacity-80
          dark:opacity-30 dark:group-hover:opacity-60
        `}
        style={shapeStyle}
      />
    );
  }

  return shapes;
}; 