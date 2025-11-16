// src\pages\role\admin\data\product\Add.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../../../components/navbar/Navbar';
import SweetAlert2 from '../../../../../components/alert/SweetAlert2';
import { create_product } from '../../../../../services/productService';

const Add: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    status: 'active',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create_product(formData);
      SweetAlert2.show('Success', 'Product added successfully!', 'success');
      navigate('/role/admin/data/product/List');
    } catch (err) {
      SweetAlert2.show('Error', 'Failed to add product.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Add New Product</h1>
          <button
            onClick={() => navigate('/role/admin/data/product/List')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
          >
            Back to List
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-lg p-6 space-y-4"
        >
          <input
            type="text"
            name="name"
            placeholder="Product Name *"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />

          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
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
