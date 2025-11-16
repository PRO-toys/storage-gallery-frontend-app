// src/components/modal/ModalGivePromotionCode.tsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

/** ===== Types ===== */
export type PromotionCode = {
  id: number;
  company_id: number | null;
  person_id: number | null;
  code: string | null;
  description?: string | null;
  discount_value?: string | number | null;
  discount_type?: 'percentage' | 'amount' | null;
  valid_from?: string | null;
  valid_until?: string | null;
  is_redeemed: '0' | '1' | string;
  redeemed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  status: 'active' | 'inactive';
};

export type Person = {
  id: number;
  prefix?: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  person_type?: string | null;
  person_code?: string | null;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
};

export interface ModalGivePromotionCodeProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when a code is successfully granted */
  onGranted?: (payload: { promo: PromotionCode; person: Person }) => void;
  /** Optional: filter only active code/person */
  requireActive?: boolean;
  /** Optional title override */
  title?: string;
}

/** ===== Component ===== */
const ModalGivePromotionCode: React.FC<ModalGivePromotionCodeProps> = ({
  isOpen,
  onClose,
  onGranted,
  requireActive = true,
  title = 'Give Promotion Code',
}) => {
  const URL_BACKEND = import.meta.env.VITE_BACKEND_URL as string;

  // Promo code (first available)
  const [loadingPromo, setLoadingPromo] = useState(false);
  const [promo, setPromo] = useState<PromotionCode | null>(null);
  const [promoErr, setPromoErr] = useState<string | null>(null);

  // Person search & selection
  const [phone, setPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [personErr, setPersonErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<Person | null>(null);

  // Actions state
  const [submitting, setSubmitting] = useState(false);

  /** Reset on close */
  useEffect(() => {
    if (!isOpen) {
      setLoadingPromo(false);
      setPromo(null);
      setPromoErr(null);
      setPhone('');
      setSearching(false);
      setPeople([]);
      setPersonErr(null);
      setSelected(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  /** Load first available promo when open */
  useEffect(() => {
    if (!isOpen) return;
    const fetchPromo = async () => {
      setLoadingPromo(true);
      setPromoErr(null);
      setPromo(null);
      try {
        const body: any = {};
        if (requireActive) body.status = 'active';
        const res = await axios.post(
          `${URL_BACKEND}/api/role/admin/search-data/search-first-available-promotion-code`,
          body
        );
        const exists = !!res?.data?.exists;
        if (!exists) {
          setPromoErr('No available promotion code.');
          setPromo(null);
        } else {
          setPromo(res?.data?.data || null);
        }
      } catch (e: any) {
        setPromoErr(e?.response?.data?.message || 'Failed to load available promotion code.');
      } finally {
        setLoadingPromo(false);
      }
    };
    fetchPromo();
  }, [isOpen, URL_BACKEND, requireActive]);

  /** Debounced search people by phone */
  useEffect(() => {
    if (!isOpen) return;
    setSelected(null);
    setPersonErr(null);
    if (!phone.trim()) {
      setPeople([]);
      return;
    }

    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const body: any = { phone };
        if (requireActive) body.status = 'active';
        const res = await axios.post(
          `${URL_BACKEND}/api/role/admin/search-data/search-person-by-phone`,
          body
        );
        const row = res?.data?.data; // this API returns FIRST match
        const exists = !!res?.data?.exists;
        setPeople(exists && row ? [row] : []);
        if (!exists) setPersonErr('No person matched this phone.');
      } catch (e: any) {
        setPeople([]);
        setPersonErr(e?.response?.data?.message || 'Search failed.');
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(t);
  }, [phone, isOpen, URL_BACKEND, requireActive]);

  const canConfirm = useMemo(() => {
    return !!promo && !!selected && !submitting;
  }, [promo, selected, submitting]);

  const handleRefreshPromo = async () => {
    // reload first available promo
    try {
      setLoadingPromo(true);
      setPromoErr(null);
      setPromo(null);
      const body: any = {};
      if (requireActive) body.status = 'active';
      const res = await axios.post(
        `${URL_BACKEND}/api/role/admin/search-data/search-first-available-promotion-code`,
        body
      );
      const exists = !!res?.data?.exists;
      if (!exists) {
        setPromoErr('No available promotion code.');
        setPromo(null);
      } else {
        setPromo(res?.data?.data || null);
      }
    } catch (e: any) {
      setPromoErr(e?.response?.data?.message || 'Failed to load available promotion code.');
    } finally {
      setLoadingPromo(false);
    }
  };

  const handleConfirm = async () => {
    if (!canConfirm || !promo || !selected) return;

    const confirm = await Swal.fire({
      icon: 'question',
      title: 'Confirm give code?',
      html: `<div style="text-align:left">
              <div><b>Code:</b> <span style="font-family:monospace">${promo.code || '-'}</span></div>
              <div><b>Person:</b> ${selected.prefix ? `${selected.prefix} ` : ''}${selected.name}</div>
              <div><b>Phone:</b> ${selected.phone || '-'}</div>
            </div>`,
      showCancelButton: true,
      confirmButtonText: 'Yes, give it',
      cancelButtonText: 'Cancel',
    });
    if (!confirm.isConfirmed) return;

    try {
      setSubmitting(true);
      // Attach person_id; make sure company stays null if needed
      const updatePayload: Partial<PromotionCode> = {
        person_id: selected.id,
        company_id: null,
      };

      const putRes = await axios.put(
        `${URL_BACKEND}/api/role/admin/promotion-codes/${promo.id}`,
        updatePayload
      );

      if (putRes?.data?.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: 'Granted',
          text: `Promotion code ${promo.code || promo.id} has been granted.`,
        });
        onGranted?.({ promo: { ...promo, ...updatePayload }, person: selected });
        onClose();
      } else {
        throw new Error(putRes?.data?.message || 'Request failed');
      }
    } catch (e: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e?.response?.data?.message || e?.message || 'Unable to grant promotion code.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
            disabled={submitting}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 px-6 py-6">
          {/* Promo section */}
          <div className="rounded-xl border p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                First Available Promotion Code
              </h3>
              <button
                onClick={handleRefreshPromo}
                disabled={loadingPromo || submitting}
                className="rounded-md bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 disabled:opacity-60"
              >
                Refresh
              </button>
            </div>

            {loadingPromo && <p className="text-sm text-gray-500">Loading…</p>}
            {!loadingPromo && promoErr && (
              <p className="text-sm text-red-600">{promoErr}</p>
            )}
            {!loadingPromo && !promoErr && promo && (
              <div className="rounded-lg border p-3 text-sm">
                <div>
                  <span className="font-medium">Code:</span>{' '}
                  <span className="font-mono">{promo.code || '-'}</span>
                </div>
                {promo.description && (
                  <div>
                    <span className="font-medium">Description:</span> {promo.description}
                  </div>
                )}
                {(promo.discount_value !== null &&
                  promo.discount_value !== undefined &&
                  promo.discount_type) && (
                  <div>
                    <span className="font-medium">Discount:</span>{' '}
                    {promo.discount_value}
                    {promo.discount_type === 'percentage' ? '%' : ''}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  created_at: {promo.created_at || '-'}
                </div>
              </div>
            )}
          </div>

          {/* Person section */}
          <div className="rounded-xl border p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Give To Person</h3>

            <label className="mb-1 block text-sm text-gray-700">
              Search by phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              disabled={submitting}
            />
            {personErr && <p className="mt-2 text-sm text-red-600">{personErr}</p>}

            <div className="mt-4">
              {searching && <p className="text-sm text-gray-500">Searching…</p>}

              {!searching && people.length > 0 && (
                <div className="max-h-56 overflow-auto rounded-md border">
                  {people.map((p) => {
                    const active = selected?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelected(p)}
                        className={`flex w-full items-start gap-3 border-b p-3 text-left hover:bg-gray-50 ${
                          active ? 'bg-blue-50 ring-1 ring-blue-200' : ''
                        }`}
                        disabled={submitting}
                      >
                        <div
                          className={`mt-0.5 h-2.5 w-2.5 rounded-full ${
                            active ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          aria-hidden
                        />
                        <div className="text-sm">
                          <div className="font-medium">
                            {p.prefix ? `${p.prefix} ` : ''}
                            {p.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            Phone: {p.phone || '-'} • Email: {p.email || '-'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Code: {p.person_code || '-'} • Type: {p.person_type || '-'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {!searching && phone && people.length === 0 && !personErr && (
                <p className="text-sm text-gray-500">No persons found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`rounded-md px-4 py-2 text-sm text-white ${
              canConfirm ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300'
            }`}
          >
            {submitting ? 'Granting…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalGivePromotionCode;
