// src/pages/demo/webhook/product/Webhook.tsx
import React, { useState } from 'react';

type FormState = {
  name: string;
  description: string;
  price: string;
  quantity: string;
};

const DEMOS: FormState[] = [
  { name: 'Demo T-Shirt', description: 'Blue cotton tee, size M', price: '199', quantity: '25' },
  { name: 'Wireless Mouse Pro', description: 'Ergonomic 2.4GHz mouse', price: '499', quantity: '12' },
  { name: 'Travel Backpack 25L', description: 'Water-resistant with laptop sleeve', price: '899', quantity: '8' },
  { name: 'Sneakers RunLite', description: 'Lightweight running shoes', price: '1299', quantity: '20' },
];

const Webhook: React.FC = () => {
  const [formData, setFormData] = useState<FormState>({ name: '', description: '', price: '', quantity: '' });

  const backend =
    (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/+$/, '') || 'http://127.0.0.1:8000';
  const endpoint = `${backend}/webhook-products`;

  const fillDemo = () => {
    const pick = DEMOS[Math.floor(Math.random() * DEMOS.length)];
    setFormData(pick);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold">Test Laravel Webhook (Products)</h1>
        <p className="mb-6 break-all text-center text-sm text-gray-500">{endpoint}</p>

        <form action={endpoint} method="POST" className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fillDemo}
              className="flex-1 rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 font-semibold text-gray-800 transition hover:bg-gray-200"
            >
              Fill Demo Data
            </button>
          </div>

          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            required
          />

          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            required
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700"
          >
            Submit Form (Follow Redirect)
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          Submits a real form → Laravel logs → controller redirects.
        </p>
      </div>
    </div>
  );
};

export default Webhook;
