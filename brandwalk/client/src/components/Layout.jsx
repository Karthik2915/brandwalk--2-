import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useConsent } from '../context/ConsentContext.jsx';
import { useDemoMode } from '../lib/api.js';
import { useWishlist } from '../context/WishlistContext.jsx';
import { BUSINESS } from '../lib/business.js';
import CookieBanner from './CookieBanner.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const { count, toast, dismissToast } = useCart();
  const demo = useDemoMode();
  const wish = useWishlist();
  const { openPanel } = useConsent();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const search = (e) => {
    e.preventDefault();
    if (q.trim()) nav(`/shop?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  };

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <div className="topbar">Free shipping above ₹2,999 · 7-day easy returns · 100% authentic</div>
      <header className="header">
        <div className="wrap header-in">
          <Link to="/" className="logo" aria-label="Brand Walk home">
            <span className="logo-mark">BW</span> Brand<b>Walk</b>
          </Link>
          <nav className={`nav ${open ? 'open' : ''}`} aria-label="Main" onClick={() => setOpen(false)}>
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/shop?tag=New">New Arrivals</NavLink>
            <NavLink to="/shop" end>Collection</NavLink>
            <NavLink to="/shop?gender=Women">Women</NavLink>
            <Link to="/#about">About</Link>
            <form onSubmit={search} className="search mobile-search" role="search">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shoes…" aria-label="Search shoes" maxLength={60} />
            </form>
          </nav>
          <div className="actions">
            <form onSubmit={search} className="search desk-search" role="search">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search shoes" maxLength={60} />
            </form>
            {user ? (
              <>
                <Link to="/account" className="txt-link">{user.name.split(' ')[0]}</Link>
                <button className="link" onClick={logout}>Log out</button>
              </>
            ) : (
              <Link to="/login" className="txt-link">Log in</Link>
            )}
            <Link to="/wishlist" className="icon-btn" aria-label={`Wishlist, ${wish.slugs.length} saved`}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.6-9.2C.9 7.9 2.7 4.5 6 4.5c2 0 3.4 1.1 4.1 2.3h.01C10.8 5.6 12.2 4.5 14.2 4.5c3.3 0 5.1 3.4 3.6 6.8C19.5 15.9 12 20.5 12 20.5z" fill="currentColor" /></svg>
              {wish.slugs.length > 0 && <span className="pill">{wish.slugs.length}</span>}
            </Link>
            <Link to="/cart" className="icon-btn" aria-label={`Cart, ${count} items`}>
              <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true"><path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.1L20 8H6.2" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9.5" cy="19.2" r="1.5" fill="currentColor" /><circle cx="16.5" cy="19.2" r="1.5" fill="currentColor" /></svg>
              {count > 0 && <span className="pill">{count}</span>}
            </Link>
            <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
          </div>
        </div>
      </header>

      {demo && (
        <div className="demo-bar" role="status">
          Showing sample catalog — the store database isn’t connected yet. Run <code>npm run seed</code> with the API running to load it.
        </div>
      )}
      <main id="main"><Outlet /></main>

      <div className="toast-wrap" aria-live="polite">
        {toast && (
          <div className="toast" key={toast.at}>
            <span>✓ Added <b>{toast.name}</b> (UK {toast.size})</span>
            <Link to="/cart" onClick={dismissToast}>View cart</Link>
          </div>
        )}
      </div>

      <footer className="footer">
        <div className="wrap foot-grid">
          <div>
            <div className="logo light"><span className="logo-mark">BW</span> Brand<b>Walk</b></div>
            <p className="muted-l">Authentic footwear from the brands you trust.</p>
            <p className="muted-l small">{BUSINESS.address}<br />{BUSINESS.email} · {BUSINESS.phone}</p>
          </div>
          <div>
            <h4>Shop</h4>
            <Link to="/shop?gender=Men">Men</Link>
            <Link to="/shop?gender=Women">Women</Link>
            <Link to="/shop?category=Sneakers">Sneakers</Link>
            <Link to="/shop?category=Formal">Formal</Link>
          </div>
          <div>
            <h4>Help</h4>
            <Link to="/account">My account</Link>
            <Link to="/shipping-returns">Shipping &amp; returns</Link>
            <Link to="/contact">Contact &amp; grievances</Link>
          </div>
          <div>
            <h4>Legal</h4>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookie Policy</Link>
            <button className="link-l" onClick={openPanel}>Cookie settings</button>
          </div>
        </div>
        <div className="wrap copy">© {new Date().getFullYear()} {BUSINESS.brand}. All rights reserved.</div>
      </footer>
      <CookieBanner />
    </>
  );
}
