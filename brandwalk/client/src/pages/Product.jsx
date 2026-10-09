import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, rupees } from '../lib/api.js';
import { useCart } from '../context/CartContext.jsx';
import ProductCard, { ProductImage } from '../components/ProductCard.jsx';

export default function Product() {
  const { slug } = useParams();
  const nav = useNavigate();
  const cart = useCart();
  const [p, setP] = useState(null);
  const [related, setRelated] = useState([]);
  const [size, setSize] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    setP(null); setSize(null); setMsg(''); setErr('');
    api('/products/' + encodeURIComponent(slug)).then((d) => {
      setP(d.product);
      return api('/products?category=' + encodeURIComponent(d.product.category) + '&limit=5');
    }).then((d) => setRelated(d.items.filter((x) => x.slug !== slug).slice(0, 4))).catch((e) => setErr(e.message));
  }, [slug]);

  if (err && !p) return <div className="wrap section"><p className="error">{err}</p><Link to="/shop">Back to shop</Link></div>;
  if (!p) return <div className="wrap section"><div className="pdp"><div className="pdp-img skel-box" /><div><div className="skel-line w60" /><div className="skel-line" /><div className="skel-line w40" /></div></div></div>;

  const off = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  const chosen = p.sizes.find((s) => s.size === size);
  const add = (go) => {
    if (!size) return setMsg('Please select a size to continue');
    cart.add({ productId: p._id, slug: p.slug, name: p.name, brand: p.brand, color: p.color, color2: p.color2, shape: p.shape, image: p.images?.[0], size, qty: 1, price: p.price });
    setMsg('');
    if (go) nav('/cart');
  };

  return (
    <div className="wrap section">
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link> / <Link to={`/shop?category=${p.category}`}>{p.category}</Link> / <span>{p.name}</span></nav>
      <div className="pdp">
        <div className="pdp-img" style={{ '--tint': p.color }}>
          {p.tag && <span className={`tag tag-${p.tag.toLowerCase()}`}>{p.tag}</span>}
          <ProductImage product={p} />
        </div>
        <div>
          <p className="muted">{p.brand} · {p.category} · {p.gender}</p>
          <h1>{p.name}</h1>
          <p className="price big">{rupees(p.price)} {off > 0 && <><s>{rupees(p.mrp)}</s> <span className="off inline">−{off}%</span></>}</p>
          <p className="muted small">Inclusive of all taxes · {p.price >= 2999 ? 'Free shipping' : 'Free shipping above ₹2,999'}</p>
          <p>{p.description}</p>

          <div className="between"><h3>Select size (UK)</h3><span className="muted small">True to size</span></div>
          <div className="sizes" role="radiogroup" aria-label="Size">
            {p.sizes.map((s) => (
              <button key={s.size} role="radio" aria-checked={size === s.size} disabled={s.stock < 1}
                className={`size ${size === s.size ? 'on' : ''}`} onClick={() => { setSize(s.size); setMsg(''); }}>{s.size}</button>
            ))}
          </div>
          {chosen && chosen.stock <= 4 && <p className="low">Only {chosen.stock} left in this size</p>}
          {msg && <p className="error" role="alert">{msg}</p>}
          <div className="row">
            <button className="btn lg grow" onClick={() => add(false)}>Add to cart</button>
            <button className="btn lg ghost" onClick={() => add(true)}>Buy now</button>
          </div>

          {p.highlights?.length > 0 && (
            <>
              <h3>Highlights</h3>
              <ul className="ticks">{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
            </>
          )}
          <div className="info-cards">
            <div><b>Delivery</b><span>3–7 business days across India</span></div>
            <div><b>Returns</b><span>7-day easy returns</span></div>
            <div><b>Payment</b><span>Cash on delivery available</span></div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <h2>You may also like</h2>
          <div className="grid">{related.map((r) => <ProductCard key={r._id} p={r} />)}</div>
        </section>
      )}
    </div>
  );
}
