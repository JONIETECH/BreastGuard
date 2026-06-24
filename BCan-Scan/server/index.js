/**
 * BCan-Scan — Local Development API Server
 *
 * Mirrors the Vercel Serverless Functions in api/ so you can test locally
 * without deploying. Uses the same formidable + @gradio/client logic.
 *
 * Run:  npm run server          (API only, port 3001)
 *       npm run dev:all         (Vite SPA + API server together)
 *
 * Endpoints:
 *   GET  /api/health      → liveness probe
 *   POST /api/inference   → multipart/form-data → Gradio → JSON
 */

import express from 'express';
import cors from 'cors';
import formidable from 'formidable';
import * as cookie from 'cookie';
import { prisma } from './lib/prisma.js';
import {
  hashPassword,
  verifyPassword,
  signToken,
  setAuthCookie,
  clearAuthCookie,
  getUserFromRequest,
  stripUser,
} from './lib/auth.js';
import { parseBody, signupSchema, loginSchema, ValidationError } from './lib/validate.js';
import { runInferenceAndSave, resetGradioClient } from './lib/inference.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS — allow all origins for Flutter dev testing
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use((req, _res, next) => {
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  req.cookies = cookies;
  next();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024, keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', space: process.env.SPACE_ID, timestamp: new Date().toISOString() });
});

// ── Auth routes ───────────────────────────────────────────────────────────────

app.post('/api/auth/signup', async (req, res) => {
  try {
    const data = parseBody(signupSchema, req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: { email: data.email, passwordHash, fullName: data.fullName },
    });
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    setAuthCookie(res, token);
    return res.status(201).json({ user: stripUser(user) });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    console.error('[auth/signup] error:', err.message);
    return res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const data = parseBody(loginSchema, req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
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
});

app.get('/api/auth/me', async (req, res) => {
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
});

app.post('/api/auth/logout', (_req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({ message: 'Logged out successfully' });
});

app.get('/api/scans', async (req, res) => {
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
});

app.delete('/api/scans/:id', async (req, res) => {
  try {
    const user = await getUserFromRequest(req, prisma);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { id } = req.params;
    const existing = await prisma.scan.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Scan not found.' });
    }

    await prisma.scan.delete({ where: { id } });
    return res.status(200).json({ message: 'Scan deleted.' });
  } catch (err) {
    console.error('[scan delete] error:', err.message);
    return res.status(500).json({ error: 'Failed to delete scan.' });
  }
});

app.post('/api/inference', async (req, res) => {
  try {
    const user = await getUserFromRequest(req, prisma);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { fields, files } = await parseMultipart(req);
    const result = await runInferenceAndSave({ fields, files, userId: user.id });
    return res.json(result);
  } catch (err) {
    resetGradioClient();
    const statusCode = err?.statusCode || 502;
    const message = err?.message || 'Inference failed.';
    console.error('[inference] error:', message);
    return res.status(statusCode).json({ error: message });
  }
});

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ BCan-Scan API server running on http://localhost:${PORT}`);
  console.log(`   Health check : GET  http://localhost:${PORT}/api/health`);
  console.log(`   Auth         : POST http://localhost:${PORT}/api/auth/signup`);
  console.log(`   Auth         : POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   Auth         : GET  http://localhost:${PORT}/api/auth/me`);
  console.log(`   Inference    : POST http://localhost:${PORT}/api/inference\n`);
});
