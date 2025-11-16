// src/pages/role/admin/data/company/Edit.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../../../../components/navbar/Navbar';
import SweetAlert2 from '../../../../../components/alert/SweetAlert2';
import { read_company_by_id, update_company } from '../../../../../services/companyService';

const Edit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const c = await read_company_by_id(Number(id));
        setFormData({
          juristic_id: c.juristic_id ?? '',
          name: c.name ?? '',
          phone: c.phone ?? '',
          email: c.email ?? '',
          address: c.address ?? '',
          type: c.type ?? '',
          code: c.code ?? '',
          participated_status: (c.participated_status as string) ?? '0',
          status: (c.status as string) ?? 'active',
        });
      } catch {
        SweetAlert2.show('Error', 'Failed to load company.', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

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
    if (!id) return;
    if (!formData.name.trim()) {
      SweetAlert2.show('Validation', 'Company name is required.', 'warning');
      return;
    }
    try {
      await update_company(Number(id), formData);
      SweetAlert2.show('Success', 'Company updated successfully!', 'success');
      navigate('/role/admin/data/company/List');
    } catch {
      SweetAlert2.show('Error', 'Failed to update company.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Edit Company</h1>
          <div className="space-x-2">
            <button
              onClick={() => navigate('/role/admin/data/company/List')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
            >
              Back to List
            </button>
            <button
              onClick={() => navigate(`/role/admin/data/company/View/${id}`)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              View
            </button>
          </div>
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
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg"
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
};

export default Edit;
