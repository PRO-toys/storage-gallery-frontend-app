// src/pages/role/user/persons/FormPerson.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SweetAlert from '../../../../components/alert/SweetAlert2';

const FormPerson: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [affiliation, setAffiliation] = useState('');

  const navigate = useNavigate();
  const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !email || !affiliation) {
      SweetAlert.show('Validation Error', 'Please fill in all fields.', 'error');
      return;
    }

    try {
      const searchUrl = `${URL_BACKEND}/api/role/user/search-data/search-person-by-phone`;
      const searchResponse = await axios.post(searchUrl, { phone });

      if (searchResponse.data.exists && searchResponse.data.data.length > 0) {
        const existingPerson = searchResponse.data.data[0];
        SweetAlert.show('พบผู้ใช้อยู่แล้ว', 'กำลังไปยังหน้ารับ QR Code', 'success');
        navigate(`/role/user/gallery/GenerateQRCode?qrcode=${existingPerson.person_code}&event_code=DEMO_EVENT`);
        return;
      }

      const personCode = `AUTO_${Math.floor(1000 + Math.random() * 9000)}`;

      const createUrl = `${URL_BACKEND}/api/role/user/create-data/create-person`;
      const createResponse = await axios.post(createUrl, {
        name,
        phone,
        email,
        affiliation,
        participated_status: '0',
        status: 'active',
        person_code: personCode,
      });

      if (createResponse.data.status === 'success') {
        const newPerson = createResponse.data.data;
        SweetAlert.show('สำเร็จ', 'สร้างผู้ใช้ใหม่แล้ว', 'success');
        navigate(`/role/user/gallery/GenerateQRCode?qrcode=${newPerson.person_code}&event_code=DEMO_EVENT`);
      } else {
        SweetAlert.show('เกิดข้อผิดพลาด', createResponse.data.message || 'ไม่สามารถสร้างข้อมูลได้', 'error');
      }
    } catch (err) {
      console.error(err);
      SweetAlert.show('Error', 'Server error occurred.', 'error');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Create Person</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="0801234567"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="email@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Affiliation</label>
            <input
              type="text"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Company / School"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormPerson;
