import { Link } from 'react-router-dom';
import ShoeArt from './ShoeArt.jsx';
import { rupees } from '../lib/api.js';
import { photoFor } from '../lib/images.js';
import { useWishlist } from '../context/WishlistContext.jsx';

export function ProductImage({ product, className }) {
  const src = product.images?.[0] || photoFor(product.slug);
  if (src) return <img src={src} alt={product.name} className={`photo ${className || ''}`} loading="lazy" referrerPolicy="no-referrer" />;
  return <ShoeArt color={product.color} color2={product.color2} shape={product.shape} className={className} />;
}

export function Heart({ slug, className = '' }) {
  const w = useWishlist();
  const on = w.has(slug);
  return (
    <button
      type="button"
      className={`heart ${on ? 'on' : ''} ${className}`}
      aria-pressed={on}
      aria-label={on ? 'Remove from wishlist' : 'Add to wishlist'}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); w.toggle(slug); }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 5 6 5c2 0 3.4 1.1 4.1 2.3h.01C10.8 6.1 12.2 5 14.2 5c3.3 0 5.1 3.4 3.6 6.8C19.5 16.4 12 21 12 21z" transform="translate(0 -.5)" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
    </button>
  );
}

export function Skeletons({ n = 8 }) {
  return Array.from({ length: n }).map((_, i) => (
    <div className="card skel" key={i} aria-hidden="true"><div className="card-img" /><div className="card-body"><i /><i /><i /></div></div>
  ));
}

export default function ProductCard({ p }) {
  const off = p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  return (
    <Link to={`/product/${p.slug}`} className="card">
      <div className="card-img" style={{ '--tint': p.color }}>
        {p.tag && <span className={`tag tag-${p.tag.toLowerCase()}`}>{p.tag}</span>}
        <Heart slug={p.slug} />
        <ProductImage product={p} />
      </div>
      <div className="card-body">
        <h3>{p.name}</h3>
        <span className="muted small">{p.brand} · {p.gender}</span>
        <div className="buy-row">
          <p className="price">{rupees(p.price)} {off > 0 && <s>{rupees(p.mrp)}</s>}</p>
          <span className="buy">Buy now</span>
        </div>
      </div>
    </Link>
  );
}
