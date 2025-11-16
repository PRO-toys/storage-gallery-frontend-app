// src/pages/role/admin/data/promotion_code/Add.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../../../components/navbar/Navbar';
import SweetAlert2 from '../../../../../components/alert/SweetAlert2';
import { create_promotion_code } from '../../../../../services/promotionCodeService';
import { read_company, type Company } from '../../../../../services/companyService';
import { read_person, type Person } from '../../../../../services/personService';

const Add: React.FC = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);

  const [formData, setFormData] = useState({
    company_id: '',
    person_id: '',
    code: '',
    description: '',
    discount_value: 0,
    discount_type: '', // percentage | amount
    valid_from: '', // yyyy-MM-ddTHH:mm (local)
    valid_until: '',
    is_redeemed: '0', // 0 | 1
    status: 'active',
  });

  useEffect(() => {
    (async () => {
      try {
        const [cs, ps] = await Promise.all([read_company(), read_person()]);
        setCompanies(cs);
        setPersons(ps);
      } catch {
        // non-blocking
      }
    })();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'discount_value' ? Number(value) : value,
    }));
  };

  const toSqlDatetime = (local: string) => {
    // Input from <input type="datetime-local"> like "2025-01-31T13:45"
    // Backend expects a DATETIME string (no timezone). We'll pass as-is if present.
    return local ? local.replace('T', ' ') + ':00' : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      SweetAlert2.show('Validation', 'Promotion code is required.', 'warning');
      return;
    }

    try {
      const payload: Record<string, any> = {
        code: formData.code.trim(),
        description: formData.description || undefined,
        discount_value:
          typeof formData.discount_value === 'number' ? formData.discount_value : Number(formData.discount_value || 0),
        discount_type: formData.discount_type || undefined,
        valid_from: toSqlDatetime(formData.valid_from) || undefined,
        valid_until: toSqlDatetime(formData.valid_until) || undefined,
        is_redeemed: formData.is_redeemed,
        status: formData.status,
      };

      if (formData.company_id) payload.company_id = Number(formData.company_id);
      if (formData.person_id) payload.person_id = Number(formData.person_id);

      await create_promotion_code(payload);
      SweetAlert2.show('Success', 'Promotion code created successfully!', 'success');
      navigate('/role/admin/data/promotion_code/List');
    } catch (err) {
      SweetAlert2.show('Error', 'Failed to create promotion code.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Add Promotion Code</h1>
          <button
            onClick={() => navigate('/role/admin/data/promotion_code/List')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
          >
            Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <select
                name="company_id"
                value={formData.company_id}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">— Optional —</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Person</label>
              <select
                name="person_id"
                value={formData.person_id}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">— Optional —</option>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="code"
              placeholder="Promotion Code *"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="text"
              name="description"
              placeholder="Description (e.g., 10% off)"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              name="discount_value"
              placeholder="Discount Value"
              value={formData.discount_value}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
            <select
              name="discount_type"
              value={formData.discount_type}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select Type</option>
              <option value="percentage">Percentage</option>
              <option value="amount">Amount</option>
            </select>
            <select
              name="is_redeemed"
              value={formData.is_redeemed}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="0">Not Redeemed</option>
              <option value="1">Redeemed</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
              <input
                type="datetime-local"
                name="valid_from"
                value={formData.valid_from}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
              <input
                type="datetime-local"
                name="valid_until"
                value={formData.valid_until}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>
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
