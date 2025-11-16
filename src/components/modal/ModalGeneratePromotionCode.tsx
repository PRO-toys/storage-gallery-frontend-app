// src/components/modal/ModalGeneratePromotionCode.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { create_promotion_code } from '../../services/promotionCodeService';
import SweetAlert2 from '../alert/SweetAlert2';
import {
  generatePromotionCodes,
  isValidDateRange,
  GenerateOptions,
} from '../../utils/promotionCode';

// ===== Types =====
// Discount fields are now optional to allow "description-only" codes
// and truly blank discount values.
type DiscountType = 'percentage' | 'amount';

type BaseSharedFields = {
  company_id?: number | null;
  person_id?: number | null;
  description?: string;
  discount_value?: number | null; // optional
  discount_type?: DiscountType | null; // optional, enabled only if value exists
  valid_from?: string; // datetime-local
  valid_until?: string; // datetime-local
  status: 'active' | 'inactive';
};

export type ModalGeneratePromotionCodeProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Optional: prefill shared fields */
  defaultShared?: Partial<BaseSharedFields> & { discount_value?: number | null };
  /** Optional: called with successfully created items (backend response array) */
  onCreated?: (created: any[]) => void;
};

const MAX_PER_BATCH = 10;

const ModalGeneratePromotionCode: React.FC<ModalGeneratePromotionCodeProps> = ({
  isOpen,
  onClose,
  defaultShared,
  onCreated,
}) => {
  // UI: basic generation controls
  const [count, setCount] = useState<number>(1);
  const [prefix, setPrefix] = useState<string>('');
  const [length, setLength] = useState<number>(8);

  // UI: shared payload controls (apply to every code)
  const [shared, setShared] = useState<BaseSharedFields>({
    company_id: defaultShared?.company_id ?? null,
    person_id: defaultShared?.person_id ?? null,
    description: defaultShared?.description ?? '',
    discount_value:
      typeof defaultShared?.discount_value === 'number'
        ? defaultShared!.discount_value!
        : null,
    discount_type: (defaultShared?.discount_type as DiscountType | null) ?? null,
    valid_from: defaultShared?.valid_from ?? '',
    valid_until: defaultShared?.valid_until ?? '',
    status: (defaultShared?.status as 'active' | 'inactive') ?? 'active',
  });

  // UI: advanced panel toggle
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Generated codes preview
  const [codes, setCodes] = useState<string[]>([]);
  const [generating, setGenerating] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // reset state on close
      setCount(1);
      setPrefix('');
      setLength(8);
      setCodes([]);
      setGenerating(false);
      setSubmitting(false);
      setShowAdvanced(false);
      setShared({
        company_id: defaultShared?.company_id ?? null,
        person_id: defaultShared?.person_id ?? null,
        description: defaultShared?.description ?? '',
        discount_value:
          typeof defaultShared?.discount_value === 'number'
            ? defaultShared!.discount_value!
            : null,
        discount_type: (defaultShared?.discount_type as DiscountType | null) ?? null,
        valid_from: defaultShared?.valid_from ?? '',
        valid_until: defaultShared?.valid_until ?? '',
        status: (defaultShared?.status as 'active' | 'inactive') ?? 'active',
      });
    }
  }, [isOpen, defaultShared]);

  const canGenerate = useMemo(() => {
    // Basic validation before generating preview
    if (count < 1 || count > MAX_PER_BATCH) return false;
    if (length < 1 || length > 64) return false;
    return true;
  }, [count, length]);

  const canConfirm = useMemo(() => {
    // Require preview codes and valid date range; discount can be blank
    if (codes.length === 0) return false;
    if (!isValidDateRange(shared.valid_from, shared.valid_until)) return false;
    return true;
  }, [codes, shared.valid_from, shared.valid_until]);

  const handleGenerate = () => {
    if (!canGenerate) {
      SweetAlert2.show(
        'Invalid input',
        `Please set 1–${MAX_PER_BATCH} codes and length 1–64.`,
        'warning'
      );
      return;
    }
    setGenerating(true);

    // Generate codes
    const options: GenerateOptions = {
      length,
      prefix,
      ensureUnique: true,
    };
    const result = generatePromotionCodes(count, options);
    setCodes(result);

    setTimeout(() => setGenerating(false), 200); // tiny UX delay
  };

  const handleConfirmCreate = async () => {
    if (!canConfirm) {
      SweetAlert2.show('Missing fields', 'Please complete required fields.', 'warning');
      return;
    }

    // extra validation on date range
    if (!isValidDateRange(shared.valid_from, shared.valid_until)) {
      SweetAlert2.show('Invalid dates', 'Valid Until must be after Valid From.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      // Build base payload once, excluding truly empty fields
      const base: any = {
        company_id: shared.company_id ?? null,
        person_id: shared.person_id ?? null,
        description: shared.description?.trim() || undefined,
        valid_from: shared.valid_from || undefined,
        valid_until: shared.valid_until || undefined,
        status: shared.status,
        // new table structure fields
        is_redeemed: '0' as const,
        redeemed_at: undefined,
      };

      // Only include discount fields if a value is provided
      if (shared.discount_value !== null && shared.discount_value !== undefined && !Number.isNaN(shared.discount_value)) {
        base.discount_value = shared.discount_value;
        // If discount_value exists but type is not chosen, default to 'amount'
        base.discount_type = shared.discount_type || 'amount';
      }

      // Fire all requests
      const requests = codes.map((code) =>
        create_promotion_code({
          ...base,
          code,
        })
      );

      const results = await Promise.allSettled(requests);
      const fulfilled = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map((r) => r.value);
      const rejected = results.filter((r) => r.status === 'rejected');

      if (fulfilled.length > 0) {
        SweetAlert2.show(
          'Success',
          `Created ${fulfilled.length} code(s)` + (rejected.length ? `, ${rejected.length} failed.` : '.'),
          rejected.length ? 'warning' : 'success'
        );
        onCreated?.(fulfilled);
      } else {
        SweetAlert2.show('Failed', 'No code was created.', 'error');
      }

      onClose();
    } catch (err) {
      SweetAlert2.show('Error', 'Something went wrong while creating codes.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={() => !submitting && onClose()} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Generate Promotion Codes</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => !submitting && onClose()}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {/* Generation Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">How many?</label>
              <input
                type="number"
                min={1}
                max={MAX_PER_BATCH}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(MAX_PER_BATCH, Number(e.target.value) || 1)))}
                className="w-full p-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">Max {MAX_PER_BATCH} per batch</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prefix</label>
              <input
                type="text"
                placeholder="e.g. VIP-"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Random Length</label>
              <input
                type="number"
                min={1}
                max={64}
                value={length}
                onChange={(e) => setLength(Math.max(1, Math.min(64, Number(e.target.value) || 8)))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={generating || !canGenerate}
              className={`px-4 py-2 rounded text-white ${canGenerate ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
            >
              {generating ? 'Generating…' : 'Generate Preview'}
            </button>
            <span className="text-sm text-gray-600">
              {codes.length > 0 ? `${codes.length} code(s) generated.` : 'No codes generated yet.'}
            </span>
          </div>

          {/* Preview */}
          {codes.length > 0 && (
            <div className="bg-gray-50 border rounded p-3 max-h-40 overflow-auto">
              <ul className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-y-1">
                {codes.map((c) => (
                  <li key={c} className="font-mono">{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Shared Fields */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Shared Fields (applied to all codes)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Discount Value (optional)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={shared.discount_value ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setShared((s) => ({
                      ...s,
                      discount_value: val === '' ? null : Number(val),
                      // Auto-clear type if value is blank
                      discount_type: val === '' ? null : (s.discount_type || 'amount'),
                    }));
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount Type</label>
                <select
                  value={shared.discount_type ?? ''}
                  onChange={(e) =>
                    setShared((s) => ({ ...s, discount_type: (e.target.value as DiscountType) || null }))
                  }
                  disabled={shared.discount_value === null || shared.discount_value === undefined}
                  className="w-full p-2 border rounded disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">— Select —</option>
                  <option value="amount">Amount (บาท)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={shared.status}
                  onChange={(e) =>
                    setShared((s) => ({ ...s, status: e.target.value as 'active' | 'inactive' }))
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={shared.description ?? ''}
                  onChange={(e) => setShared((s) => ({ ...s, description: e.target.value }))}
                  className="w-full p-2 border rounded"
                  placeholder="Optional description"
                />
              </div>
            </div>

            {/* Advanced */}
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {showAdvanced ? 'Hide advanced' : 'Show advanced'}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company ID</label>
                  <input
                    type="number"
                    min={0}
                    value={shared.company_id ?? ''}
                    onChange={(e) =>
                      setShared((s) => ({
                        ...s,
                        company_id: e.target.value === '' ? null : Number(e.target.value),
                      }))
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Person ID</label>
                  <input
                    type="number"
                    min={0}
                    value={shared.person_id ?? ''}
                    onChange={(e) =>
                      setShared((s) => ({
                        ...s,
                        person_id: e.target.value === '' ? null : Number(e.target.value),
                      }))
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valid From</label>
                  <input
                    type="datetime-local"
                    value={shared.valid_from ?? ''}
                    onChange={(e) => setShared((s) => ({ ...s, valid_from: e.target.value }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valid Until</label>
                  <input
                    type="datetime-local"
                    value={shared.valid_until ?? ''}
                    onChange={(e) => setShared((s) => ({ ...s, valid_until: e.target.value }))}
                    className="w-full p-2 border rounded"
                  />
                  {!isValidDateRange(shared.valid_from, shared.valid_until) && (
                    <p className="text-xs text-red-600 mt-1">Valid Until must be after Valid From.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={() => !submitting && onClose()}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded text-white ${
              canConfirm ? 'bg-green-600 hover:bg-green-700' : 'bg-green-300 cursor-not-allowed'
            }`}
            onClick={handleConfirmCreate}
            disabled={!canConfirm || submitting}
          >
            {submitting ? 'Creating…' : `Create ${codes.length || ''} Code${codes.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalGeneratePromotionCode;
