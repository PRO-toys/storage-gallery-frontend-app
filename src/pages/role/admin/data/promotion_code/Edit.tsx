// src/pages/role/admin/data/promotion_code/Edit.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../../../../components/navbar/Navbar';
import SweetAlert2 from '../../../../../components/alert/SweetAlert2';
import {
  read_promotion_code_by_id,
  update_promotion_code,
  type PromotionCode as ApiPromotionCode,
} from '../../../../../services/promotionCodeService';
import { read_company, type Company as ApiCompany } from '../../../../../services/companyService';
import { read_person, type Person as ApiPerson } from '../../../../../services/personService';

// Helpers for <input type="datetime-local"> formatting
const toDateTimeLocal = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

const toISOorNull = (val: string) => (val ? new Date(val).toISOString() : null);

const Edit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companies, setCompanies] = useState<ApiCompany[]>([]);
  const [persons, setPersons] = useState<ApiPerson[]>([]);

  const [formData, setFormData] = useState({
    company_id: '' as string | number,
    person_id: '' as string | number,
    code: '',
    description: '',
    discount_type: '' as '' | 'percentage' | 'amount',
    discount_value: 0 as number | string,
    valid_from: '',
    valid_until: '',
    is_redeemed: '0' as '0' | '1' | string,
    redeemed_at: '',
    status: 'active' as 'active' | 'inactive' | string,
  });

  const discountTypeOptions = useMemo(
    () => [
      { value: '', label: '— Select Type —' },
      { value: 'percentage', label: 'Percentage' },
      { value: 'amount', label: 'Amount' },
    ],
    []
  );

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const [pc, comps, pers] = await Promise.all([
          read_promotion_code_by_id(Number(id)),
          read_company(),
          read_person(),
        ]);

        setCompanies(comps);
        setPersons(pers);

        setFormData({
          company_id: pc.company_id ?? '',
          person_id: pc.person_id ?? '',
          code: pc.code ?? '',
          description: pc.description ?? '',
          discount_type: (pc.discount_type as 'percentage' | 'amount' | '') ?? '',
          discount_value:
            typeof pc.discount_value === 'string'
              ? parseFloat(pc.discount_value)
              : (pc.discount_value ?? 0),
          valid_from: toDateTimeLocal(pc.valid_from ?? undefined),
          valid_until: toDateTimeLocal(pc.valid_until ?? undefined),
          is_redeemed: (pc.is_redeemed as '0' | '1' | string) ?? '0',
          redeemed_at: toDateTimeLocal(pc.redeemed_at ?? undefined),
          status: (pc.status as 'active' | 'inactive' | string) ?? 'active',
        });
      } catch (e) {
        SweetAlert2.show('Error', 'Failed to load promotion code.', 'error');
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
      [name]: name === 'discount_value' ? Number(value) : value,
    }));
  };

  // Keep redeemed_at in sync with is_redeemed
  useEffect(() => {
    setFormData((prev) => {
      if (prev.is_redeemed === '1') {
        // if redeemed and no timestamp, set now (local)
        return { ...prev, redeemed_at: prev.redeemed_at || toDateTimeLocal(new Date().toISOString()) };
      }
      // if not redeemed, clear timestamp
      return { ...prev, redeemed_at: '' };
    });
  }, [formData.is_redeemed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!String(formData.code).trim()) {
      SweetAlert2.show('Validation', 'Code is required.', 'warning');
      return;
    }

    try {
      setSaving(true);
      await update_promotion_code(Number(id), {
        company_id: formData.company_id ? Number(formData.company_id) : undefined,
        person_id: formData.person_id ? Number(formData.person_id) : undefined,
        code: formData.code || undefined,
        description: formData.description || undefined,
        discount_type: formData.discount_type || undefined,
        discount_value: Number(formData.discount_value) || 0,
        valid_from: toISOorNull(formData.valid_from) ?? undefined,
        valid_until: toISOorNull(formData.valid_until) ?? undefined,
        is_redeemed: formData.is_redeemed,
        redeemed_at: toISOorNull(formData.redeemed_at) ?? undefined,
        status: formData.status,
      });
      SweetAlert2.show('Success', 'Promotion code updated successfully!', 'success');
      navigate('/role/admin/data/promotion_code/List');
    } catch (e) {
      SweetAlert2.show('Error', 'Failed to update promotion code.', 'error');
    } finally {
      setSaving(false);
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
          <h1 className="text-3xl font-bold text-white">Edit Promotion Code</h1>
          <div className="space-x-2">
            <button
              onClick={() => navigate('/role/admin/data/promotion_code/List')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
            >
              Back to List
            </button>
            <button
              onClick={() => navigate(`/role/admin/data/promotion_code/View/${id}`)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              View
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <select
                name="company_id"
                value={String(formData.company_id)}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">— None —</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Person</label>
              <select
                name="person_id"
                value={String(formData.person_id)}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">— None —</option>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
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

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="discount_type"
              value={formData.discount_type}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            >
              {discountTypeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="discount_value"
              placeholder="Discount Value"
              value={formData.discount_value}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Redeemed?</label>
              <select
                name="is_redeemed"
                value={formData.is_redeemed}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Redeemed At</label>
              <input
                type="datetime-local"
                name="redeemed_at"
                value={formData.redeemed_at}
                onChange={handleChange}
                disabled={formData.is_redeemed !== '1'}
                className="w-full p-3 border rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3 rounded-lg"
          >
            {saving ? 'Updating...' : 'Update'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Edit;
