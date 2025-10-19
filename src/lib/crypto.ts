import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
const PEPPER = process.env.HOST_KEY_PEPPER || '';

export function makeHostKey() {
  const hostKey = randomBytes(18).toString('base64url'); // ~24 chars
  const hostKeyHash = bcrypt.hashSync(hostKey + PEPPER, 10);
  return { hostKey, hostKeyHash };
}
export function verifyHostKey(hostKey: string, hostKeyHash: string) {
  return bcrypt.compareSync(hostKey + PEPPER, hostKeyHash);
}
export function makeCode(len = 6) {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = '';
  for (let i = 0; i < len; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}
export function makeShortCode(len = 4) {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = '';
  for (let i = 0; i < len; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}
