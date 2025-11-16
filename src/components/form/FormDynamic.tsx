// src/components/form/FormDynamic.tsx
import React, { useState } from 'react';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  options?: string[];
  required?: boolean;
}

interface FormDynamicProps {
  fields: FormField[];
  onSubmit: (formData: { [key: string]: string | number }) => void;
}

const FormDynamic: React.FC<FormDynamicProps> = ({ fields, onSubmit }) => {
  const [formData, setFormData] = useState<{ [key: string]: string | number }>({});

  const handleChange = (id: string, value: string | number) => {
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="flex flex-col">
          <label htmlFor={field.id} className="block mb-1 font-bold">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.type === 'select' ? (
            <select
              id={field.id}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={field.required}
            >
              <option value="">เลือก...</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              id={field.id}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={field.required}
            />
          ) : (
            <input
              id={field.id}
              type={field.type}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={field.label}
              required={field.required}
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
      >
        บันทึกข้อมูล
      </button>
    </form>
  );
};

export default FormDynamic;
