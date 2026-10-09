import { useEffect, useState } from 'react';
import { api, rupees } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const { user, setUser, logout } = useAuth();
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [delPw, setDelPw] = useState('');

  const load = () => api('/orders/mine').then((d) => setOrders(d.orders)).catch(() => {});
  useEffect(() => { load(); }, []);
  const run = async (fn, ok) => { setMsg(''); setErr(''); try { await fn(); setMsg(ok); } catch (e) { setErr(e.message); } };

  const cancel = (id) => run(async () => { await api(`/orders/${id}/cancel`, { method: 'POST' }); await load(); }, 'Order cancelled');
  const changePw = (e) => { e.preventDefault(); run(async () => { await api('/users/me/password', { method: 'POST', body: pw }); setPw({ currentPassword: '', newPassword: '' }); }, 'Password changed. Other devices were signed out.'); };
  const marketing = (v) => run(async () => { const d = await api('/users/me', { method: 'PATCH', body: { marketing: v } }); setUser(d.user); }, 'Preference saved');
  const logoutAll = () => run(async () => { await api('/auth/logout-all', { method: 'POST' }); await logout(); nav('/login'); }, '');

  const exportData = async () => {
    try {
      const d = await api('/users/me/export');
      const url = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: 'brandwalk-my-data.json' });
      a.click(); URL.revokeObjectURL(url);
    } catch (e) { setErr(e.message); }
  };
  const del = (e) => {
    e.preventDefault();
    if (!confirm('Permanently delete your account? This cannot be undone.')) return;
    run(async () => { await api('/users/me', { method: 'DELETE', body: { password: delPw } }); await logout(); nav('/'); }, '');
  };

  return (
    <div className="wrap section account">
      <h1>My account</h1>
      <p className="muted">{user.name} · {user.email}</p>
      {msg && <p className="notice" role="status">{msg}</p>}
      {err && <p className="error" role="alert">{err}</p>}

      <h2>Orders</h2>
      {orders.length === 0 ? <p>No orders yet.</p> : orders.map((o) => (
        <div className="order" key={o._id}>
          <div className="between"><b>#{o._id.slice(-8).toUpperCase()}</b><span className={`status ${o.status}`}>{o.status}</span></div>
          <p className="muted small">{new Date(o.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })} · {rupees(o.total)}</p>
          <p className="small">{o.items.map((i) => `${i.name} (UK ${i.size}) × ${i.qty}`).join(', ')}</p>
          {['placed', 'packed'].includes(o.status) && <button className="link" onClick={() => cancel(o._id)}>Cancel order</button>}
        </div>
      ))}

      <div className="two-col">
        <section>
          <h2>Security</h2>
          <form className="form" onSubmit={changePw}>
            <label>Current password<input type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" /></label>
            <label>New password<input type="password" required minLength={10} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" /></label>
            <button className="btn">Change password</button>
          </form>
          <p><button className="link" onClick={logoutAll}>Sign out of all devices</button></p>
        </section>
        <section>
          <h2>Privacy &amp; data</h2>
          <label className="check"><input type="checkbox" checked={!!user.consent?.marketing} onChange={(e) => marketing(e.target.checked)} /><span>Marketing emails</span></label>
          <p><button className="btn ghost" onClick={exportData}>Download my data</button></p>
          <form className="form" onSubmit={del}>
            <label>Delete account — enter your password<input type="password" required value={delPw} onChange={(e) => setDelPw(e.target.value)} autoComplete="current-password" /></label>
            <button className="btn danger">Delete my account</button>
          </form>
        </section>
      </div>
    </div>
  );
}
