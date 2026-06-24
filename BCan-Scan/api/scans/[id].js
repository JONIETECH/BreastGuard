import { setCorsHeaders, getUserFromRequest } from '../../server/lib/auth.js';
import { prisma } from '../../server/lib/prisma.js';

export default async function handler(req, res) {
  setCorsHeaders(res, req);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!['GET', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const user = await getUserFromRequest(req, prisma);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Scan id is required.' });
    }

    if (req.method === 'DELETE') {
      const existing = await prisma.scan.findFirst({
        where: { id, userId: user.id },
      });
      if (!existing) {
        return res.status(404).json({ error: 'Scan not found.' });
      }
      await prisma.scan.delete({ where: { id } });
      return res.status(200).json({ message: 'Scan deleted.' });
    }

    const scan = await prisma.scan.findFirst({
      where: { id, userId: user.id },
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

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found.' });
    }

    return res.status(200).json({ scan });
  } catch (err) {
    console.error('[scan] error:', err.message);
    return res.status(500).json({ error: 'Failed to process scan request.' });
  }
}
