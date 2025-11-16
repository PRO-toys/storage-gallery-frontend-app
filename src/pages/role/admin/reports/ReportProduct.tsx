// src/pages/role/admin/reports/ReportProduct.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../../../components/navbar/Navbar';
import TableDynamic from '../../../../components/table/TableDynamic';
import exportCsv from '../../../../utils/exportCsv';
import { read_product, type Product as ApiProduct } from '../../../../services/productService';

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
    render: (val: any) => (
      <span className={`font-semibold ${val === 'active' ? 'text-green-600' : 'text-red-600'}`}>
        {String(val)}
      </span>
    ),
  },
];

const csvHeaders = [
  'Product ID',
  'Product Name',
  'Product Description',
  'Price (฿)',
  'Stock',
  'Status',
  'Created At',
];

const ReportProduct: React.FC = () => {
  const [products, setProducts] = useState<UIProduct[]>([]);
  const visibleColumns = useMemo(() => allColumns.filter((c) => c.show), []);

  useEffect(() => {
    (async () => {
      try {
        const data = await read_product();
        setProducts(data.map(normalize));
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    })();
  }, []);

  const handleDownloadCsv = () => {
    const csvContent = [
      csvHeaders,
      ...products.map(({ id, name, description, price, quantity, status, created_at }) => [
        id,
        name,
        description,
        Number(price).toLocaleString(),
        quantity,
        status,
        new Date(created_at).toLocaleString(),
      ]),
    ];
    const csvData = csvContent.map((row) => row.join(',')).join('\n');
    exportCsv(csvData, 'products_report.csv');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Product Report</h1>
          <button
            onClick={handleDownloadCsv}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Export CSV
          </button>
        </div>
        <TableDynamic columns={visibleColumns} data={products} />
      </div>
    </div>
  );
};

export default ReportProduct;
