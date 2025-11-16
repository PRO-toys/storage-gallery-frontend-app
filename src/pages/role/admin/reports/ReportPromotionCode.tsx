// src/pages/role/admin/reports/ReportPromotionCode.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../../../components/navbar/Navbar';
import TableDynamic from '../../../../components/table/TableDynamic';
import exportCsv from '../../../../utils/exportCsv';
import { read_promotion_code, type PromotionCode as ApiPromotionCode } from '../../../../services/promotionCodeService';

// ---- Types ----

type UIPromotionCode = {
  id: number;
  company_id: number | null;
  person_id: number | null;
  code: string;
  description: string;
  discount_value: number;
  discount_type: string; // percentage | amount | free text
  valid_from: string | null; // ISO string or null
  valid_until: string | null;
  is_redeemed: '0' | '1' | string;
  redeemed_at: string | null;
  status: string; // active | inactive
  created_at: string;
  updated_at: string;
};

const normalize = (r: ApiPromotionCode): UIPromotionCode => ({
  id: Number(r.id),
  company_id: r.company_id === null || r.company_id === undefined ? null : Number(r.company_id),
  person_id: r.person_id === null || r.person_id === undefined ? null : Number(r.person_id),
  code: String(r.code ?? ''),
  description: String(r.description ?? ''),
  discount_value: typeof r.discount_value === 'string' ? parseFloat(r.discount_value) : Number(r.discount_value ?? 0),
  discount_type: String(r.discount_type ?? ''),
  valid_from: r.valid_from ?? null,
  valid_until: r.valid_until ?? null,
  is_redeemed: (r.is_redeemed as '0' | '1' | string) ?? '0',
  redeemed_at: r.redeemed_at ?? null,
  status: String(r.status ?? 'active'),
  created_at: r.created_at ?? new Date().toISOString(),
  updated_at: r.updated_at ?? r.created_at ?? new Date().toISOString(),
});

// ---- Table Columns ----

const allColumns = [
  { key: 'id', header: 'ID', align: 'left' as const, show: true },
  { key: 'code', header: 'Code', align: 'left' as const, show: true },
  { key: 'description', header: 'Description', align: 'left' as const, show: true },
  {
    key: 'discount_value',
    header: 'Discount Value',
    align: 'right' as const,
    show: true,
    render: (val: any) => Number(val).toLocaleString(),
  },
  { key: 'discount_type', header: 'Type', align: 'center' as const, show: true },
  { key: 'company_id', header: 'Company ID', align: 'center' as const, show: true },
  { key: 'person_id', header: 'Person ID', align: 'center' as const, show: true },
  {
    key: 'valid_from',
    header: 'Valid From',
    align: 'center' as const,
    show: true,
    render: (val: string | null) => (val ? new Date(val).toLocaleString() : '-'),
  },
  {
    key: 'valid_until',
    header: 'Valid Until',
    align: 'center' as const,
    show: true,
    render: (val: string | null) => (val ? new Date(val).toLocaleString() : '-'),
  },
  {
    key: 'is_redeemed',
    header: 'Redeemed',
    align: 'center' as const,
    show: true,
    render: (val: '0' | '1' | string) => (
      <span className={`font-semibold ${val === '1' ? 'text-green-600' : 'text-orange-600'}`}>
        {val === '1' ? 'Yes' : 'No'}
      </span>
    ),
  },
  {
    key: 'redeemed_at',
    header: 'Redeemed At',
    align: 'center' as const,
    show: true,
    render: (val: string | null) => (val ? new Date(val).toLocaleString() : '-'),
  },
  {
    key: 'created_at',
    header: 'Created At',
    align: 'center' as const,
    show: true,
    render: (val: string) => new Date(val).toLocaleString(),
  },
  {
    key: 'status',
    header: 'Status',
    align: 'center' as const,
    show: true,
    render: (val: string) => (
      <span className={`font-semibold ${val === 'active' ? 'text-green-600' : 'text-red-600'}`}>
        {val}
      </span>
    ),
  },
];

const csvHeaders = [
  'ID',
  'Code',
  'Description',
  'Discount Value',
  'Discount Type',
  'Company ID',
  'Person ID',
  'Valid From',
  'Valid Until',
  'Redeemed',
  'Redeemed At',
  'Status',
  'Created At',
];

// ---- Component ----

const ReportPromotionCode: React.FC = () => {
  const [rows, setRows] = useState<UIPromotionCode[]>([]);
  const visibleColumns = useMemo(() => allColumns.filter((c) => c.show), []);

  useEffect(() => {
    (async () => {
      try {
        const data = await read_promotion_code();
        setRows(data.map(normalize));
      } catch (error) {
        console.error('Failed to fetch promotion codes:', error);
      }
    })();
  }, []);

  const handleDownloadCsv = () => {
    const csvContent = [
      csvHeaders,
      ...rows.map((r) => [
        r.id,
        r.code,
        r.description,
        Number(r.discount_value).toLocaleString(),
        r.discount_type,
        r.company_id ?? '',
        r.person_id ?? '',
        r.valid_from ? new Date(r.valid_from).toLocaleString() : '',
        r.valid_until ? new Date(r.valid_until).toLocaleString() : '',
        r.is_redeemed === '1' ? 'Yes' : 'No',
        r.redeemed_at ? new Date(r.redeemed_at).toLocaleString() : '',
        r.status,
        new Date(r.created_at).toLocaleString(),
      ]),
    ];
    const csvData = csvContent.map((row) => row.join(',')).join('\n');
    exportCsv(csvData, 'promotion_codes_report.csv');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Promotion Code Report</h1>
          <button
            onClick={handleDownloadCsv}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Export CSV
          </button>
        </div>
        <TableDynamic columns={visibleColumns} data={rows} />
      </div>
    </div>
  );
};

export default ReportPromotionCode;
