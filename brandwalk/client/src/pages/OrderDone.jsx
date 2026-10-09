import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, rupees } from '../lib/api.js';

export default function OrderDone() {
  const { id } = useParams();
  const [o, setO] = useState(null);
  useEffect(() => { api('/orders/' + id).then((d) => setO(d.order)).catch(() => {}); }, [id]);
  if (!o) return <div className="wrap section">Loading…</div>;
  return (
    <div className="wrap section center narrow">
      <h1>Order confirmed 🎉</h1>
      <p>Thank you! Order <b>#{o._id.slice(-8).toUpperCase()}</b> — total {rupees(o.total)} ({o.paymentMethod}).</p>
      <p className="muted">We’ll deliver to {o.shippingAddress.line1}, {o.shippingAddress.city} – {o.shippingAddress.pincode}.</p>
      <div className="row center-row"><Link to="/account" className="btn">View my orders</Link><Link to="/shop" className="btn ghost">Keep shopping</Link></div>
    </div>
  );
}
