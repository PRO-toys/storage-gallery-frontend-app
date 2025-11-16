// src/pages/role/user/companies/FormCompany.tsx
import React, { useState } from 'react';
import axios from 'axios';
import SweetAlert from '../../../../components/alert/SweetAlert2';

const FormCompany: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName || !phone || !email || !address) {
      SweetAlert.show('Validation', 'Fill all fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);

      // Check if phone already exists
      const searchUrl = `${URL_BACKEND}/api/role/user/search-data/search-company-by-phone`;
      const searchResponse = await axios.post(searchUrl, { phone });

      const alreadyExists =
        searchResponse?.data?.status === 'success' &&
        (searchResponse?.data?.exists === true ||
          (Array.isArray(searchResponse?.data?.data) && searchResponse.data.data.length > 0));

      if (alreadyExists) {
        SweetAlert.show('Already registered', 'Phone is already in the system.', 'warning');
        return;
      }

      // Register
      const companyCode = `COMP_${Math.floor(1000 + Math.random() * 9000)}`;
      const createUrl = `${URL_BACKEND}/api/role/user/create-data/create-company`;

      const payload = {
        company_name: companyName,
        phone,
        email,
        address,
        company_type: 'customer',
        company_code: companyCode,
        company_tax_invoice_no: 'TX-AUTO',
        participated_status: '0',
        status: 'active',
      };

      const createResponse = await axios.post(createUrl, payload);

      if (createResponse.data.status === 'success') {
        SweetAlert.show('Registered', 'Registration completed.', 'success');
        setCompanyName('');
        setPhone('');
        setEmail('');
        setAddress('');
      } else {
        SweetAlert.show('Registration failed', createResponse.data.message || 'Try again.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      SweetAlert.show('Server error', err?.response?.data?.message || 'Try again later.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Your Company Ltd."
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="020123456"
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="email@company.com"
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="City, Country"
              required
              disabled={submitting}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`w-full text-white py-2 rounded-lg transition duration-200 ${
              submitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {submitting ? 'Registering…' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormCompany;
