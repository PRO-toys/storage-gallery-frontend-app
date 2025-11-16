// src/pages/role/user/promotion_code/Claim.tsx
import React, { useMemo, useState } from "react";
import axios from "axios";
import SweetAlert2 from "../../../../components/alert/SweetAlert2";

type ApiSuccess<T> = {
  status: "success";
  message: string;
  exists?: boolean;
  data: T;
};

type ApiError = {
  status: "error";
  message: string;
  details?: string | null;
};

type PromotionCode = {
  id: number;
  company_id: number | null;
  person_id: number | null;
  code: string;
  description: string | null;
  discount_value: string | null; // comes as string from MySQL DECIMAL
  discount_type: "percentage" | "amount";
  valid_from: string | null;   // "YYYY-MM-DD HH:mm:ss" or null
  valid_until: string | null;  // same
  is_claimed: 0 | 1;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
  status: "active" | "inactive";
};

const ClaimPromotionCode: React.FC = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState<PromotionCode | null>(null);

  const URL_BACKEND = import.meta.env.VITE_BACKEND_URL as string;

  const parseDate = (s: string | null) => (s ? new Date(s.replace(" ", "T")) : null);

  const validity = useMemo(() => {
    if (!found) return { within: false, reason: "NO_RESULT" as const };
    const now = new Date();

    const start = parseDate(found.valid_from);
    const end = parseDate(found.valid_until);

    if (start && now < start) return { within: false, reason: "NOT_STARTED" as const };
    if (end && now > end) return { within: false, reason: "EXPIRED" as const };
    return { within: true, reason: "OK" as const };
  }, [found]);

  const handleSearch = async () => {
    setLoading(true);
    setFound(null);
    try {
      const url = `${URL_BACKEND}/api/role/user/search-data/search-promotion-code-by-code`;
      const res = await axios.post<ApiSuccess<PromotionCode[]> | ApiError>(url, { code: code.trim() });

      if (res.data.status === "success") {
        const rows = (res.data as ApiSuccess<PromotionCode[]>).data;
        if (rows.length === 0) {
          SweetAlert2.show("ไม่พบโค้ด", "กรุณาตรวจสอบรหัสอีกครั้ง", "warning");
          return;
        }
        // Code should be unique; take the first row.
        setFound(rows[0]);
      } else {
        const err = res.data as ApiError;
        SweetAlert2.show("ผิดพลาด", err.message || "เกิดข้อผิดพลาดในการค้นหา", "error");
      }
    } catch (e) {
      SweetAlert2.show("Error", "Server error occurred while searching.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!found) return;
    setLoading(true);
    try {
      const url = `${URL_BACKEND}/api/role/user/update-data/update-promotion-code-is-claimed-by-code`;
      const res = await axios.put<ApiSuccess<PromotionCode> | ApiError>(url, {
        code: found.code,
        is_claimed: true,
      });

      if (res.data.status === "success") {
        const updated = (res.data as ApiSuccess<PromotionCode>).data;
        setFound(updated);
        SweetAlert2.show("สำเร็จ", "คุณได้ใช้โค้ดโปรโมชั่นเรียบร้อยแล้ว", "success");
      } else {
        const err = res.data as ApiError;
        SweetAlert2.show("ผิดพลาด", err.message || "ไม่สามารถใช้โค้ดได้", "error");
      }
    } catch (e) {
      SweetAlert2.show("Error", "Server error occurred while claiming.", "error");
    } finally {
      setLoading(false);
    }
  };

  const canClaim =
    !!found &&
    found.status === "active" &&
    found.is_claimed === 0 &&
    validity.within;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-emerald-400 to-sky-500 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Claim Promotion Code</h1>

        {/* Code Input + Search */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Promotion Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Enter your code"
            disabled={loading}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !code.trim()}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Processing..." : "Search"}
          </button>
        </div>

        {/* Result Panel */}
        {found && (
          <div className="mt-6 border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-800">Code: {found.code}</div>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  found.is_claimed ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}
              >
                {found.is_claimed ? "CLAIMED" : "AVAILABLE"}
              </span>
            </div>

            {found.description && (
              <p className="mt-2 text-sm text-gray-700">{found.description}</p>
            )}

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Discount</div>
                <div className="font-medium">
                  {found.discount_type === "percentage"
                    ? `${found.discount_value ?? "0"}%`
                    : `${found.discount_value ?? "0"}`
                  }
                </div>
              </div>
              <div>
                <div className="text-gray-500">Status</div>
                <div className="font-medium capitalize">{found.status}</div>
              </div>
              <div>
                <div className="text-gray-500">Valid From</div>
                <div className="font-medium">{found.valid_from ?? "-"}</div>
              </div>
              <div>
                <div className="text-gray-500">Valid Until</div>
                <div className="font-medium">{found.valid_until ?? "-"}</div>
              </div>
              {found.claimed_at && (
                <div className="col-span-2">
                  <div className="text-gray-500">Claimed At</div>
                  <div className="font-medium">{found.claimed_at}</div>
                </div>
              )}
            </div>

            {/* Validity / Warnings */}
            {!validity.within && (
              <div className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                {validity.reason === "NOT_STARTED" && "This code is not yet active."}
                {validity.reason === "EXPIRED" && "This code has expired."}
              </div>
            )}

            {/* Claim Button */}
            <button
              onClick={handleClaim}
              disabled={!canClaim || loading}
              className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60"
            >
              {found.is_claimed
                ? "Already Claimed"
                : validity.within
                ? "Claim Now"
                : "Cannot Claim"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimPromotionCode;
