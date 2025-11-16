// src/components/navbar/Navbar.tsx
// ======================================================
// Navbar — Admin Panel Navigation
// - Shows Dashboard, Reports (dropdown), Manage Data (dropdown)
// - Includes Profile, Settings, and Logout
// - Works for both Desktop and Mobile
// ======================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SweetAlert from '../alert/SweetAlert2';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

const Navbar: React.FC = () => {
  // ---------- State ----------
  const [isOpen, setIsOpen] = useState(false); // Mobile menu toggle
  const [reportOpen, setReportOpen] = useState(false); // Report dropdown toggle
  const [dataOpen, setDataOpen] = useState(false); // Manage Data dropdown toggle
  const navigate = useNavigate();

  // ---------- Handlers ----------
  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleReport = () => setReportOpen(!reportOpen);
  const toggleData = () => setDataOpen(!dataOpen);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setReportOpen(false);
    setDataOpen(false);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      SweetAlert.show("Logout Failed", "No access token found.", "error");
      return;
    }

    try {
      const response = await axios.post(
        `${URL_BACKEND}/api/logout`, // ✅ Correct route
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        localStorage.clear();
        SweetAlert.show("Logged Out", "You have been logged out successfully.", "success");
        navigate('/role/admin/Login');
      } else {
        SweetAlert.show("Logout Failed", response.data.message || "Unknown error occurred.", "error");
      }
    } catch (error) {
      console.error('Logout error:', error);
      SweetAlert.show("Logout Failed", "An error occurred during logout. Please try again.", "error");
    }
  };

  // ---------- Render ----------
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Brand */}
        <h1 className="text-xl font-bold text-blue-500">Admin Panel</h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <button onClick={() => handleNavigation('/role/admin/Dashboard')} className="text-gray-700 hover:text-blue-500">Dashboard</button>

          {/* Reports Dropdown */}
          <div className="relative">
            <button
              onClick={toggleReport}
              className="text-gray-700 hover:text-blue-500"
            >
              Reports ▾
            </button>
            {reportOpen && (
              <div className="absolute mt-2 bg-white border rounded shadow-md w-48">
                <button onClick={() => handleNavigation('/role/admin/reports/ReportProduct')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Report Product</button>
                <button onClick={() => handleNavigation('/role/admin/reports/ReportCompany')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Report Company</button>
                <button onClick={() => handleNavigation('/role/admin/reports/ReportPerson')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Report Person</button>
                <button onClick={() => handleNavigation('/role/admin/reports/ReportPromotionCode')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Report Promotion Code</button>
                <button onClick={() => handleNavigation('/role/admin/reports/ReportAnalytics')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Report Analytics</button>
              </div>
            )}
          </div>

          {/* Manage Data Dropdown */}
          <div className="relative">
            <button
              onClick={toggleData}
              className="text-gray-700 hover:text-blue-500"
            >
              Manage Data ▾
            </button>
            {dataOpen && (
              <div className="absolute mt-2 bg-white border rounded shadow-md w-56">
                <button onClick={() => handleNavigation('/role/admin/data/product/List')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Manage Product</button>
                <button onClick={() => handleNavigation('/role/admin/data/company/List')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Manage Company</button>
                <button onClick={() => handleNavigation('/role/admin/data/person/List')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Manage Person</button>
                <button onClick={() => handleNavigation('/role/admin/data/promotion_code/List')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Manage Promotion Codes</button>
                <button onClick={() => handleNavigation('/role/admin/data/gallery_manager/Main')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Manage Gallery</button>
              </div>
            )}
          </div>
        </div>

        {/* Profile & Logout (Desktop) */}
        <div className="hidden md:flex space-x-4 border-l pl-4">
          <button onClick={() => handleNavigation('/role/admin/Profile')} className="text-gray-700 hover:text-blue-500">Profile</button>
          <button onClick={() => handleNavigation('/role/admin/Setting')} className="text-gray-700 hover:text-blue-500">Settings</button>
          <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Logout</button>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden p-2 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={toggleMenu}
        >
          {isOpen ? '✖️' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-white shadow-md`}>
        <div className="flex flex-col space-y-2 px-4 py-2">
          <button onClick={() => handleNavigation('/role/admin/Dashboard')} className="text-gray-700 hover:text-blue-500">Dashboard</button>

          {/* Reports (accordion style) */}
          <button onClick={toggleReport} className="text-gray-700 hover:text-blue-500">
            Reports {reportOpen ? '▴' : '▾'}
          </button>
          {reportOpen && (
            <div className="pl-4 space-y-1">
              <button onClick={() => handleNavigation('/role/admin/reports/ReportProduct')} className="block text-left text-gray-600 hover:text-blue-500">Report Product</button>
              <button onClick={() => handleNavigation('/role/admin/reports/ReportCompany')} className="block text-left text-gray-600 hover:text-blue-500">Report Company</button>
              <button onClick={() => handleNavigation('/role/admin/reports/ReportPerson')} className="block text-left text-gray-600 hover:text-blue-500">Report Person</button>
              <button onClick={() => handleNavigation('/role/admin/reports/ReportPromotionCode')} className="block text-left text-gray-600 hover:text-blue-500">Report Promotion Code</button>
              <button onClick={() => handleNavigation('/role/admin/reports/ReportAnalytics')} className="block text-left text-gray-600 hover:text-blue-500">Report Analytics</button>
            </div>
          )}

          {/* Manage Data (accordion style) */}
          <button onClick={toggleData} className="text-gray-700 hover:text-blue-500">
            Manage Data {dataOpen ? '▴' : '▾'}
          </button>
          {dataOpen && (
            <div className="pl-4 space-y-1">
              <button onClick={() => handleNavigation('/role/admin/data/product/List')} className="block text-left text-gray-600 hover:text-blue-500">Manage Product</button>
              <button onClick={() => handleNavigation('/role/admin/data/company/List')} className="block text-left text-gray-600 hover:text-blue-500">Manage Company</button>
              <button onClick={() => handleNavigation('/role/admin/data/person/List')} className="block text-left text-gray-600 hover:text-blue-500">Manage Person</button>
              <button onClick={() => handleNavigation('/role/admin/data/promotion_code/List')} className="block text-left text-gray-600 hover:text-blue-500">Manage Promotion Codes</button>
            </div>
          )}

          <button onClick={() => handleNavigation('/role/admin/Profile')} className="text-gray-700 hover:text-blue-500">Profile</button>
          <button onClick={() => handleNavigation('/role/admin/Setting')} className="text-gray-700 hover:text-blue-500">Settings</button>
          <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
