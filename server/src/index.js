import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import db from './db.js';
import examRoutes from './exams.js';
import adminRoutes from './admin.js';
import { seedIfEmpty } from './seed.js';

import {
  COOKIE_NAME,
  SESSION_MS,
  createSessionToken,
  requireAuth,
  verifyPassword,
} from './auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1); // behind the host's HTTPS proxy
app.use(express.json());

app.get('/api/health', (req, res) => {
  const { users } = db.prepare('SELECT COUNT(*) AS users FROM users').get();
  res.json({ ok: true, users });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(email.trim().toLowerCase());

  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Wrong email or password' });
  }

  res.cookie(COOKIE_NAME, createSessionToken(user.id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MS,
  });
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.use('/api', examRoutes);

app.use('/api', adminRoutes);

// In production the server also serves the built client (client/dist).
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // Page routes such as /student or /exam/1 load index.html; the router takes over in the browser.
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

seedIfEmpty();

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});