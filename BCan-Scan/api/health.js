/**
 * Vercel Serverless Function — GET /api/health
 *
 * Liveness probe used by the Flutter app to verify the server is reachable
 * before sending an inference request.
 */

const SPACE_ID = 'EmmasonMutsaka/BreastCancer-Ai-Screening';

export default function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'ok',
    space: SPACE_ID,
    timestamp: new Date().toISOString(),
  });
}
