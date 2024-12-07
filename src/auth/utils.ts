import crypto from 'crypto';
import config from '../configs';

interface EncryptedToken {
  token: string;
  iv: string;
}

function encryptToken(token: string): EncryptedToken {
  const encryptionKey = Buffer.from(config.ENCRYPTION_KEY, 'utf-8'); // Convert key to buffer
  const iv = crypto.randomBytes(16); // Generate a secure IV
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);

  let encrypted = cipher.update(token, 'utf-8', 'hex');
  encrypted += cipher.final('hex');

  return {
    token: encrypted,
    iv: iv.toString('hex')
  };
}

function decryptToken(encryptedToken: string, iv: string): string {
  const encryptionKey = Buffer.from(config.ENCRYPTION_KEY, 'utf-8'); // Convert key to buffer
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    encryptionKey,
    Buffer.from(iv, 'hex')
  );

  let decrypted = decipher.update(encryptedToken, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
}

export { encryptToken, decryptToken };
