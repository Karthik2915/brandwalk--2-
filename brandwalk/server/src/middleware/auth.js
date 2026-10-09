import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import User from '../models/User.js';

const ACCESS_TTL = 15 * 60; // seconds
const REFRESH_TTL = 7 * 24 * 60 * 60;

export const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

export const signAccess = (user) =>
  jwt.sign({ sub: String(user._id), role: user.role }, env.accessSecret, { expiresIn: ACCESS_TTL, algorithm: 'HS256' });

export const signRefresh = (user) =>
  jwt.sign({ sub: String(user._id), jti: crypto.randomUUID() }, env.refreshSecret, { expiresIn: REFRESH_TTL, algorithm: 'HS256' });

const base = { httpOnly: true, secure: env.isProd, sameSite: 'strict' };

export function setAuthCookies(res, access, refresh) {
  res.cookie('bw_at', access, { ...base, path: '/', maxAge: ACCESS_TTL * 1000 });
  // refresh cookie is only ever sent to the auth routes
  res.cookie('bw_rt', refresh, { ...base, path: '/api/auth', maxAge: REFRESH_TTL * 1000 });
}

export function clearAuthCookies(res) {
  res.clearCookie('bw_at', { ...base, path: '/' });
  res.clearCookie('bw_rt', { ...base, path: '/api/auth' });
}

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.bw_at;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    const payload = jwt.verify(token, env.accessSecret, { algorithms: ['HS256'] });
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Session expired' });
  }
}

export const requireAdmin = (req, res, next) =>
  req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Forbidden' });
