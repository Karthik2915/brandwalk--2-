import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConsent } from '../context/ConsentContext.jsx';

export default function CookieBanner() {
  const { decided, consent, acceptAll, rejectAll, save, panelOpen, openPanel, closePanel } = useConsent();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (panelOpen) {
      setAnalytics(!!consent?.analytics);
      setMarketing(!!consent?.marketing);
    }
  }, [panelOpen, consent]);

  if (decided && !panelOpen) return null;

  return (
    <div className="cookie" role="dialog" aria-modal="false" aria-labelledby="ck-t">
      <h2 id="ck-t">We value your privacy</h2>
      <p>
        We use essential cookies and local storage to keep you signed in and remember your cart. With your permission we
        would also use analytics and marketing technologies. Read our <Link to="/cookies">Cookie Policy</Link> and{' '}
        <Link to="/privacy">Privacy Policy</Link>.
      </p>
      {panelOpen && (
        <div className="ck-opts">
          <label><input type="checkbox" checked disabled /> <b>Strictly necessary</b> — login session, cart, security. Always on.</label>
          <label><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> <b>Analytics</b> — helps us understand how the site is used.</label>
          <label><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> <b>Marketing</b> — personalised offers and ads.</label>
        </div>
      )}
      <div className="ck-btns">
        {panelOpen ? (
          <>
            <button className="btn" onClick={() => save(analytics, marketing)}>Save choices</button>
            <button className="btn ghost" onClick={closePanel}>Cancel</button>
          </>
        ) : (
          <>
            <button className="btn" onClick={acceptAll}>Accept all</button>
            <button className="btn" onClick={rejectAll}>Reject non-essential</button>
            <button className="btn ghost" onClick={openPanel}>Customise</button>
          </>
        )}
      </div>
    </div>
  );
}
