import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, rupees } from '../lib/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Checkout() {
  const cart = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const a = user.address || {};
  const [f, setF] = useState({ fullName: a.fullName || user.name, phone: a.phone || '', line1: a.line1 || '', line2: a.line2 || '', city: a.city || '', state: a.state || '', pincode: a.pincode || '' });
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (!cart.items.length) return <div className="wrap section center"><p>Your cart is empty.</p><Link to="/shop">Shop</Link></div>;

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const { order } = await api('/orders', {
        method: 'POST',
        body: { items: cart.items.map((i) => ({ productId: i.productId, size: i.size, qty: i.qty })), shippingAddress: f, paymentMethod: 'COD' },
      });
      cart.clear();
      nav(`/order/${order._id}`, { replace: true });
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  const ship = cart.subtotal >= 2999 ? 0 : 99;
  return (
    <form className="wrap section cart" onSubmit={submit}>
      <div>
        <h1>Checkout</h1>
        <h3>Delivery address</h3>
        <div className="form two">
          <label>Full name<input required value={f.fullName} onChange={on('fullName')} maxLength={80} autoComplete="name" /></label>
          <label>Mobile number<input required value={f.phone} onChange={on('phone')} inputMode="numeric" maxLength={10} pattern="[6-9][0-9]{9}" autoComplete="tel-national" /></label>
          <label className="span">Address line 1<input required value={f.line1} onChange={on('line1')} maxLength={120} autoComplete="address-line1" /></label>
          <label className="span">Address line 2 (optional)<input value={f.line2} onChange={on('line2')} maxLength={120} autoComplete="address-line2" /></label>
          <label>City<input required value={f.city} onChange={on('city')} maxLength={60} autoComplete="address-level2" /></label>
          <label>State<input required value={f.state} onChange={on('state')} maxLength={60} autoComplete="address-level1" /></label>
          <label>Pincode<input required value={f.pincode} onChange={on('pincode')} inputMode="numeric" maxLength={6} pattern="[0-9]{6}" autoComplete="postal-code" /></label>
        </div>
        <h3>Payment</h3>
        <label className="radio"><input type="radio" checked readOnly /> Cash on delivery</label>
        <p className="muted small">Online payments (UPI / cards) can be enabled by connecting a payment gateway.</p>
      </div>
      <aside className="summary">
        <h3>Your order</h3>
        {cart.items.map((i) => <p className="between small" key={i.productId + i.size}><span>{i.name} (UK {i.size}) × {i.qty}</span><span>{rupees(i.price * i.qty)}</span></p>)}
        <p className="between"><span>Shipping</span><span>{ship ? rupees(ship) : 'Free'}</span></p>
        <p className="between total"><span>Total</span><span>{rupees(cart.subtotal + ship)}</span></p>
        <label className="check"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required />
          <span>I agree to the <Link to="/terms" target="_blank">Terms</Link>, <Link to="/privacy" target="_blank">Privacy Policy</Link> and <Link to="/shipping-returns" target="_blank">Returns Policy</Link>.</span></label>
        {err && <p className="error" role="alert">{err}</p>}
        <button className="btn lg block" disabled={busy || !agree}>{busy ? 'Placing order…' : 'Place order'}</button>
      </aside>
    </form>
  );
}
