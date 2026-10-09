import { useSyncExternalStore } from 'react';
import { mockList, mockFacets, mockBySlug } from './mockProducts.js';

const BASE = import.meta.env.VITE_API_URL || '/api';

// ---- demo-mode flag (true when the catalog is served from the built-in sample data) ----
let demo = false;
const subs = new Set();
function setDemo(v) {
  if (demo !== v) { demo = v; subs.forEach((f) => f()); }
}
export const useDemoMode = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => demo);

async function raw(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    credentials: 'include', // httpOnly auth cookies — JS never sees the token
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'BrandWalk' },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  let bad = false;
  try { data = await res.json(); } catch { bad = true; /* empty or non-JSON body */ }
  // a 200 that isn't JSON means we reached a static host, not the API
  if (bad && res.ok) return { res: { ok: false, status: 502 }, data: { message: 'API unavailable' } };
  return { res, data };
}

let refreshing = null;
async function real(path, opts) {
  let { res, data } = await raw(path, opts);
  // access token expired -> rotate once, then retry
  if (res.status === 401 && !path.startsWith('/auth/')) {
    refreshing ||= raw('/auth/refresh', { method: 'POST' }).finally(() => (refreshing = null));
    const r = await refreshing;
    if (r.res.ok) ({ res, data } = await raw(path, opts));
  }
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return data;
}

const FILTERS = ['q', 'category', 'gender', 'brand', 'tag', 'featured', 'minPrice', 'maxPrice'];

function demoResponse(path) {
  const [route, search = ''] = path.split('?');
  if (route === '/products') return mockList(search);
  if (route === '/products/facets') return mockFacets();
  const m = route.match(/^\/products\/([^/]+)$/);
  if (m) {
    const product = mockBySlug(decodeURIComponent(m[1]));
    if (!product) { const e = new Error('Product not found'); e.status = 404; throw e; }
    return { product };
  }
  return null;
}

export async function api(path, opts = {}) {
  const isCatalogRead = (opts.method || 'GET') === 'GET' && path.startsWith('/products');
  if (isCatalogRead && demo) return demoResponse(path);
  try {
    const data = await real(path, opts);
    if (isCatalogRead) {
      const [route, search = ''] = path.split('?');
      const unfiltered = !FILTERS.some((k) => new URLSearchParams(search).has(k));
      // database reachable but not seeded yet -> show the sample catalog instead of an empty shop
      if ((route === '/products' && data.total === 0 && unfiltered) || (route === '/products/facets' && !data.brands?.length)) {
        setDemo(true);
        return demoResponse(path);
      }
    }
    return data;
  } catch (e) {
    // API unreachable, erroring or rate-limited: serve the sample catalog instead of an empty page.
    // (A genuine 404 on a single product still surfaces as "not found".)
    const isDetail = /^\/products\/(?!facets)[^/?]+/.test(path);
    if (isCatalogRead && (e.status === undefined || e.status >= 500 || e.status === 429 || (e.status >= 400 && !(isDetail && e.status === 404)))) {
      setDemo(true);
      return demoResponse(path);
    }
    throw e;
  }
}

export const rupees = (n) => '₹' + Number(n).toLocaleString('en-IN');
