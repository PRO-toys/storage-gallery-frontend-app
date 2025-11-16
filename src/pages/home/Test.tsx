// src/pages/home/Test.tsx
import React from 'react';

const Test: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-4">Welcome to the Test Page</h1>
        <p className="mt-4 text-center">This is the Test page.</p>
      </div>
    </div>
  );
};

export default Test;
