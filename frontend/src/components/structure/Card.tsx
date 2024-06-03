import React from 'react';

interface CardProps {
  title: string;
  imageUrl: string;
  description: React.ReactNode;
  reverse ?: boolean;
}

const Card: React.FC<CardProps> = ({ title, imageUrl, description, reverse = false }) => {
  const flexDirection = reverse ? 'flex-row-reverse' : 'flex-row';

  return (
    <div className={`flex ${flexDirection} p-4 border border-gray-200 rounded-lg shadow-md`}>
      <div className="flex-none">
        <img src={imageUrl} alt="" className="w-32 h-32 object-cover rounded-lg" />
      </div>
      <div className="flex-grow ml-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {description}
      </div>
    </div>
  );
};

export default Card;