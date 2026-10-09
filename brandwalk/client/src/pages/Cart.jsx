import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { ProductImage } from '../components/ProductCard.jsx';
import { rupees } from '../lib/api.js';

export default function Cart() {
  const c = useCart();
  if (!c.items.length)
    return <div className="wrap section center"><h1>Your cart is empty</h1><Link to="/shop" className="btn lg">Start shopping</Link></div>;
  const ship = c.subtotal >= 2999 ? 0 : 99;
  return (
    <div className="wrap section cart">
      <div>
        <h1>Your cart</h1>
        {c.items.map((i) => (
          <div className="line" key={i.productId + i.size}>
            <div className="thumb" style={{ background: `${i.color}18` }}><ProductImage product={{ slug: i.slug, name: i.name, images: i.image ? [i.image] : [], color: i.color, color2: i.color2, shape: i.shape }} /></div>
            <div className="grow">
              <Link to={`/product/${i.slug}`}><b>{i.name}</b></Link>
              <p className="muted small">{i.brand} · Size UK {i.size}</p>
              <button className="link" onClick={() => c.remove(i)}>Remove</button>
            </div>
            <div className="qty">
              <button aria-label="Decrease" onClick={() => c.setQty(i, i.qty - 1)}>−</button>
              <span>{i.qty}</span>
              <button aria-label="Increase" onClick={() => c.setQty(i, i.qty + 1)}>+</button>
            </div>
            <b>{rupees(i.price * i.qty)}</b>
          </div>
        ))}
      </div>
      <aside className="summary">
        <h3>Order summary</h3>
        <div className="ship-bar" aria-label="Free shipping progress">
          <p className="small">{c.subtotal >= 2999 ? '🎉 You’ve unlocked free shipping' : `Add ${rupees(2999 - c.subtotal)} more for free shipping`}</p>
          <div className="bar"><i style={{ width: `${Math.min(100, (c.subtotal / 2999) * 100)}%` }} /></div>
        </div>
        <p className="between"><span>Subtotal</span><span>{rupees(c.subtotal)}</span></p>
        <p className="between"><span>Shipping</span><span>{ship ? rupees(ship) : 'Free'}</span></p>
        <p className="between total"><span>Total</span><span>{rupees(c.subtotal + ship)}</span></p>
        <Link to="/checkout" className="btn lg block">Checkout</Link>
        <p className="muted small">Final prices are confirmed securely on our server at checkout.</p>
      </aside>
    </div>
  );
}
