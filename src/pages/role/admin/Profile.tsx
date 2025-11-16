// src/pages/role/admin/Profile.tsx
import React, { useState } from 'react';
import Navbar from '../../../components/navbar/Navbar';
import useAuth from '../../../hooks/useAuth';

const Profile: React.FC = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  useAuth(setIsAuth);

  const [username, setUsername] = useState('admin');
  const [email, setEmail] = useState('admin@example.com');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert('Profile updated successfully!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-white mt-10">Profile</h1>
        <form onSubmit={handleUpdateProfile} className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-semibold">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-semibold">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>
          <button
            type="submit"
            className={`bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
