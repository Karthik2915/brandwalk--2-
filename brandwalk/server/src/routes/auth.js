import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { authLimiter } from '../middleware/security.js';
import { HttpError } from '../middleware/error.js';
import { requireAuth, signAccess, signRefresh, setAuthCookies, clearAuthCookies, sha256 } from '../middleware/auth.js';

const router = Router();
const MAX_SESSIONS = 5;
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const BCRYPT_COST = 12;
// compared against when the email doesn't exist so response time doesn't reveal valid accounts
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_COST);

const password = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .max(128)
  .regex(/[a-z]/, 'Password needs a lowercase letter')
  .regex(/[A-Z]/, 'Password needs an uppercase letter')
  .regex(/[0-9]/, 'Password needs a number');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email').max(254),
  password,
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the Terms and Privacy Policy' }) }),
  marketing: z.boolean().optional().default(false),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

async function startSession(user, res) {
  const access = signAccess(user);
  const refresh = signRefresh(user);
  const hashes = [...(user.refreshTokens || []), sha256(refresh)].slice(-MAX_SESSIONS);
  await User.updateOne({ _id: user._id }, { $set: { refreshTokens: hashes } });
  setAuthCookies(res, access, refresh);
}

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const now = new Date();
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: await bcrypt.hash(data.password, BCRYPT_COST),
      consent: { termsAcceptedAt: now, privacyAcceptedAt: now, marketing: data.marketing },
    });
    await startSession(user, res);
    res.status(201).json({ user: user.toSafe() });
  } catch (e) {
    // do not confirm which emails are registered
    if (e?.code === 11000) return next(new HttpError(409, 'Unable to create account with those details'));
    next(e);
  }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password: pw } = loginSchema.parse(req.body);
    const user = await User.findOne({ email }).select('+password +failedLogins +lockUntil +refreshTokens');
    const invalid = new HttpError(401, 'Invalid email or password');

    if (user?.lockUntil && user.lockUntil > new Date()) {
      throw new HttpError(423, 'Account temporarily locked. Try again in a few minutes.');
    }
    const ok = await bcrypt.compare(pw, user?.password || DUMMY_HASH);
    if (!user || !ok) {
      if (user) {
        const fails = (user.failedLogins || 0) + 1;
        const update = fails >= MAX_FAILS ? { failedLogins: 0, lockUntil: new Date(Date.now() + LOCK_MS) } : { failedLogins: fails };
        await User.updateOne({ _id: user._id }, { $set: update });
      }
      throw invalid;
    }
    await User.updateOne({ _id: user._id }, { $set: { failedLogins: 0 }, $unset: { lockUntil: 1 } });
    await startSession(user, res);
    res.json({ user: user.toSafe() });
  } catch (e) {
    next(e);
  }
});

// Refresh-token rotation with reuse detection
router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.bw_rt;
    if (!token) throw new HttpError(401, 'No session');
    let payload;
    try {
      payload = jwt.verify(token, env.refreshSecret, { algorithms: ['HS256'] });
    } catch {
      clearAuthCookies(res);
      throw new HttpError(401, 'Session expired');
    }
    const user = await User.findById(payload.sub).select('+refreshTokens');
    const hash = sha256(token);
    if (!user || !user.refreshTokens.includes(hash)) {
      // a valid-signature token that is no longer on file => likely stolen; kill every session
      if (user) await User.updateOne({ _id: user._id }, { $set: { refreshTokens: [] } });
      clearAuthCookies(res);
      throw new HttpError(401, 'Session expired');
    }
    const access = signAccess(user);
    const refresh = signRefresh(user);
    const hashes = user.refreshTokens.filter((h) => h !== hash).concat(sha256(refresh)).slice(-MAX_SESSIONS);
    await User.updateOne({ _id: user._id }, { $set: { refreshTokens: hashes } });
    setAuthCookies(res, access, refresh);
    res.json({ user: user.toSafe() });
  } catch (e) {
    next(e);
  }
});

router.post('/logout', async (req, res) => {
  const token = req.cookies?.bw_rt;
  if (token) {
    try {
      const { sub } = jwt.verify(token, env.refreshSecret, { algorithms: ['HS256'] });
      await User.updateOne({ _id: sub }, { $pull: { refreshTokens: sha256(token) } });
    } catch {
      /* ignore invalid token */
    }
  }
  clearAuthCookies(res);
  res.json({ ok: true });
});

router.post('/logout-all', requireAuth, async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $set: { refreshTokens: [] } });
  clearAuthCookies(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user.toSafe() }));

export default router;
