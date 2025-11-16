// // src/components/export/ExportCsv.tsx
// import React from 'react';
// import exportCsvUtil from '../../utils/exportCsv';

// interface ExportCsvProps {
//   data: Record<string, any>[];
//   columns: { key: string; header: string }[];
//   filename: string;
// }

// const ExportCsv: React.FC<ExportCsvProps> = ({ data, columns, filename }) => {
//   const handleExport = () => {
//     const header = columns.map((col) => `"${col.header}"`).join(',');

//     const rows = data.map((row) =>
//       columns
//         .map((col) => {
//           let value = row[col.key];

//           if (typeof value === 'string') {
//             value = value.replace(/"/g, '""'); // Escape quotes
//           }

//           return `"${value}"`;
//         })
//         .join(',')
//     );

//     const csvString = [header, ...rows].join('\n');
//     exportCsvUtil(csvString, filename);
//   };

//   return (
//     <button
//       onClick={handleExport}
//       className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200"
//     >
//       Export CSV
//     </button>
//   );
// };

// export default ExportCsv;
