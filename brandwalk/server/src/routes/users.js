import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { requireAuth, clearAuthCookies, signAccess, signRefresh, setAuthCookies, sha256 } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';
import { authLimiter } from '../middleware/security.js';
import { addressSchema } from './orders.js';

const router = Router();
router.use(requireAuth);

router.patch('/me', async (req, res, next) => {
  try {
    const body = z
      .object({
        name: z.string().trim().min(2).max(80).optional(),
        address: addressSchema.optional(),
        marketing: z.boolean().optional(),
      })
      .parse(req.body);
    if (body.name) req.user.name = body.name;
    if (body.address) req.user.address = body.address;
    if (body.marketing != null) req.user.consent.marketing = body.marketing;
    await req.user.save();
    res.json({ user: req.user.toSafe() });
  } catch (e) {
    next(e);
  }
});

router.post('/me/password', authLimiter, async (req, res, next) => {
  try {
    const body = z
      .object({
        currentPassword: z.string().min(1).max(128),
        newPassword: z
          .string()
          .min(10)
          .max(128)
          .regex(/[a-z]/)
          .regex(/[A-Z]/)
          .regex(/[0-9]/, 'Password needs lowercase, uppercase and a number'),
      })
      .parse(req.body);
    const user = await User.findById(req.user._id).select('+password');
    if (!(await bcrypt.compare(body.currentPassword, user.password))) throw new HttpError(401, 'Current password is incorrect');
    user.password = await bcrypt.hash(body.newPassword, 12);
    // revoke every other session, then issue a fresh one for this device
    const refresh = signRefresh(user);
    user.refreshTokens = [sha256(refresh)];
    await user.save();
    setAuthCookies(res, signAccess(user), refresh);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Right to access / data portability
router.get('/me/export', async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).lean();
    res.setHeader('Content-Disposition', 'attachment; filename="brandwalk-my-data.json"');
    res.json({ exportedAt: new Date().toISOString(), profile: req.user.toSafe(), orders });
  } catch (e) {
    next(e);
  }
});

// Right to erasure: removes the account, keeps anonymised order totals for tax/accounting
router.delete('/me', authLimiter, async (req, res, next) => {
  try {
    const { password } = z.object({ password: z.string().min(1).max(128) }).parse(req.body);
    const user = await User.findById(req.user._id).select('+password');
    if (!(await bcrypt.compare(password, user.password))) throw new HttpError(401, 'Password is incorrect');
    await Order.updateMany(
      { user: user._id },
      { $set: { shippingAddress: { fullName: 'Deleted user', city: '', state: '' } } }
    );
    await User.deleteOne({ _id: user._id });
    clearAuthCookies(res);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
