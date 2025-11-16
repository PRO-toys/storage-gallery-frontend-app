// src/utils/inspiration/generateQRCodeText.ts
/**
 * Generate a short unique text for QR code.
 * Example output: f1a9b2d09b9c4
 */
export function generateQRCodeText(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 13);
}
