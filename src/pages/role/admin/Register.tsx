// src/pages/role/admin/Register.tsx
import React, { useState } from 'react';
import axios from 'axios';
import SweetAlert from '../../../components/alert/SweetAlert2';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const navigate = useNavigate();

  const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

  const registerUser = async (name: string, email: string, password: string) => {
    try {
      const url = `${URL_BACKEND}/api/register`;
      const response = await axios.post(url, { name, email, password });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw error;
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !password || !fullName) {
      SweetAlert.show('Validation Error', 'All fields are required.', 'error');
      return;
    }

    try {
      const result = await registerUser(fullName, email, password);

      if (result.status === 'error') {
        SweetAlert.show('Registration Failed', result.message, 'error');
      } else {
        SweetAlert.show('Registration Successful', 'User has been registered.', 'success');
        setFullName('');
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      SweetAlert.show('Registration Failed', 'There was an error registering the user.', 'error');
    }
  };

  const handleLoginNavigation = () => {
    navigate('/role/admin/login');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={handleLoginNavigation}
            className="text-blue-500 hover:underline focus:outline-none"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
