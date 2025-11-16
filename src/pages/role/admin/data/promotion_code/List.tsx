import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../../../components/navbar/Navbar';
import TableDynamic from '../../../../../components/table/TableDynamic';
import SweetAlert2 from '../../../../../components/alert/SweetAlert2';
import ModalGeneratePromotionCode from '../../../../../components/modal/ModalGeneratePromotionCode';
import {
  read_promotion_code,
  update_promotion_code,
  delete_promotion_code,
  type PromotionCode as ApiPromotionCode,
} from '../../../../../services/promotionCodeService';

// UI model
type UIPromotionCode = {
  id: number;
  company_id: number | null;
  person_id: number | null;
  code: string;
  description: string;
  discount_value: number;
  discount_type: string; // percentage | amount | other
  valid_from: string | null;
  valid_until: string | null;
  is_redeemed: '0' | '1' | string;
  redeemed_at: string | null;
  status: string; // active | inactive
  created_at: string;
  updated_at: string;
};

const normalize = (p: ApiPromotionCode): UIPromotionCode => ({
  id: Number(p.id),
  company_id: (p.company_id as number | null) ?? null,
  person_id: (p.person_id as number | null) ?? null,
  code: String(p.code ?? ''),
  description: String(p.description ?? ''),
  discount_value: typeof p.discount_value === 'string' ? parseFloat(p.discount_value) : Number(p.discount_value ?? 0),
  discount_type: String(p.discount_type ?? ''),
  valid_from: p.valid_from ?? null,
  valid_until: p.valid_until ?? null,
  is_redeemed: (p.is_redeemed as '0' | '1' | string) ?? '0',
  redeemed_at: p.redeemed_at ?? null,
  status: String(p.status ?? 'active'),
  created_at: p.created_at ?? new Date().toISOString(),
  updated_at: p.updated_at ?? p.created_at ?? new Date().toISOString(),
});

const List: React.FC = () => {
  const [promos, setPromos] = useState<UIPromotionCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openGenerate, setOpenGenerate] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await read_promotion_code();
      setPromos(data.map(normalize));
    } catch (e) {
      SweetAlert2.show('Error', 'Failed to load promotion codes.', 'error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleStatus = async (row: UIPromotionCode) => {
    const next = row.status === 'active' ? 'inactive' : 'active';
    SweetAlert2.show(
      'Change Status',
      `Change status of code "${row.code || row.id}" to "${next}"?`,
      'warning',
      'Yes, change it!',
      'Cancel',
      true,
      async () => {
        try {
          await update_promotion_code(row.id, { status: next });
          setPromos((prev) => prev.map((p) => (p.id === row.id ? { ...p, status: next, updated_at: new Date().toISOString() } : p)));
          SweetAlert2.show('Success', `Status changed to "${next}".`, 'success');
        } catch {
          SweetAlert2.show('Error', 'Failed to update status.', 'error');
        }
      }
    );
  };

  const handleToggleRedeem = async (row: UIPromotionCode) => {
    const next = row.is_redeemed === '1' ? '0' : '1';
    const confirmMsg = next === '1' ? 'mark as redeemed?' : 'mark as not redeemed?';

    SweetAlert2.show(
      'Redeem Status',
      `For code "${row.code || row.id}", ${confirmMsg}`,
      'warning',
      'Yes, change it!',
      'Cancel',
      true,
      async () => {
        try {
          const payload: Record<string, any> = { is_redeemed: next };
          if (next === '1') {
            payload.redeemed_at = new Date().toISOString();
          } else {
            payload.redeemed_at = null;
          }
          await update_promotion_code(row.id, payload);
          setPromos((prev) =>
            prev.map((p) =>
              p.id === row.id
                ? { ...p, is_redeemed: next, redeemed_at: payload.redeemed_at, updated_at: new Date().toISOString() }
                : p
            )
          );
          SweetAlert2.show('Success', 'Redeem status updated.', 'success');
        } catch {
          SweetAlert2.show('Error', 'Failed to update redeem status.', 'error');
        }
      }
    );
  };

  const handleDelete = async (row: UIPromotionCode) => {
    SweetAlert2.show(
      'Delete Promotion Code',
      `Delete code "${row.code || row.id}"? This action cannot be undone.`,
      'warning',
      'Yes, delete it!',
      'Cancel',
      true,
      async () => {
        try {
          await delete_promotion_code(row.id);
          setPromos((prev) => prev.filter((p) => p.id !== row.id));
          SweetAlert2.show('Deleted', 'Promotion code has been deleted.', 'success');
        } catch {
          SweetAlert2.show('Error', 'Failed to delete promotion code.', 'error');
        }
      }
    );
  };

  const allColumns = [
    { key: 'id', header: 'ID', align: 'left' as const, show: true },
    { key: 'code', header: 'Code', align: 'left' as const, show: true },
    { key: 'description', header: 'Description', align: 'left' as const, show: true },
    {
      key: 'discount_value',
      header: 'Discount',
      align: 'right' as const,
      show: true,
      render: (_: any, row: UIPromotionCode) => `${Number(row.discount_value).toLocaleString()} ${row.discount_type || ''}`,
    },
    {
      key: 'valid_from',
      header: 'Valid From',
      align: 'center' as const,
      show: true,
      render: (val: any) => (val ? new Date(val).toLocaleString() : '-'),
    },
    {
      key: 'valid_until',
      header: 'Valid Until',
      align: 'center' as const,
      show: true,
      render: (val: any) => (val ? new Date(val).toLocaleString() : '-'),
    },
    {
      key: 'is_redeemed',
      header: 'Redeemed',
      align: 'center' as const,
      show: true,
      render: (val: '0' | '1' | string, row: UIPromotionCode) => (
        <span
          className={`font-semibold cursor-pointer ${val === '1' ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'}`}
          onClick={() => handleToggleRedeem(row)}
        >
          {val === '1' ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'redeemed_at',
      header: 'Redeemed At',
      align: 'center' as const,
      show: true,
      render: (val: any) => (val ? new Date(val).toLocaleString() : '-'),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      show: true,
      render: (val: string, row: UIPromotionCode) => (
        <span
          className={`font-semibold cursor-pointer ${val === 'active' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
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
      render: (_: any, row: UIPromotionCode) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => navigate(`/role/admin/data/promotion_code/View/${row.id}`)}
            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
          >
            View
          </button>
          <button
            onClick={() => navigate(`/role/admin/data/promotion_code/Edit/${row.id}`)}
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
  const filtered = promos.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      p.code.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.discount_type || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Promotion Codes</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpenGenerate(true)}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md"
            >
              • Generate Codes
            </button>
            <button
              onClick={() => navigate('/role/admin/data/promotion_code/Add')}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
            >
              + Add Promotion Code
            </button>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search by code / description / type..."
            className="w-full max-w-sm p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <TableDynamic columns={visibleColumns} data={filtered} />
      </div>

      {/* Modal: Generate multiple promo codes */}
      <ModalGeneratePromotionCode
        isOpen={openGenerate}
        onClose={() => setOpenGenerate(false)}
        onCreated={() => load()}
        defaultShared={{ status: 'active' }}
      />
    </div>
  );
};

export default List;
