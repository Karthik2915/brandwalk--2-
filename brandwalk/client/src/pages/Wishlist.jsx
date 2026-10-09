import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useWishlist } from '../context/WishlistContext.jsx';
import ProductCard, { Skeletons } from '../components/ProductCard.jsx';

export default function Wishlist() {
  const { slugs } = useWishlist();
  const [all, setAll] = useState(null);
  useEffect(() => { api('/products?limit=48').then((d) => setAll(d.items)).catch(() => setAll([])); }, []);
  const items = (all || []).filter((p) => slugs.includes(p.slug));
  return (
    <div className="wrap section">
      <p className="eyebrow">Saved for later</p>
      <h1>Your wishlist</h1>
      {!all ? <div className="grid"><Skeletons n={4} /></div> : items.length === 0 ? (
        <div className="empty"><h3>Nothing saved yet</h3><p className="muted">Tap the heart on any shoe to save it here.</p><Link to="/shop" className="btn">Browse shoes</Link></div>
      ) : <div className="grid">{items.map((p) => <ProductCard key={p._id} p={p} />)}</div>}
    </div>
  );
}
