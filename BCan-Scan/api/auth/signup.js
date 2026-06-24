import { prisma } from '../../server/lib/prisma.js';
import {
  hashPassword,
  signToken,
  setAuthCookie,
  setCorsHeaders,
  stripUser,
} from '../../server/lib/auth.js';
import { parseBody, signupSchema, ValidationError } from '../../server/lib/validate.js';

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
    const data = parseBody(signupSchema, body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
      },
    });

    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    setAuthCookie(res, token);

    return res.status(201).json({ user: stripUser(user), token });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    console.error('[auth/signup] error:', err.message);
    return res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
