import crypto from 'crypto';

// Use a secure key for AES-256-CBC. In production, this should come from process.env.
// For this implementation, we will use a fallback if not provided, ensuring 32 bytes.
const ENCRYPTION_KEY = process.env.CHAT_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32);
const IV_LENGTH = 16; // For AES, this is always 16

export function encryptMessage(text) {
  if (!text) return text;
  
  // Ensure key is exactly 32 bytes (256 bits)
  let keyBuffer = Buffer.from(ENCRYPTION_KEY);
  if (keyBuffer.length > 32) {
    keyBuffer = keyBuffer.subarray(0, 32);
  } else if (keyBuffer.length < 32) {
    const paddedKey = Buffer.alloc(32);
    keyBuffer.copy(paddedKey);
    keyBuffer = paddedKey;
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptMessage(text) {
  if (!text) return text;
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    
    let keyBuffer = Buffer.from(ENCRYPTION_KEY);
    if (keyBuffer.length > 32) {
      keyBuffer = keyBuffer.subarray(0, 32);
    } else if (keyBuffer.length < 32) {
      const paddedKey = Buffer.alloc(32);
      keyBuffer.copy(paddedKey);
      keyBuffer = paddedKey;
    }

    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error('Decryption error:', err);
    return '*** Encrypted Message ***';
  }
}
