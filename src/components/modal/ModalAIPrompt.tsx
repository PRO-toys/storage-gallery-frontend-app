// src/components/modal/ModalAIPrompt.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

export type ModalAIPromptProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promptText: string) => void;
  defaultPrompt?: string;
  title?: string;
  maxLength?: number;
};

const DEFAULT_PROMPT = "ชายหาดยามพระอาทิตย์ตก";

const ModalAIPrompt: React.FC<ModalAIPromptProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultPrompt = DEFAULT_PROMPT,
  title = "Edit AI Prompt",
  maxLength = 500,
}) => {
  const [value, setValue] = useState<string>(defaultPrompt);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Reset state & autofocus whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setValue(defaultPrompt);
      setSaving(false);
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
        const len = defaultPrompt.length;
        textareaRef.current?.setSelectionRange(len, len);
      });
    }
  }, [isOpen, defaultPrompt]);

  // Just keep the character counter (optional)
  const remaining = useMemo(() => maxLength - value.length, [maxLength, value]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      // allow empty string and do not trim
      onSave(value);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => setValue(defaultPrompt);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => !saving && onClose()}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => !saving && onClose()}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Prompt text
          </label>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full min-h-[140px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            maxLength={maxLength}
            placeholder='Describe the desired scene… e.g. "ชายหาดยามพระอาทิตย์ตก"'
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Tips: be specific (style, lighting, subject, background).</span>
            <span>
              {remaining} char{remaining === 1 ? "" : "s"} left
            </span>
          </div>

          {/* Quick presets (optional) */}
          <div className="flex flex-wrap gap-2 pt-2">
            {["ชายหาดยามพระอาทิตย์ตก", "วิวภูเขาหมอกยามเช้า", "สวนดอกไม้สไตล์สตูดิโอ"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setValue(preset);
                  requestAnimationFrame(() => textareaRef.current?.focus());
                }}
                className="px-2.5 py-1 text-xs rounded-full border hover:bg-gray-50"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={handleReset}
            disabled={saving}
            type="button"
          >
            Reset
          </button>
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={() => !saving && onClose()}
            disabled={saving}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded text-white ${saving ? "bg-purple-300 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
            onClick={handleSave}
            disabled={saving}
            type="button"
          >
            {saving ? "Saving…" : "Save Prompt"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAIPrompt;
