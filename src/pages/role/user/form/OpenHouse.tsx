// src/pages/role/user/form/OpenHouse.tsx
import React, { useState } from 'react';
import axios from 'axios';
import SweetAlert from '../../../../components/alert/SweetAlert2';
import logo1 from '../../../../assets/images/role/user/demo/form/logo1.png';

const OpenHouse: React.FC = () => {
  const URL_BACKEND = import.meta.env.VITE_BACKEND_URL as string;

  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [personName, setPersonName] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [loading, setLoading] = useState(false);

  const API = {
    searchCompanyByPhone: `${URL_BACKEND}/api/role/user/search-data/search-company-by-phone`,
    searchPersonByPhone : `${URL_BACKEND}/api/role/user/search-data/search-person-by-phone`,
    createCompany       : `${URL_BACKEND}/api/role/user/create-data/create-company`,
    createPerson        : `${URL_BACKEND}/api/role/user/create-data/create-person`,
  };

  const validate = () => {
    if (!companyName.trim() || !companyEmail.trim() || !personName.trim() || !mobilePhone.trim()) {
      SweetAlert.show('Validation Error', 'All fields are required.', 'error');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail)) {
      SweetAlert.show('Invalid Email', 'Please enter a valid official email.', 'error');
      return false;
    }
    if (!/^[0-9+\-\s]{6,}$/.test(mobilePhone)) {
      SweetAlert.show('Invalid Phone', 'Please enter a valid mobile phone.', 'error');
      return false;
    }
    return true;
  };

  const findCompanyByPhone = async (phone: string) => {
    const { data } = await axios.post(API.searchCompanyByPhone, { phone });
    return data?.exists ? data.data : null;
  };

  const findPersonByPhone = async (phone: string) => {
    const { data } = await axios.post(API.searchPersonByPhone, { phone });
    return data?.exists ? data.data : null;
  };

  const createCompany = async (payload: {
    name: string;
    email?: string;
    phone?: string;
    address?: string | null;
    type?: string | null;
    code?: string | null;
    participated_status?: string | null;
    status?: string;
  }) => {
    const { data } = await axios.post(API.createCompany, payload);
    return data?.data;
  };

  const createPerson = async (payload: {
    company_id?: number | null;
    name: string;
    phone: string;
    email?: string | null;
    prefix?: string | null;
    address?: string | null;
    affiliation?: string | null;
    type?: string | null;
    code?: string | null;
    participated_status?: string | null;
    status?: string;
  }) => {
    const { data } = await axios.post(API.createPerson, payload);
    return data?.data;
  };

  const resetForm = () => {
    setCompanyName('');
    setCompanyEmail('');
    setPersonName('');
    setMobilePhone('');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const phone = mobilePhone.trim();

      const existingPerson = await findPersonByPhone(phone);
      if (existingPerson) {
        SweetAlert.show(
          'Already Registered',
          `This mobile number is already registered.\n(Person ID: ${existingPerson.id})`,
          'warning'
        );
        return;
      }

      let company = await findCompanyByPhone(phone);
      if (!company) {
        company = await createCompany({
          name: companyName.trim(),
          email: companyEmail.trim(),
          phone,
          status: 'active',
          type: 'customer',
        });
      }

      const person = await createPerson({
        company_id: company?.id ?? null,
        name: personName.trim(),
        phone,
        status: 'active',
        type: 'customer',
      });

      SweetAlert.show(
        'Registered',
        `Success!\nCompany ID: ${company?.id ?? '—'}\nPerson ID: ${person?.id ?? '—'}`,
        'success'
      );
      resetForm();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Unexpected error occurred.';
      SweetAlert.show('Failed', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-4">
          <img src={logo1} alt="Logo" className="w-[200px] md:w-[300px] h-auto object-contain" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-6">Register</h1>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Co., Ltd."
              className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
            <input
              type="email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              placeholder="contact@acme.co.th"
              className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Contact Person</label>
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Mr./Ms. Full Name"
              className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Phone</label>
            <input
              type="tel"
              value={mobilePhone}
              onChange={(e) => setMobilePhone(e.target.value)}
              placeholder="089XXXXXXX"
              className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition ${
              loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Processing…' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OpenHouse;
