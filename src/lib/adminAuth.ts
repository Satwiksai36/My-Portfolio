import crypto from 'crypto';

const SECRET = process.env.ADMIN_SESSION_SECRET || 'fallback-secret-key-12345';

export function signToken(username: string): string {
  const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const payload = JSON.stringify({ username, expiry });
  const hmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64')}.${hmac}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadBase64, signature] = parts;
  try {
    const payload = Buffer.from(payloadBase64, 'base64').toString('utf8');
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    if (signature !== expectedSignature) return false;
    const { expiry } = JSON.parse(payload);
    if (Date.now() > expiry) return false;
    return true;
  } catch (e) {
    return false;
  }
}
