// src/components/inspiration/ModalSettings.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

export type ViewerSettings = {
  pollMs: number;
  gridCols: number;
  gridRows: number;
  gridGapPx: number;
  marginLeftPx: number;
  marginRightPx: number;
  marginTopPx: number;
  marginBottomPx: number;
  fadeMs: number;
  staggerMs: number;
};

type Props = {
  open: boolean;
  initial: ViewerSettings;
  onClose: () => void;
  onSave: (next: ViewerSettings) => void;
  title?: string;
  onResetDefaults: () => void;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="grid grid-cols-5 items-center gap-3 py-2">
    <span className="col-span-2 text-sm text-gray-700">{label}</span>
    <div className="col-span-3">{children}</div>
  </label>
);

const NumberInput: React.FC<{
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}> = ({ value, onChange, min, max, step = 1, suffix }) => (
  <div className="flex items-center gap-2">
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {suffix ? <span className="text-xs text-gray-500">{suffix}</span> : null}
  </div>
);

const ModalSettings: React.FC<Props> = ({ open, initial, onClose, onSave, title, onResetDefaults }) => {
  const [local, setLocal] = useState<ViewerSettings>(initial);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open) {
      setLocal(initial);
      const t = setTimeout(() => firstInputRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const errors = useMemo(() => {
    const es: string[] = [];
    const { pollMs, gridCols, gridRows, gridGapPx, fadeMs, staggerMs } = local;
    if (pollMs < 1000 || pollMs > 120000) es.push("Poll interval must be 1,000–120,000 ms.");
    if (gridCols < 1 || gridCols > 12) es.push("Grid columns must be 1–12.");
    if (gridRows < 1 || gridRows > 12) es.push("Grid rows must be 1–12.");
    if (gridGapPx < 0 || gridGapPx > 120) es.push("Grid gap must be 0–120 px.");
    if (fadeMs < 0 || fadeMs > 10000) es.push("Fade duration must be 0–10,000 ms.");
    if (staggerMs < 0 || staggerMs > 5000) es.push("Stagger must be 0–5,000 ms.");
    return es;
  }, [local]);

  const applyClamp = () => {
    setLocal((s) => ({
      ...s,
      pollMs: clamp(s.pollMs, 1000, 120000),
      gridCols: clamp(s.gridCols, 1, 12),
      gridRows: clamp(s.gridRows, 1, 12),
      gridGapPx: clamp(s.gridGapPx, 0, 120),
      marginLeftPx: clamp(s.marginLeftPx, 0, 400),
      marginRightPx: clamp(s.marginRightPx, 0, 400),
      marginTopPx: clamp(s.marginTopPx, 0, 400),
      marginBottomPx: clamp(s.marginBottomPx, 0, 400),
      fadeMs: clamp(s.fadeMs, 0, 10000),
      staggerMs: clamp(s.staggerMs, 0, 5000),
    }));
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="settings-title"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 id="settings-title" className="text-lg font-semibold">
            {title ?? "Viewer Settings"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200"
          >
            Close
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="grid gap-2">
            <Row label="Poll interval">
              <NumberInput
                value={local.pollMs}
                onChange={(v) => setLocal((s) => ({ ...s, pollMs: v }))}
                min={1000}
                max={120000}
                step={100}
                suffix="ms"
              />
            </Row>

            <div className="pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Grid
            </div>
            <Row label="Columns">
              <NumberInput
                value={local.gridCols}
                onChange={(v) => setLocal((s) => ({ ...s, gridCols: v }))}
                min={1}
                max={12}
              />
            </Row>
            <Row label="Rows">
              <NumberInput
                value={local.gridRows}
                onChange={(v) => setLocal((s) => ({ ...s, gridRows: v }))}
                min={1}
                max={12}
              />
            </Row>
            <Row label="Gap">
              <NumberInput
                value={local.gridGapPx}
                onChange={(v) => setLocal((s) => ({ ...s, gridGapPx: v }))}
                min={0}
                max={120}
                step={1}
                suffix="px"
              />
            </Row>

            <div className="pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Margins
            </div>
            <Row label="Left">
              <NumberInput
                value={local.marginLeftPx}
                onChange={(v) => setLocal((s) => ({ ...s, marginLeftPx: v }))}
                min={0}
                max={400}
                suffix="px"
              />
            </Row>
            <Row label="Right">
              <NumberInput
                value={local.marginRightPx}
                onChange={(v) => setLocal((s) => ({ ...s, marginRightPx: v }))}
                min={0}
                max={400}
                suffix="px"
              />
            </Row>
            <Row label="Top">
              <NumberInput
                value={local.marginTopPx}
                onChange={(v) => setLocal((s) => ({ ...s, marginTopPx: v }))}
                min={0}
                max={400}
                suffix="px"
              />
            </Row>
            <Row label="Bottom">
              <NumberInput
                value={local.marginBottomPx}
                onChange={(v) => setLocal((s) => ({ ...s, marginBottomPx: v }))}
                min={0}
                max={400}
                suffix="px"
              />
            </Row>

            <div className="pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Animation
            </div>
            <Row label="Fade duration">
              <NumberInput
                value={local.fadeMs}
                onChange={(v) => setLocal((s) => ({ ...s, fadeMs: v }))}
                min={0}
                max={10000}
                step={50}
                suffix="ms"
              />
            </Row>
            <Row label="Stagger">
              <NumberInput
                value={local.staggerMs}
                onChange={(v) => setLocal((s) => ({ ...s, staggerMs: v }))}
                min={0}
                max={5000}
                step={10}
                suffix="ms"
              />
            </Row>

            {errors.length > 0 && (
              <div className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {errors.map((e, i) => (
                  <div key={i}>• {e}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t">
          <div className="text-xs text-gray-500">
            Press <kbd className="px-1 py-0.5 rounded border">Esc</kbd> to close
          </div>
          <div className="flex gap-2">
            <button
              onClick={onResetDefaults}
              className="rounded-md px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200"
            >
              Reset
            </button>
            <button
              onClick={applyClamp}
              className="rounded-md px-4 py-2 text-sm bg-white ring-1 ring-gray-300 hover:bg-gray-50"
              title="Clamp values to valid ranges"
            >
              Validate
            </button>
            <button
              onClick={() => {
                if (errors.length) return;
                onSave(local);
              }}
              className={`rounded-md px-4 py-2 text-sm text-white ${
                errors.length ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={!!errors.length}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <button className="sr-only" aria-hidden ref={firstInputRef} />
    </div>
  );
};

export default ModalSettings;
