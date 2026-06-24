import { prisma } from '../../server/lib/prisma.js';
import { getUserFromRequest, setCorsHeaders, stripUser } from '../../server/lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(res, req);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getUserFromRequest(req, prisma);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    return res.status(200).json({ user: stripUser(user) });
  } catch (err) {
    console.error('[auth/me] error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}
