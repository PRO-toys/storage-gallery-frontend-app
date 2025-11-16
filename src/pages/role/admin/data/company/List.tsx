// src/pages/role/admin/data/company/List.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../../../components/navbar/Navbar';
import TableDynamic from '../../../../../components/table/TableDynamic';
import SweetAlert2 from '../../../../../components/alert/SweetAlert2';
import {
  read_company,
  update_company,
  delete_company,
  type Company as ApiCompany,
} from '../../../../../services/companyService';

type UICompany = {
  id: number;
  juristic_id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  type: string; // supplier | partner | customer
  code: string;
  participated_status: '0' | '1' | string; // 0 = no, 1 = yes
  status: string; // active | inactive
  created_at: string;
  updated_at: string;
};

const normalize = (c: ApiCompany): UICompany => ({
  id: Number(c.id),
  juristic_id: String(c.juristic_id ?? ''),
  name: String(c.name ?? ''),
  phone: String(c.phone ?? ''),
  email: String(c.email ?? ''),
  address: String(c.address ?? ''),
  type: String(c.type ?? ''),
  code: String(c.code ?? ''),
  participated_status: (c.participated_status as '0' | '1' | string) ?? '0',
  status: String(c.status ?? 'active'),
  created_at: c.created_at ?? new Date().toISOString(),
  updated_at: c.updated_at ?? c.created_at ?? new Date().toISOString(),
});

const List: React.FC = () => {
  const [companies, setCompanies] = useState<UICompany[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await read_company();
      setCompanies(data.map(normalize));
    } catch {
      SweetAlert2.show('Error', 'Failed to load companies.', 'error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleStatus = async (row: UICompany) => {
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
          await update_company(row.id, { status: next });
          setCompanies((prev) =>
            prev.map((c) => (c.id === row.id ? { ...c, status: next, updated_at: new Date().toISOString() } : c))
          );
          SweetAlert2.show('Success', `Status changed to "${next}".`, 'success');
        } catch {
          SweetAlert2.show('Error', 'Failed to update status.', 'error');
        }
      }
    );
  };

  const handleToggleParticipated = async (row: UICompany) => {
    const next = row.participated_status === '1' ? '0' : '1';
    SweetAlert2.show(
      'Change Participated',
      `Mark "${row.name}" as ${next === '1' ? 'Participated' : 'Not Participated'}?`,
      'warning',
      'Yes, change it!',
      'Cancel',
      true,
      async () => {
        try {
          await update_company(row.id, { participated_status: next });
          setCompanies((prev) =>
            prev.map((c) =>
              c.id === row.id ? { ...c, participated_status: next, updated_at: new Date().toISOString() } : c
            )
          );
          SweetAlert2.show('Success', 'Participated status updated.', 'success');
        } catch {
          SweetAlert2.show('Error', 'Failed to update participated status.', 'error');
        }
      }
    );
  };

  const handleDelete = async (row: UICompany) => {
    SweetAlert2.show(
      'Delete Company',
      `Are you sure you want to delete "${row.name}"? This action cannot be undone.`,
      'warning',
      'Yes, delete it!',
      'Cancel',
      true,
      async () => {
        try {
          await delete_company(row.id);
          setCompanies((prev) => prev.filter((c) => c.id !== row.id));
          SweetAlert2.show('Deleted', 'Company has been deleted.', 'success');
        } catch {
          SweetAlert2.show('Error', 'Failed to delete company.', 'error');
        }
      }
    );
  };

  const allColumns = [
    { key: 'id', header: 'ID', align: 'left' as const, show: true },
    { key: 'juristic_id', header: 'Juristic ID', align: 'left' as const, show: true },
    { key: 'name', header: 'Company Name', align: 'left' as const, show: true },
    { key: 'phone', header: 'Phone', align: 'left' as const, show: true },
    { key: 'email', header: 'Email', align: 'left' as const, show: true },
    { key: 'address', header: 'Address', align: 'left' as const, show: true },
    { key: 'type', header: 'Type', align: 'center' as const, show: true },
    { key: 'code', header: 'Code', align: 'center' as const, show: true },
    {
      key: 'participated_status',
      header: 'Participated',
      align: 'center' as const,
      show: true,
      render: (val: '0' | '1' | string, row: UICompany) => (
        <span
          className={`font-semibold cursor-pointer ${
            val === '1' ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'
          }`}
          onClick={() => handleToggleParticipated(row)}
        >
          {val === '1' ? 'Yes' : 'No'}
        </span>
      ),
    },
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
      render: (val: string, row: UICompany) => (
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
      render: (_: any, row: UICompany) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => navigate(`/role/admin/data/company/View/${row.id}`)}
            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
          >
            View
          </button>
          <button
            onClick={() => navigate(`/role/admin/data/company/Edit/${row.id}`)}
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
  const filtered = companies.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Company List</h1>
          <button
            onClick={() => navigate('/role/admin/data/company/Add')}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
          >
            + Add Company
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search by name / phone / code..."
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
