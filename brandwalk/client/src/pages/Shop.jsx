import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import ProductCard, { Skeletons } from '../components/ProductCard.jsx';

const PRICES = [['', 'Any price'], ['2999', 'Under ₹3,000'], ['5999', 'Under ₹6,000'], ['9999', 'Under ₹10,000']];

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [facets, setFacets] = useState({ brands: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const qs = sp.toString();

  useEffect(() => { api('/products/facets').then(setFacets).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true); setErr('');
    api('/products?' + qs + (sp.has('limit') ? '' : '&limit=12')).then(setData).catch((e) => setErr(e.message)).finally(() => setLoading(false));
  }, [qs]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k, v) => {
    const n = new URLSearchParams(sp);
    v ? n.set(k, v) : n.delete(k);
    if (k !== 'page') n.delete('page');
    setSp(n);
  };
  const page = Number(sp.get('page') || 1);
  const chips = [['category', sp.get('category')], ['gender', sp.get('gender')], ['brand', sp.get('brand')], ['tag', sp.get('tag')], ['q', sp.get('q') && `“${sp.get('q')}”`], ['maxPrice', sp.get('maxPrice') && `Under ₹${Number(sp.get('maxPrice')).toLocaleString('en-IN')}`]].filter(([, v]) => v);

  return (
    <div className="wrap section">
      <div className="pills" role="tablist" aria-label="Categories">
        <button className={!sp.get('category') ? 'on' : ''} onClick={() => set('category', '')}>All</button>
        {facets.categories.map((c) => <button key={c} className={sp.get('category') === c ? 'on' : ''} onClick={() => set('category', c)}>{c}</button>)}
      </div>

      <div className="shop">
        <details className="filters" open>
          <summary>Filters</summary>
          <div className="filters-in">
            <label>For
              <select value={sp.get('gender') || ''} onChange={(e) => set('gender', e.target.value)}>
                <option value="">Everyone</option><option>Men</option><option>Women</option><option>Unisex</option>
              </select>
            </label>
            <label>Brand
              <select value={sp.get('brand') || ''} onChange={(e) => set('brand', e.target.value)}>
                <option value="">All brands</option>{facets.brands.map((b) => <option key={b}>{b}</option>)}
              </select>
            </label>
            <label>Price
              <select value={sp.get('maxPrice') || ''} onChange={(e) => set('maxPrice', e.target.value)}>
                {PRICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label>Collection
              <select value={sp.get('tag') || ''} onChange={(e) => set('tag', e.target.value)}>
                <option value="">All</option><option>New</option><option>Bestseller</option><option>Sale</option>
              </select>
            </label>
            <button className="btn ghost" onClick={() => setSp({})}>Clear all</button>
          </div>
        </details>

        <div>
          <div className="between">
            <h1 className="h2">{sp.get('q') ? 'Search results' : sp.get('category') || 'All shoes'} <span className="muted small">{data.total} styles</span></h1>
            <select aria-label="Sort" value={sp.get('sort') || 'new'} onChange={(e) => set('sort', e.target.value)}>
              <option value="new">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option>
            </select>
          </div>
          {chips.length > 0 && (
            <div className="chips">
              {chips.map(([k, v]) => <button key={k} className="chip" onClick={() => set(k, '')}>{v} ✕</button>)}
            </div>
          )}
          {err && <p className="error">{err}</p>}
          {!loading && data.items.length === 0 && !err ? (
            <div className="empty"><h3>No shoes match those filters</h3><p className="muted">Try removing a filter.</p><button className="btn" onClick={() => setSp({})}>Clear filters</button></div>
          ) : (
            <div className="grid">{loading ? <Skeletons n={6} /> : data.items.map((p) => <ProductCard key={p._id} p={p} />)}</div>
          )}
          {data.pages > 1 && (
            <div className="pager">
              <button className="btn ghost" disabled={page <= 1} onClick={() => set('page', String(page - 1))}>← Prev</button>
              <span>Page {page} / {data.pages}</span>
              <button className="btn ghost" disabled={page >= data.pages} onClick={() => set('page', String(page + 1))}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
