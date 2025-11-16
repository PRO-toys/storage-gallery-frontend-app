// src/pages/role/admin/data/person/Edit.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../../../../components/navbar/Navbar';
import SweetAlert2 from '../../../../../components/alert/SweetAlert2';
import { read_person_by_id, update_person } from '../../../../../services/personService';

const Edit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    company_id: '',
    card_id: '',
    prefix: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    affiliation: '',
    type: '',
    code: '',
    participated_status: '0',
    status: 'active',
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const p = await read_person_by_id(Number(id));
        setFormData({
          company_id: p.company_id ? String(p.company_id) : '',
          card_id: p.card_id ?? '',
          prefix: p.prefix ?? '',
          name: p.name ?? '',
          phone: p.phone ?? '',
          email: p.email ?? '',
          address: p.address ?? '',
          affiliation: p.affiliation ?? '',
          type: (p.type as string) ?? (p.person_type as string) ?? '',
          code: (p.code as string) ?? (p.person_code as string) ?? '',
          participated_status: (p.participated_status as string) ?? '0',
          status: (p.status as string) ?? 'active',
        });
      } catch {
        SweetAlert2.show('Error', 'Failed to load person.', 'error');
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => {
    const payload: any = { ...formData };

    if (payload.company_id === '') payload.company_id = null;
    else payload.company_id = Number(payload.company_id);

    // Normalize optional strings: trim; drop empties
    [
      'card_id',
      'prefix',
      'phone',
      'email',
      'address',
      'affiliation',
      'type',
      'code',
    ].forEach((k) => {
      if (typeof payload[k] === 'string') {
        const v = payload[k].trim();
        if (!v) delete payload[k];
        else payload[k] = v;
      }
    });

    payload.name = String(payload.name).trim();
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!formData.name.trim()) {
      SweetAlert2.show('Validation', 'Full name is required.', 'warning');
      return;
    }

    try {
      await update_person(Number(id), buildPayload());
      SweetAlert2.show('Success', 'Person updated successfully!', 'success');
      navigate('/role/admin/data/person/List');
    } catch {
      SweetAlert2.show('Error', 'Failed to update person.', 'error');
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
          <h1 className="text-3xl font-bold text-white">Edit Person</h1>
          <div className="space-x-2">
            <button
              onClick={() => navigate('/role/admin/data/person/List')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
            >
              Back to List
            </button>
            <button
              onClick={() => navigate(`/role/admin/data/person/View/${id}`)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              View
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="company_id"
              placeholder="Company ID (optional)"
              value={formData.company_id}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="text"
              name="card_id"
              placeholder="Card ID (e.g., Thai ID 13 digits)"
              value={formData.card_id}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="text"
              name="prefix"
              placeholder="Prefix (Mr., Ms., etc.)"
              value={formData.prefix}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <input
            type="text"
            name="name"
            placeholder="Full Name *"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="affiliation"
              placeholder="Affiliation / Organization"
              value={formData.affiliation}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select Type</option>
              <option value="customer">Customer</option>
              <option value="employee">Employee</option>
              <option value="guest">Guest</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="code"
              placeholder="Person Code (e.g., CUST001)"
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
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

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
