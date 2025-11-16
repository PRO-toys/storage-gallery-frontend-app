// src/pages/role/admin/reports/ReportPerson.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../../../components/navbar/Navbar';
import TableDynamic from '../../../../components/table/TableDynamic';
import exportCsv from '../../../../utils/exportCsv';
import { read_person, type Person as ApiPerson } from '../../../../services/personService';

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
  'Person ID',
  'Company ID',
  'Card ID',
  'Prefix',
  'Full Name',
  'Phone',
  'Email',
  'Address',
  'Affiliation',
  'Type',
  'Code',
  'Participated',
  'Status',
  'Created At',
];

const ReportPerson: React.FC = () => {
  const [persons, setPersons] = useState<UIPerson[]>([]);
  const visibleColumns = useMemo(() => allColumns.filter((c) => c.show), []);

  useEffect(() => {
    (async () => {
      try {
        const data = await read_person();
        setPersons(data.map(normalize));
      } catch (error) {
        console.error('Failed to fetch persons:', error);
      }
    })();
  }, []);

  const handleDownloadCsv = () => {
    const rows = persons.map(
      ({
        id,
        company_id,
        card_id,
        prefix,
        name,
        phone,
        email,
        address,
        affiliation,
        type,
        code,
        participated_status,
        status,
        created_at,
      }) => [
        id,
        company_id ?? '',
        card_id,
        prefix,
        name,
        phone,
        email,
        address.replace(/[\r\n]+/g, ' '),
        affiliation,
        type,
        code,
        participated_status === '1' ? 'Yes' : 'No',
        status,
        new Date(created_at).toLocaleString(),
      ]
    );

    const csvContent = [csvHeaders, ...rows];
    const csvData = csvContent.map((r) => r.join(',')).join('\n');
    exportCsv(csvData, 'persons_report.csv');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Person Report</h1>
          <button
            onClick={handleDownloadCsv}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Export CSV
          </button>
        </div>
        <TableDynamic columns={visibleColumns} data={persons} />
      </div>
    </div>
  );
};

export default ReportPerson;
