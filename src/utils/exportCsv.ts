// src/utils/exportCsv.ts
const exportCsv = (data: string, filename: string) => {
    const csvData = '\uFEFF' + data; // BOM for UTF-8 encoding
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  export default exportCsv;
  