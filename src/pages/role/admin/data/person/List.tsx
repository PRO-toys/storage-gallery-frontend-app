// src/pages/role/admin/data/person/List.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../../../components/navbar/Navbar';
import TableDynamic from '../../../../../components/table/TableDynamic';
import SweetAlert2 from '../../../../../components/alert/SweetAlert2';
import {
  read_person,
  update_person,
  delete_person,
  type Person as ApiPerson,
} from '../../../../../services/personService';

type UIPerson = {
  id: number;
  company_id: number | null;
  card_id: string;
  prefix: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  affiliation: string;
  type: string; // customer | employee | guest
  code: string; // e.g., CUST001, EMP045
  participated_status: '0' | '1' | string;
  status: string; // active | inactive
  created_at: string;
  updated_at: string;
};

const normalize = (p: ApiPerson): UIPerson => ({
  id: Number(p.id),
  company_id: p.company_id != null ? Number(p.company_id) : null,
  card_id: String(p.card_id ?? ''),
  prefix: String(p.prefix ?? ''),
  name: String(p.name ?? ''),
  phone: String(p.phone ?? ''),
  email: String(p.email ?? ''),
  address: String(p.address ?? ''),
  affiliation: String(p.affiliation ?? ''),
  type: String((p.type ?? p.person_type) ?? ''),
  code: String((p.code ?? p.person_code) ?? ''),
  participated_status: (p.participated_status as '0' | '1' | string) ?? '0',
  status: String(p.status ?? 'active'),
  created_at: p.created_at ?? new Date().toISOString(),
  updated_at: p.updated_at ?? p.created_at ?? new Date().toISOString(),
});

const List: React.FC = () => {
  const [persons, setPersons] = useState<UIPerson[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await read_person();
      setPersons(data.map(normalize));
    } catch {
      SweetAlert2.show('Error', 'Failed to load persons.', 'error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleStatus = async (row: UIPerson) => {
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
          await update_person(row.id, { status: next });
          setPersons((prev) =>
            prev.map((p) => (p.id === row.id ? { ...p, status: next, updated_at: new Date().toISOString() } : p))
          );
          SweetAlert2.show('Success', `Status changed to "${next}".`, 'success');
        } catch {
          SweetAlert2.show('Error', 'Failed to update status.', 'error');
        }
      }
    );
  };

  const handleToggleParticipated = async (row: UIPerson) => {
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
          await update_person(row.id, { participated_status: next });
          setPersons((prev) =>
            prev.map((p) =>
              p.id === row.id ? { ...p, participated_status: next, updated_at: new Date().toISOString() } : p
            )
          );
          SweetAlert2.show('Success', 'Participated status updated.', 'success');
        } catch {
          SweetAlert2.show('Error', 'Failed to update participated status.', 'error');
        }
      }
    );
  };

  const handleDelete = async (row: UIPerson) => {
    SweetAlert2.show(
      'Delete Person',
      `Are you sure you want to delete "${row.name}"? This action cannot be undone.`,
      'warning',
      'Yes, delete it!',
      'Cancel',
      true,
      async () => {
        try {
          await delete_person(row.id);
          setPersons((prev) => prev.filter((p) => p.id !== row.id));
          SweetAlert2.show('Deleted', 'Person has been deleted.', 'success');
        } catch {
          SweetAlert2.show('Error', 'Failed to delete person.', 'error');
        }
      }
    );
  };

  const allColumns = [
    { key: 'id', header: 'ID', align: 'left' as const, show: true },
    { key: 'company_id', header: 'Company ID', align: 'left' as const, show: true },
    { key: 'card_id', header: 'Card ID', align: 'left' as const, show: true },
    { key: 'prefix', header: 'Prefix', align: 'left' as const, show: true },
    { key: 'name', header: 'Name', align: 'left' as const, show: true },
    { key: 'phone', header: 'Phone', align: 'left' as const, show: true },
    { key: 'email', header: 'Email', align: 'left' as const, show: true },
    { key: 'address', header: 'Address', align: 'left' as const, show: true },
    { key: 'affiliation', header: 'Affiliation', align: 'left' as const, show: true },
    { key: 'type', header: 'Type', align: 'center' as const, show: true },
    { key: 'code', header: 'Code', align: 'center' as const, show: true },
    {
      key: 'participated_status',
      header: 'Participated',
      align: 'center' as const,
      show: true,
      render: (val: '0' | '1' | string, row: UIPerson) => (
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
      render: (val: string, row: UIPerson) => (
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
      render: (_: any, row: UIPerson) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => navigate(`/role/admin/data/person/View/${row.id}`)}
            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
          >
            View
          </button>
          <button
            onClick={() => navigate(`/role/admin/data/person/Edit/${row.id}`)}
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
  const filtered = persons.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Person List</h1>
          <button
            onClick={() => navigate('/role/admin/data/person/Add')}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
          >
            + Add Person
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
