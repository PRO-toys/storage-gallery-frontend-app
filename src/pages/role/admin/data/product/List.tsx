// src\pages\role\admin\data\product\List.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../../../components/navbar/Navbar';
import TableDynamic from '../../../../../components/table/TableDynamic';
import SweetAlert2 from '../../../../../components/alert/SweetAlert2';
import {
  read_product,
  update_product,
  delete_product,
  type Product as ApiProduct,
} from '../../../../../services/productService';

type UIProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  status: string;
  created_at: string;
  updated_at: string;
};

const normalize = (p: ApiProduct): UIProduct => ({
  id: Number(p.id),
  name: String(p.name ?? ''),
  description: String(p.description ?? ''),
  price: typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price ?? 0),
  quantity: typeof p.quantity === 'number' ? p.quantity : Number(p.quantity ?? 0),
  status: String(p.status ?? 'active'),
  created_at: p.created_at ?? new Date().toISOString(),
  updated_at: p.updated_at ?? p.created_at ?? new Date().toISOString(),
});

const List: React.FC = () => {
  const [products, setProducts] = useState<UIProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await read_product();
      setProducts(data.map(normalize));
    } catch (e) {
      SweetAlert2.show('Error', 'Failed to load products.', 'error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleStatus = async (row: UIProduct) => {
    const next = row.status === 'active' ? 'inactive' : 'active';
    SweetAlert2.show(
      'Change Status',
      `Change status of "${row.name}" to "${next}"?`,
      'warning',
      'Yes, change it!',
      'Cancel',
      true,
      async () => {
        try {
          await update_product(row.id, { status: next });
          setProducts((prev) =>
            prev.map((p) => (p.id === row.id ? { ...p, status: next, updated_at: new Date().toISOString() } : p))
          );
          SweetAlert2.show('Success', `Status changed to "${next}".`, 'success');
        } catch {
          SweetAlert2.show('Error', 'Failed to update status.', 'error');
        }
      }
    );
  };

  const handleDelete = async (row: UIProduct) => {
    SweetAlert2.show(
      'Delete Product',
      `Are you sure you want to delete "${row.name}"? This action cannot be undone.`,
      'warning',
      'Yes, delete it!',
      'Cancel',
      true,
      async () => {
        try {
          await delete_product(row.id);
          setProducts((prev) => prev.filter((p) => p.id !== row.id));
          SweetAlert2.show('Deleted', 'Product has been deleted.', 'success');
        } catch {
          SweetAlert2.show('Error', 'Failed to delete product.', 'error');
        }
      }
    );
  };

  const allColumns = [
    { key: 'id', header: 'ID', align: 'left' as const, show: true },
    { key: 'name', header: 'Name', align: 'left' as const, show: true },
    { key: 'description', header: 'Description', align: 'left' as const, show: true },
    {
      key: 'price',
      header: 'Price (฿)',
      align: 'right' as const,
      show: true,
      render: (val: any) => Number(val).toLocaleString(),
    },
    { key: 'quantity', header: 'Quantity', align: 'center' as const, show: true },
    {
      key: 'created_at',
      header: 'Created At',
      align: 'center' as const,
      show: true,
      render: (val: any) => new Date(val).toLocaleString(),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      show: true,
      render: (val: string, row: UIProduct) => (
        <span
          className={`font-semibold cursor-pointer ${
            val === 'active' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
          }`}
          onClick={() => handleToggleStatus(row)}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center' as const,
      show: true,
      render: (_: any, row: UIProduct) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => navigate(`/role/admin/data/product/View/${row.id}`)}
            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
          >
            View
          </button>
          <button
            onClick={() => navigate(`/role/admin/data/product/Edit/${row.id}`)}
            className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const visibleColumns = useMemo(() => allColumns.filter((c) => c.show), []);
  const filtered = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase().trim()));

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Product List</h1>
          <button
            onClick={() => navigate('/role/admin/data/product/Add')}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
          >
            + Add Product
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search by product name..."
            className="w-full max-w-sm p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <TableDynamic columns={visibleColumns} data={filtered} />
      </div>
    </div>
  );
};

export default List;
