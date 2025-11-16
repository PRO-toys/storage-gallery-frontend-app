// src/components/table/TableDynamic.tsx
import React, { useState } from 'react';

interface Column {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableDynamicProps<T> {
  columns: Column[];
  data: T[];
  itemsPerPage?: number;
}

const TableDynamic = <T extends Record<string, any>>({ columns, data, itemsPerPage = 4 }: TableDynamicProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState('');

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderPageNumbersDynamic = () => {
    const pageNumbers = [];
    const maxPageNumbers = 5;
    let startPage = Math.max(currentPage - 2, 1);
    let endPage = Math.min(startPage + maxPageNumbers - 1, totalPages);

    if (endPage - startPage < maxPageNumbers - 1) {
      startPage = Math.max(endPage - maxPageNumbers + 1, 1);
    }

    if (startPage > 1) {
      pageNumbers.push(<span key="start-ellipsis" className="px-2 py-1 text-gray-700">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md border ${
            currentPage === i ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-700 border-gray-400 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      pageNumbers.push(<span key="end-ellipsis" className="px-2 py-1 text-gray-700">...</span>);
    }

    return pageNumbers;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-lg rounded-xl overflow-hidden hidden md:table">
        <thead className="bg-gray-200">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 font-semibold text-gray-700 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentData.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b hover:bg-gray-100 transition duration-150">
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="md:hidden space-y-4">
        {currentData.map((row, rowIndex) => (
          <div key={rowIndex} className="bg-white shadow-md rounded-xl p-4">
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between py-1">
                <span className="font-semibold text-gray-700">{col.header}</span>
                <span className="text-gray-900">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center my-4 space-x-1">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded-md text-gray-700 hover:bg-gray-100 disabled:text-gray-300">Previous</button>
        {renderPageNumbersDynamic()}
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md text-gray-700 hover:bg-gray-100 disabled:text-gray-300">Next</button>
      </div>

      <div className="flex justify-center items-center my-2">
        <input
          type="number"
          min={1}
          max={totalPages}
          value={currentPage}
          onChange={(e) => handlePageChange(Number(e.target.value))}
          className="w-20 px-2 py-1 border rounded-md text-center"
        />
        <span className="ml-2 text-gray-700">/ {totalPages}</span>
      </div>
    </div>
  );
};

export default TableDynamic;
