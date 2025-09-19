import crypto from 'crypto';

const SALT = process.env.HASH_SALT || 'dev-salt-change-me';

export function hashIp(ip: string) {
  return crypto.createHash('sha256').update(SALT + '|' + ip).digest('hex');
}

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, SALT, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex'));
    });
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const hashedPassword = await hashPassword(password);
    return hashedPassword === hash;
  } catch (error) {
    return false;
  }
}
