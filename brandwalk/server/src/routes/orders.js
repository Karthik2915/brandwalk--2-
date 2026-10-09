import { Router } from 'express';
import { z } from 'zod';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';

const router = Router();
router.use(requireAuth);

const FREE_SHIPPING_ABOVE = 2999;
const SHIPPING_FEE = 99;

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  line1: z.string().trim().min(3).max(120),
  line2: z.string().trim().max(120).optional().default(''),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
});

const createSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().length(24), size: z.number(), qty: z.number().int().min(1).max(10) }))
    .min(1)
    .max(20),
  shippingAddress: addressSchema,
  paymentMethod: z.enum(['COD']).default('COD'), // plug a gateway (Razorpay/Stripe) in here
});

router.post('/', async (req, res, next) => {
  const reserved = [];
  try {
    const body = createSchema.parse(req.body);
    const products = await Product.find({ _id: { $in: body.items.map((i) => i.productId) } });
    const byId = new Map(products.map((p) => [String(p._id), p]));

    const lines = body.items.map((i) => {
      const p = byId.get(i.productId);
      if (!p) throw new HttpError(400, 'A product in your cart is no longer available');
      if (!p.sizes.some((s) => s.size === i.size)) throw new HttpError(400, `Size ${i.size} unavailable for ${p.name}`);
      // price ALWAYS comes from the database, never from the client
      return { product: p._id, name: p.name, size: i.size, qty: i.qty, price: p.price };
    });

    // atomically reserve stock; roll back if any line fails
    for (const l of lines) {
      const r = await Product.updateOne(
        { _id: l.product },
        { $inc: { 'sizes.$[s].stock': -l.qty } },
        { arrayFilters: [{ 's.size': l.size, 's.stock': { $gte: l.qty } }] }
      );
      if (r.modifiedCount !== 1) throw new HttpError(409, `Not enough stock for ${l.name} (size ${l.size})`);
      reserved.push(l);
    }

    const itemsTotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const shippingFee = itemsTotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
    const order = await Order.create({
      user: req.user._id,
      items: lines,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      itemsTotal,
      shippingFee,
      total: itemsTotal + shippingFee,
    });
    res.status(201).json({ order });
  } catch (e) {
    for (const l of reserved) {
      await Product.updateOne({ _id: l.product }, { $inc: { 'sizes.$[s].stock': l.qty } }, { arrayFilters: [{ 's.size': l.size }] });
    }
    next(e);
  }
});

router.get('/mine', async (req, res, next) => {
  try {
    res.json({ orders: await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50).lean() });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    // scoped to the owner => no IDOR
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!order) throw new HttpError(404, 'Order not found');
    res.json({ order });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/cancel', async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) throw new HttpError(404, 'Order not found');
    if (!['placed', 'packed'].includes(order.status)) throw new HttpError(400, 'This order can no longer be cancelled');
    order.status = 'cancelled';
    await order.save();
    for (const l of order.items) {
      await Product.updateOne({ _id: l.product }, { $inc: { 'sizes.$[s].stock': l.qty } }, { arrayFilters: [{ 's.size': l.size }] });
    }
    res.json({ order });
  } catch (e) {
    next(e);
  }
});

// admin: list all + update status
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    res.json({ orders: await Order.find().sort({ createdAt: -1 }).limit(200).populate('user', 'name email').lean() });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(['placed', 'packed', 'shipped', 'delivered', 'cancelled']) }).parse(req.body);
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) throw new HttpError(404, 'Order not found');
    res.json({ order });
  } catch (e) {
    next(e);
  }
});

export default router;
