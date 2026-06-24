import { prisma } from '../../server/lib/prisma.js';
import {
  verifyPassword,
  signToken,
  setAuthCookie,
  setCorsHeaders,
  stripUser,
} from '../../server/lib/auth.js';
import { parseBody, loginSchema, ValidationError } from '../../server/lib/validate.js';

export default async function handler(req, res) {
  setCorsHeaders(res, req);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const data = parseBody(loginSchema, body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    setAuthCookie(res, token);

    return res.status(200).json({ user: stripUser(user), token });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    console.error('[auth/login] error:', err.message);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
