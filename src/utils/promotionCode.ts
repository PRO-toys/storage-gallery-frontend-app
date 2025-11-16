// src/utils/promotionCode.ts
export type GenerateOptions = {
  length?: number;        // random length (excluding prefix)
  prefix?: string;        // prefix for each code
  alphabet?: string;      // allowed characters
  ensureUnique?: boolean; // prevent duplicates in one batch
  maxPerBatch?: number;   // optional override for max per batch (default 10)
};

// Default: uppercase letters + digits (no 0, O, I, 1 to avoid confusion)
const DEFAULT_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DEFAULT_MAX_PER_BATCH = 10;

/**
 * Generate one random code string.
 */
export const generateCode = (
  length: number = 8,
  alphabet: string = DEFAULT_ALPHABET
): string => {
  let out = '';
  const max = alphabet.length;
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * max);
    out += alphabet[idx];
  }
  return out;
};

/**
 * Generate multiple promotion codes (capped at maxPerBatch).
 */
export const generatePromotionCodes = (
  count: number,
  options: GenerateOptions = {}
): string[] => {
  const {
    length = 8,
    prefix = '',
    alphabet = DEFAULT_ALPHABET,
    ensureUnique = true,
    maxPerBatch = DEFAULT_MAX_PER_BATCH,
  } = options;

  // Clamp count between 1 and maxPerBatch
  const capped = Math.max(1, Math.min(maxPerBatch, Math.floor(count || 1)));

  const out: string[] = [];
  const seen = new Set<string>();

  while (out.length < capped) {
    const code = `${prefix}${generateCode(length, alphabet)}`;
    if (!ensureUnique || !seen.has(code)) {
      out.push(code);
      if (ensureUnique) seen.add(code);
    }
  }

  return out;
};

/**
 * Split array into chunks.
 */
export const chunk = <T>(arr: T[], size: number): T[][] => {
  if (size <= 0) return [arr];
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
};

/**
 * Validate that valid_until >= valid_from when both provided (datetime-local).
 */
export const isValidDateRange = (from?: string, until?: string): boolean => {
  if (!from || !until) return true;
  const fromTime = new Date(from).getTime();
  const untilTime = new Date(until).getTime();
  if (isNaN(fromTime) || isNaN(untilTime)) return true;
  return untilTime >= fromTime;
};