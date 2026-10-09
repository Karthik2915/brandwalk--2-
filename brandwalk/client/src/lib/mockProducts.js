// Offline demo catalog (same data the database seed uses: /shared/products.json).
// The site falls back to this when the API is unreachable or the database has no products yet.
import raw from '../../../shared/products.json';

export const MOCK = raw.map((p, i) => ({
  ...p,
  _id: String(i + 1).padStart(24, '0'),
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

const num = (v) => (v === null || v === '' ? undefined : Number(v));

export function mockList(search) {
  const q = new URLSearchParams(search);
  let items = [...MOCK];
  const text = (q.get('q') || '').toLowerCase();
  if (text) items = items.filter((p) => `${p.name} ${p.brand} ${p.category} ${p.description}`.toLowerCase().includes(text));
  if (q.get('category')) items = items.filter((p) => p.category === q.get('category'));
  if (q.get('gender')) items = items.filter((p) => p.gender === q.get('gender') || p.gender === 'Unisex');
  if (q.get('brand')) items = items.filter((p) => p.brand === q.get('brand'));
  if (q.get('tag')) items = items.filter((p) => p.tag === q.get('tag'));
  if (q.get('featured')) items = items.filter((p) => p.featured);
  if (num(q.get('minPrice')) != null) items = items.filter((p) => p.price >= num(q.get('minPrice')));
  if (num(q.get('maxPrice')) != null) items = items.filter((p) => p.price <= num(q.get('maxPrice')));
  const sort = q.get('sort') || 'new';
  if (sort === 'price_asc') items.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') items.sort((a, b) => b.price - a.price);
  const limit = Math.min(48, num(q.get('limit')) || 12);
  const page = Math.max(1, num(q.get('page')) || 1);
  return { items: items.slice((page - 1) * limit, page * limit), total: items.length, page, pages: Math.max(1, Math.ceil(items.length / limit)) };
}

export const mockFacets = () => ({
  brands: [...new Set(MOCK.map((p) => p.brand))].sort(),
  categories: [...new Set(MOCK.map((p) => p.category))].sort(),
});

export const mockBySlug = (slug) => MOCK.find((p) => p.slug === slug);
