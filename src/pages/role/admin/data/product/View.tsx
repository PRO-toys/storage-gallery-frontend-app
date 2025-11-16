// src\pages\role\admin\data\product\View.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '../../../../../components/navbar/Navbar';
import SweetAlert2 from '../../../../../components/alert/SweetAlert2';
import { read_product_by_id, type Product as ApiProduct } from '../../../../../services/productService';

const View: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await read_product_by_id(Number(id));
        setProduct(data);
      } catch (e) {
        SweetAlert2.show('Error', 'Failed to load product.', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <p className="text-gray-800 mb-4">Product not found.</p>
          <button
            onClick={() => navigate('/role/admin/data/product/List')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const priceNumber = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price ?? 0);
  const quantityNumber = typeof product.quantity === 'number' ? product.quantity : Number(product.quantity ?? 0);

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: 'ID', value: product.id },
    { label: 'Name', value: product.name },
    { label: 'Description', value: product.description || '-' },
    { label: 'Price', value: priceNumber.toLocaleString() + ' ฿' },
    { label: 'Quantity', value: quantityNumber.toLocaleString() },
    {
      label: 'Status',
      value: (
        <span className={`font-semibold ${product.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
          {String(product.status)}
        </span>
      ),
    },
    { label: 'Created At', value: product.created_at ? new Date(product.created_at).toLocaleString() : '-' },
    { label: 'Updated At', value: product.updated_at ? new Date(product.updated_at).toLocaleString() : '-' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">View Product</h1>
          <div className="space-x-2">
            <button
              onClick={() => navigate('/role/admin/data/product/List')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
            >
              Back to List
            </button>
            <Link
              to={`/role/admin/data/product/Edit/${product.id}`}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              Edit
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <dl className="divide-y divide-gray-200">
            {rows.map((row) => (
              <div key={row.label} className="py-4 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500 col-span-1">{row.label}</dt>
                <dd className="text-sm text-gray-900 col-span-2">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default View;