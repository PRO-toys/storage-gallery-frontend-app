// src/pages/role/admin/data/company/Add.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../../../components/navbar/Navbar';
import SweetAlert2 from '../../../../../components/alert/SweetAlert2';
import { create_company } from '../../../../../services/companyService';

const Add: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    juristic_id: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    type: '',
    code: '',
    participated_status: '0',
    status: 'active',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      SweetAlert2.show('Validation', 'Company name is required.', 'warning');
      return;
    }
    try {
      await create_company(formData);
      SweetAlert2.show('Success', 'Company added successfully!', 'success');
      navigate('/role/admin/data/company/List');
    } catch {
      SweetAlert2.show('Error', 'Failed to add company.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Add New Company</h1>
          <button
            onClick={() => navigate('/role/admin/data/company/List')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
          >
            Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-4">
          <input
            type="text"
            name="juristic_id"
            placeholder="Juristic ID (13 digits)"
            value={formData.juristic_id}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />

          <input
            type="text"
            name="name"
            placeholder="Company Name *"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select Type</option>
              <option value="supplier">Supplier</option>
              <option value="partner">Partner</option>
              <option value="customer">Customer</option>
            </select>

            <input
              type="text"
              name="code"
              placeholder="Company Code (e.g., C001)"
              value={formData.code}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />

            <select
              name="participated_status"
              value={formData.participated_status}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="0">Not Participated</option>
              <option value="1">Participated</option>
            </select>
          </div>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;
