import crypto from 'crypto';
import { Buffer } from 'buffer';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_32_chars_long!!'; // Must be 32 chars
const IV_LENGTH = 16;

if (SECRET_KEY.length !== 32) {
  console.warn("Warning: ENCRYPTION_KEY is not 32 characters long. Security may be compromised.");
}

export const encrypt = (text: string) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { 
    encryptedData: encrypted.toString('hex'), 
    iv: iv.toString('hex') 
  };
};

export const decrypt = (text: string, ivHex: string) => {
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(text, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};