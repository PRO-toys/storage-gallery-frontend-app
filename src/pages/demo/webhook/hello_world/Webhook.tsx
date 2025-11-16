// src/pages/demo/webhook/hello_world/Webhook.tsx
import React, { useEffect, useRef, useState } from 'react';

type FormState = {
  hello: string;
  note: string;
};

const DEMOS: FormState[] = [
  { hello: 'world', note: 'demo' },
  { hello: 'สวัสดี', note: 'ทดสอบ' },
  { hello: 'hello-webhook', note: 'from-react-form' },
  { hello: 'ping', note: 'pong' },
];

const WebhookHelloWorld: React.FC = () => {
  const tsRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormState>({ hello: '', note: '' });

  const backend =
    (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/+$/, '') ||
    'http://127.0.0.1:8000';
  const endpoint = `${backend}/webhook-hello`;

  useEffect(() => {
    if (tsRef.current) tsRef.current.value = new Date().toISOString();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const fillDemo = () => {
    const pick = DEMOS[Math.floor(Math.random() * DEMOS.length)];
    setFormData(pick);
    if (tsRef.current) tsRef.current.value = new Date().toISOString();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold">Hello Webhook – Form Test</h1>
        <p className="mb-6 break-all text-center text-sm text-gray-700">{endpoint}</p>

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

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Hello</span>
            <input
              type="text"
              name="hello"
              value={formData.hello}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Note</span>
            <input
              type="text"
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </label>

          <input type="hidden" name="timestamp" ref={tsRef} />

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 focus:outline-none"
          >
            Submit Form (Follow Redirect)
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          Same UX as the Product demo: fill demo data, submit as a real form, Laravel logs and redirects.
        </p>
      </div>
    </div>
  );
};

export default WebhookHelloWorld;
