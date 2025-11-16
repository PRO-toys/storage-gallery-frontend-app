// src/components/card/CardSquare.tsx
import React from 'react';

interface CardSquareProps {
  image: string;
  title: string;
  selected: boolean;
  onClick: () => void;
}

const CardSquare: React.FC<CardSquareProps> = ({ image, title, selected, onClick }) => {
  return (
    <div
      className={`border-2 rounded-lg p-2 cursor-pointer transition-all ${
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-300'
      }`}
      onClick={onClick}
    >
      <img src={image} alt={title} className="w-full h-40 object-cover rounded-lg" />
      <h3 className="text-center mt-2 font-semibold">{title}</h3>
    </div>
  );
};

export default CardSquare;
