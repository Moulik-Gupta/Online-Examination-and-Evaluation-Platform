import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import db from './db.js';

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(expected, actual);
}

export const COOKIE_NAME = 'cheatblock_session';
export const SESSION_MS = 8 * 60 * 60 * 1000;

function sign(value) {
  return createHmac('sha256', process.env.SESSION_SECRET).update(value).digest('hex');
}

export function createSessionToken(userId) {
  const payload = `${userId}.${Date.now() + SESSION_MS}`;
  return `${payload}.${sign(payload)}`;
}

function readSessionToken(token) {
  const parts = (token || '').split('.');
  if (parts.length !== 3) return null;
  const [id, expires, signature] = parts;
  const expected = Buffer.from(sign(`${id}.${expires}`));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  if (Number(expires) < Date.now()) return null;
  return Number(id);
}

function getCookie(req, name) {
  for (const part of (req.headers.cookie || '').split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

export function requireAuth(req, res, next) {
  const userId = readSessionToken(getCookie(req, COOKIE_NAME));
  const user = userId
    ? db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(userId)
    : null;
  if (!user) return res.status(401).json({ error: 'Not signed in' });
  req.user = user;
  next();
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) return res.status(403).json({ error: 'Not allowed' });
    next();
  };
}