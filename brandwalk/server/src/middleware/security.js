import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: { 'default-src': ["'none'"], 'frame-ancestors': ["'none'"] }, // API returns JSON only
  },
  hsts: env.isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  referrerPolicy: { policy: 'no-referrer' },
});

export const corsPolicy = cors({
  origin: env.clientOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Requested-With'],
});

export const sanitizeInput = [mongoSanitize(), hpp()];

/**
 * CSRF defence in depth: cookies are SameSite=Strict, and every state-changing
 * request must also carry a custom header that a cross-site form cannot set.
 */
export function requireCustomHeader(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('X-Requested-With') !== 'BrandWalk') {
    return res.status(403).json({ message: 'Blocked: missing request header' });
  }
  next();
}

const msg = (message) => ({ message });

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // dev hot-reloads and page refreshes make many calls; keep the strict limit for production only
  limit: process.env.NODE_ENV === 'production' ? 300 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: msg('Too many requests, please try again later.'),
});

// Brute-force protection on credential endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: msg('Too many attempts, please try again in 15 minutes.'),
});
