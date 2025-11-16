// src/pages/role/admin/reports/ReportCompany.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../../../components/navbar/Navbar';
import TableDynamic from '../../../../components/table/TableDynamic';
import exportCsv from '../../../../utils/exportCsv';
import { read_company, type Company as ApiCompany } from '../../../../services/companyService';

type UICompany = {
  id: number;
  juristic_id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  type: string; // supplier | partner | customer
  code: string;
  participated_status: '0' | '1' | string; // 0=Not, 1=Yes
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
    render: (val: '0' | '1' | string) => (
      <span className={`font-semibold ${val === '1' ? 'text-green-600' : 'text-orange-600'}`}>
        {val === '1' ? 'Yes' : 'No'}
      </span>
    ),
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
  'Company ID',
  'Juristic ID',
  'Company Name',
  'Phone',
  'Email',
  'Address',
  'Type',
  'Code',
  'Participated',
  'Status',
  'Created At',
];

const ReportCompany: React.FC = () => {
  const [companies, setCompanies] = useState<UICompany[]>([]);
  const visibleColumns = useMemo(() => allColumns.filter((c) => c.show), []);

  useEffect(() => {
    (async () => {
      try {
        const data = await read_company();
        setCompanies(data.map(normalize));
      } catch (error) {
        console.error('Failed to fetch companies:', error);
      }
    })();
  }, []);

  const handleDownloadCsv = () => {
    const csvContent = [
      csvHeaders,
      ...companies.map(
        ({
          id,
          juristic_id,
          name,
          phone,
          email,
          address,
          type,
          code,
          participated_status,
          status,
          created_at,
        }) => [
          id,
          juristic_id,
          name,
          phone,
          email,
          address,
          type,
          code,
          participated_status === '1' ? 'Yes' : 'No',
          status,
          new Date(created_at).toLocaleString(),
        ]
      ),
    ];
    const csvData = csvContent.map((row) => row.join(',')).join('\n');
    exportCsv(csvData, 'companies_report.csv');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Company Report</h1>
          <button
            onClick={handleDownloadCsv}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Export CSV
          </button>
        </div>
        <TableDynamic columns={visibleColumns} data={companies} />
      </div>
    </div>
  );
};

export default ReportCompany;
