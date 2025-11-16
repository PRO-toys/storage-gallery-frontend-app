// src\pages\role\admin\data\product\Edit.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../../../../components/navbar/Navbar';
import SweetAlert2 from '../../../../../components/alert/SweetAlert2';
import { read_product_by_id, update_product } from '../../../../../services/productService';

const Edit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    status: 'active',
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const p = await read_product_by_id(Number(id));
        setFormData({
          name: p.name ?? '',
          description: (p.description as string) ?? '',
          price: typeof p.price === 'string' ? parseFloat(p.price) : p.price ?? 0,
          quantity: p.quantity ?? 0,
          status: (p.status as string) ?? 'active',
        });
      } catch (e) {
        SweetAlert2.show('Error', 'Failed to load product.', 'error');
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
      [name]: name === 'price' || name === 'quantity' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await update_product(Number(id), formData);
      SweetAlert2.show('Success', 'Product updated successfully!', 'success');
      navigate('/role/admin/data/product/List');
    } catch (e) {
      SweetAlert2.show('Error', 'Failed to update product.', 'error');
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
          <h1 className="text-3xl font-bold text-white">Edit Product</h1>
          <div className="space-x-2">
            <button
              onClick={() => navigate('/role/admin/data/product/List')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
            >
              Back to List
            </button>
            <button
              onClick={() => navigate(`/role/admin/data/product/View/${id}`)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              View
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-4">
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
