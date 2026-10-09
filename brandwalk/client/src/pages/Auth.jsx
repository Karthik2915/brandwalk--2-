import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const from = useLocation().state?.from || '/account';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await login(email, password); nav(from, { replace: true }); }
    catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
  return (
    <div className="wrap section narrow">
      <h1>Log in</h1>
      <form className="form" onSubmit={submit}>
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={254} /></label>
        <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" maxLength={128} /></label>
        {err && <p className="error" role="alert">{err}</p>}
        <button className="btn lg block" disabled={busy}>{busy ? 'Signing in…' : 'Log in'}</button>
      </form>
      <p>New to Brand Walk? <Link to="/register">Create an account</Link></p>
    </div>
  );
}

function strength(p) {
  return [p.length >= 10, /[a-z]/.test(p), /[A-Z]/.test(p), /[0-9]/.test(p)];
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [acceptTerms, setAccept] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const checks = strength(f.password);

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await register({ ...f, acceptTerms, marketing }); nav('/account', { replace: true }); }
    catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
  const rules = ['10+ characters', 'lowercase', 'UPPERCASE', 'a number'];
  return (
    <div className="wrap section narrow">
      <h1>Create account</h1>
      <form className="form" onSubmit={submit}>
        <label>Full name<input required value={f.name} onChange={on('name')} autoComplete="name" maxLength={80} /></label>
        <label>Email<input type="email" required value={f.email} onChange={on('email')} autoComplete="email" maxLength={254} /></label>
        <label>Password<input type="password" required value={f.password} onChange={on('password')} autoComplete="new-password" maxLength={128} /></label>
        <ul className="rules">{rules.map((r, i) => <li key={r} className={checks[i] ? 'ok' : ''}>{checks[i] ? '✓' : '○'} {r}</li>)}</ul>
        <label className="check"><input type="checkbox" required checked={acceptTerms} onChange={(e) => setAccept(e.target.checked)} />
          <span>I have read and agree to the <Link to="/terms" target="_blank">Terms of Service</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>. *</span></label>
        <label className="check"><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
          <span>Send me offers and news (optional — you can opt out any time).</span></label>
        {err && <p className="error" role="alert">{err}</p>}
        <button className="btn lg block" disabled={busy || !acceptTerms || !checks.every(Boolean)}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p>Already registered? <Link to="/login">Log in</Link></p>
    </div>
  );
}
