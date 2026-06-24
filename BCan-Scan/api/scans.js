import { setCorsHeaders, getUserFromRequest, stripUser } from '../server/lib/auth.js';
import { prisma } from '../server/lib/prisma.js';

export default async function handler(req, res) {
  setCorsHeaders(res, req);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const user = await getUserFromRequest(req, prisma);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const scans = await prisma.scan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        patientNumber: true,
        classification: true,
        confidence: true,
        level: true,
        score: true,
        report: true,
        imageBase64: true,
        gradCamBase64: true,
        createdAt: true,
      },
    });

    return res.status(200).json({ scans });
  } catch (err) {
    console.error('[scans] error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch scans.' });
  }
}
