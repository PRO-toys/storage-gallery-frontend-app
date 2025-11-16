// src/pages/role/admin/Dashboard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/navbar/Navbar';
import useAuth from '../../../hooks/useAuth';

const Dashboard: React.FC = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  useAuth(setIsAuth);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-white mt-10">Admin Dashboard</h1>

        {/* Report Section */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
          <div
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate('/role/admin/reports/ReportProduct')}
          >
            <h2 className="text-xl font-semibold text-gray-800">Report Product</h2>
          </div>
          <div
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate('/role/admin/reports/ReportCompany')}
          >
            <h2 className="text-xl font-semibold text-gray-800">Report Company</h2>
          </div>
          <div
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate('/role/admin/reports/ReportPerson')}
          >
            <h2 className="text-xl font-semibold text-gray-800">Report Person</h2>
          </div>
          <div
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate('/role/admin/reports/ReportPromotionCode')}
          >
            <h2 className="text-xl font-semibold text-gray-800">Report Promotion Code</h2>
          </div>
          <div
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate('/role/admin/reports/ReportAnalytics')}
          >
            <h2 className="text-xl font-semibold text-gray-800">Report Analytics</h2>
          </div>
        </div>

        {/* Divider */}
        <div className="flex justify-center my-8">
          <hr className="w-full max-w-md border-t-2 border-gray-300" />
        </div>

        {/* Manage Section (Lists only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
          <div
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate('/role/admin/data/product/List')}
          >
            <h2 className="text-xl font-semibold text-gray-800">Manage Product</h2>
            <p className="text-sm text-gray-500 mt-1">View & search all products</p>
          </div>
          <div
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate('/role/admin/data/company/List')}
          >
            <h2 className="text-xl font-semibold text-gray-800">Manage Company</h2>
            <p className="text-sm text-gray-500 mt-1">View & search all companies</p>
          </div>
          <div
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate('/role/admin/data/person/List')}
          >
            <h2 className="text-xl font-semibold text-gray-800">Manage Person</h2>
            <p className="text-sm text-gray-500 mt-1">View & search all people</p>
          </div>
          <div
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate('/role/admin/data/promotion_code/List')}
          >
            <h2 className="text-xl font-semibold text-gray-800">Manage Promotion Codes</h2>
            <p className="text-sm text-gray-500 mt-1">View & search promotion codes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;