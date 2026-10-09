import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import ProductCard, { Skeletons } from '../components/ProductCard.jsx';
import ShoeArt from '../components/ShoeArt.jsx';
import { heroPhoto, aboutPhoto } from '../lib/images.js';

const TABS = [['All', ''], ['Men', 'gender=Men'], ['Women', 'gender=Women'], ['Sports', 'category=Running']];

function Head({ eyebrow, title, accent, action }) {
  return (
    <div className="sec-head">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title} <em>{accent}</em></h2>
      </div>
      {action}
    </div>
  );
}

export default function Home() {
  const [fresh, setFresh] = useState(null);
  const [coll, setColl] = useState(null);
  const [tab, setTab] = useState(0);
  const [brands, setBrands] = useState([]);

  useEffect(() => { api('/products?tag=New&limit=4').then((d) => setFresh(d.items)).catch(() => setFresh([])); }, []);
  useEffect(() => {
    setColl(null);
    api(`/products?limit=8${TABS[tab][1] ? '&' + TABS[tab][1] : ''}`).then((d) => setColl(d.items)).catch(() => setColl([]));
  }, [tab]);
  useEffect(() => { api('/products/facets').then((d) => setBrands(d.brands)).catch(() => {}); }, []);

  return (
    <>
      <section className="hero">
        <div className="wrap hero-in">
          <div className="hero-copy">
            <p className="eyebrow">New season · Just landed</p>
            <h1>Step into <em>premium</em> footwear.</h1>
            <p className="lead">Authentic sneakers, runners, formals and boots from the brands you trust. Delivered across India with easy 7-day returns.</p>
            <div className="row">
              <Link to="/shop" className="btn lg">Shop collection</Link>
              <Link to="/shop?tag=New" className="btn lg ghost">New arrivals</Link>
            </div>
            <ul className="stats">
              <li><b>36</b><span>styles</span></li>
              <li><b>17</b><span>brands</span></li>
              <li><b>7-day</b><span>returns</span></li>
            </ul>
          </div>
          <div className="hero-stage">
            <div className="neon-panel" />
            {heroPhoto ? <img src={heroPhoto} alt="White sneaker with a blue swoosh and gum sole" className="hero-shoe main photo framed" width="554" height="554" fetchpriority="high" /> : <ShoeArt color="#6d28d9" color2="#f4f1ea" shape="sneaker" className="hero-shoe main" />}
            <div className="glass-badge"><b>Get up to 50% off</b><span>Selected styles · limited time</span></div>
          </div>
        </div>
      </section>

      {brands.length > 0 && (
        <div className="marquee" aria-label="Brands we stock">
          <div className="marquee-in">
            {[...brands, ...brands].map((b, i) => <Link key={i} to={`/shop?brand=${encodeURIComponent(b)}`}>{b}</Link>)}
          </div>
        </div>
      )}

      <section className="wrap section">
        <Head eyebrow="Our new collection" title="New" accent="Arrivals" action={<Link to="/shop?tag=New" className="btn">See all</Link>} />
        <div className="grid">{fresh ? fresh.map((p) => <ProductCard key={p._id} p={p} />) : <Skeletons n={4} />}</div>
        {fresh && fresh.length === 0 && <p className="muted">No new arrivals right now — <Link to="/shop">browse the full collection</Link>.</p>}
      </section>

      <section className="wrap section">
        <Head eyebrow="Best collection" title="Our best" accent="collection" action={
          <div className="tabs" role="tablist" aria-label="Filter collection">
            {TABS.map(([label], i) => <button key={label} role="tab" aria-selected={tab === i} className={tab === i ? 'on' : ''} onClick={() => setTab(i)}>{label}</button>)}
          </div>
        } />
        <div className="grid">{coll ? coll.map((p) => <ProductCard key={p._id} p={p} />) : <Skeletons n={4} />}</div>
        {coll && coll.length === 0 && <p className="muted">No shoes in this collection yet.</p>}
      </section>

      <section className="wrap section about" id="about">
        <div className="about-art">
          <div className="neon-panel soft" />
          {aboutPhoto ? <img src={aboutPhoto} alt="" className="about-shoe photo" /> : <ShoeArt color="#5b21b6" color2="#e9d5ff" shape="high" className="about-shoe" />}
          <div className="glass-badge"><b>Get up to 50% off</b><span>On our end-of-season range</span></div>
        </div>
        <div>
          <p className="eyebrow">About us</p>
          <h2>We provide high quality <em>shoes</em></h2>
          <p className="muted">Brand Walk brings authentic footwear from leading brands under one roof — sourced directly from brands and authorised distributors, checked before dispatch and delivered to your door.</p>
          <ul className="ticks">
            <li>100% authentic, brand-sourced</li>
            <li>Secure checkout and protected accounts</li>
            <li>7-day easy returns and cash on delivery</li>
          </ul>
          <Link to="/contact" className="btn">Read more</Link>
        </div>
      </section>

      <section className="wrap section perks">
        <div><span className="ico">✓</span><b>100% authentic</b><p>Sourced directly from brands and authorised distributors.</p></div>
        <div><span className="ico">🔒</span><b>Secure checkout</b><p>Your account and data are encrypted and protected.</p></div>
        <div><span className="ico">↺</span><b>Easy returns</b><p>Not the right fit? Return within 7 days.</p></div>
        <div><span className="ico">₹</span><b>Cash on delivery</b><p>Pay when your shoes arrive at your door.</p></div>
      </section>
    </>
  );
}
