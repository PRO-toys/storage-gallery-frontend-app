// src/pages/role/admin/Setting.tsx
import React, { useState } from 'react';
import Navbar from '../../../components/navbar/Navbar';
import useAuth from '../../../hooks/useAuth';

const Setting: React.FC = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  useAuth(setIsAuth);

  const [featureEnabled, setFeatureEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleToggleFeature = () => {
    setLoading(true);
    setTimeout(() => {
      setFeatureEnabled(!featureEnabled);
      setLoading(false);
      alert(`Feature ${featureEnabled ? 'disabled' : 'enabled'} successfully!`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-white mt-10">Settings</h1>
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800">Feature Management</h2>
          <div className="flex items-center justify-between mt-4">
            <span className="text-gray-700">Enable Feature:</span>
            <button
              onClick={handleToggleFeature}
              className={`py-2 px-4 rounded text-white ${featureEnabled ? 'bg-red-500' : 'bg-green-500'} hover:${featureEnabled ? 'bg-red-600' : 'bg-green-600'}`}
            >
              {loading ? 'Processing...' : featureEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
