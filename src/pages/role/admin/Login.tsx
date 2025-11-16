// src/pages/role/admin/Login.tsx
import React, { useState } from 'react';
import axios from 'axios';
import SweetAlert from '../../../components/alert/SweetAlert2';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  // ✅ Load backend URL from .env
  const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

  const loginUser = async (email: string, password: string) => {
    try {
      const url = `${URL_BACKEND}/api/login`;
      const response = await axios.post(url, { email, password });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw error;
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      SweetAlert.show('Validation Error', 'Email and password are required.', 'error');
      return;
    }

    try {
      const result = await loginUser(email, password);

      if (result.status === 'error') {
        SweetAlert.show('Login Failed', result.message, 'error');
      } else {
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('expires_at', result.expires_at);
        SweetAlert.show('Login Successful', 'Welcome back!', 'success');
        navigate('/role/admin/Dashboard');
      }
    } catch (error) {
      SweetAlert.show('Login Failed', 'There was an error logging in.', 'error');
    }
  };

  const handleRegisterNavigation = () => {
    navigate('/role/admin/Register');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
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
            Login
          </button>
        </form>
        {/* <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={handleRegisterNavigation}
            className="text-blue-500 hover:underline focus:outline-none"
          >
            Register here
          </button>
        </p> */}
      </div>
    </div>
  );
};

export default Login;
