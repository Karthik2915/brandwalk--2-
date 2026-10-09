import { Router } from 'express';
import { z } from 'zod';
import Product from '../models/Product.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';

const router = Router();

const listQuery = z.object({
  q: z.string().trim().max(60).optional(),
  category: z.string().max(20).optional(),
  gender: z.enum(['Men', 'Women', 'Unisex']).optional(),
  brand: z.string().max(40).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  featured: z.enum(['true']).optional(),
  tag: z.enum(['New', 'Bestseller', 'Sale']).optional(),
  sort: z.enum(['new', 'price_asc', 'price_desc']).default('new'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

router.get('/', async (req, res, next) => {
  try {
    const q = listQuery.parse(req.query);
    const filter = {};
    if (q.q) filter.$text = { $search: q.q };
    if (q.category) filter.category = q.category;
    if (q.gender) filter.gender = { $in: [q.gender, 'Unisex'] };
    if (q.brand) filter.brand = q.brand;
    if (q.featured) filter.featured = true;
    if (q.tag) filter.tag = q.tag;
    if (q.minPrice != null || q.maxPrice != null) {
      filter.price = {};
      if (q.minPrice != null) filter.price.$gte = q.minPrice;
      if (q.maxPrice != null) filter.price.$lte = q.maxPrice;
    }
    const sort = { new: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 } }[q.sort];
    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
      Product.countDocuments(filter),
    ]);
    res.json({ items, total, page: q.page, pages: Math.ceil(total / q.limit) });
  } catch (e) {
    next(e);
  }
});

router.get('/facets', async (req, res, next) => {
  try {
    const [brands, categories] = await Promise.all([Product.distinct('brand'), Product.distinct('category')]);
    res.json({ brands: brands.sort(), categories: categories.sort() });
  } catch (e) {
    next(e);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const p = await Product.findOne({ slug: String(req.params.slug) }).lean();
    if (!p) throw new HttpError(404, 'Product not found');
    res.json({ product: p });
  } catch (e) {
    next(e);
  }
});

// ---- Admin catalogue management ----
const productBody = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/).max(120),
  brand: z.string().trim().min(1).max(60),
  category: z.enum(['Sneakers', 'Running', 'Formal', 'Casual', 'Sandals', 'Boots']),
  gender: z.enum(['Men', 'Women', 'Unisex']).default('Unisex'),
  description: z.string().max(2000).default(''),
  price: z.number().min(0),
  mrp: z.number().min(0).optional(),
  shape: z.enum(['sneaker', 'runner', 'high', 'oxford', 'loafer', 'boot', 'sandal']).default('sneaker'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#222222'),
  color2: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#f4f1ea'),
  tag: z.string().max(20).default(''),
  highlights: z.array(z.string().max(120)).max(8).default([]),
  images: z.array(z.string().url().max(500)).max(8).default([]),
  sizes: z.array(z.object({ size: z.number().min(1).max(20), stock: z.number().int().min(0) })).max(20),
  featured: z.boolean().default(false),
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const p = await Product.create(productBody.parse(req.body));
    res.status(201).json({ product: p });
  } catch (e) {
    next(e);
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, productBody.parse(req.body), { new: true, runValidators: true });
    if (!p) throw new HttpError(404, 'Product not found');
    res.json({ product: p });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
