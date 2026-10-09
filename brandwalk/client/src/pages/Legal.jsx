import { Link } from 'react-router-dom';
import { BUSINESS as B } from '../lib/business.js';
import { useConsent } from '../context/ConsentContext.jsx';

function Doc({ title, children }) {
  return (
    <article className="wrap section legal">
      <h1>{title}</h1>
      <p className="muted">Last updated: {B.lastUpdated}</p>
      {children}
    </article>
  );
}

export function Privacy() {
  return (
    <Doc title="Privacy Policy">
      <p>
        {B.legalName} (“{B.brand}”, “we”, “us”) operates this website. This policy explains what personal data we collect,
        why, how we protect it and the rights you have under the Digital Personal Data Protection Act, 2023, the
        Information Technology Act, 2000 and, where applicable, the GDPR.
      </p>

      <h2>1. Data we collect</h2>
      <ul>
        <li><b>Account data:</b> name, email address and a password (stored only as a salted bcrypt hash — we can never see it).</li>
        <li><b>Order data:</b> delivery name, address, phone number, items ordered, order value and status.</li>
        <li><b>Consent records:</b> the time you accepted our Terms and Privacy Policy and your marketing preference.</li>
        <li><b>Technical data:</b> IP address and request logs kept briefly for security and fraud prevention.</li>
        <li><b>Cookie choices:</b> stored on your device (see our <Link to="/cookies">Cookie Policy</Link>).</li>
      </ul>
      <p>We do not collect card or UPI details; if online payments are enabled they are processed directly by a PCI-DSS compliant payment gateway.</p>

      <h2>2. Why we use it (purposes and legal basis)</h2>
      <ul>
        <li>To create and secure your account and process, deliver and support your orders — <i>contract / consent</i>.</li>
        <li>To prevent fraud, abuse and security incidents — <i>legitimate use</i>.</li>
        <li>To meet tax, accounting and legal obligations — <i>legal obligation</i>.</li>
        <li>To send offers and news — only if you opt in, and you can withdraw at any time.</li>
        <li>To measure and improve the site — only if you accept analytics cookies.</li>
      </ul>

      <h2>3. How we protect your data</h2>
      <ul>
        <li>All traffic is encrypted with HTTPS (TLS) and HSTS.</li>
        <li>Passwords are hashed with bcrypt (cost 12). Login sessions use short-lived tokens held in HttpOnly, Secure, SameSite=Strict cookies that scripts cannot read.</li>
        <li>Brute-force protection: rate limiting and temporary account lock after repeated failed logins.</li>
        <li>Input validation, NoSQL-injection filtering, CSRF protection and strict security headers on every request.</li>
        <li>You can sign out of all devices and change your password at any time; changing it ends every other session.</li>
        <li>Access to production data is limited to authorised staff.</li>
      </ul>
      <p>No system is perfectly secure. If a breach affecting your data occurs we will notify you and the Data Protection Board of India as required by law.</p>

      <h2>4. Who we share data with</h2>
      <p>We never sell your personal data. We share it only with service providers who act on our instructions: courier/logistics partners (name, address, phone), payment gateway (if online payment is used), hosting and database providers, and email delivery providers. Where data is processed outside India, we use providers that give equivalent protection.</p>

      <h2>5. How long we keep it</h2>
      <ul>
        <li>Account data: until you delete your account.</li>
        <li>Order records: up to 8 years, as required for tax and accounting law (personal details are anonymised when you delete your account).</li>
        <li>Security logs: up to 90 days.</li>
      </ul>

      <h2>6. Your rights</h2>
      <p>You may at any time: access your data, correct it, download a copy, withdraw consent, request erasure, nominate another person to exercise your rights, and make a complaint. Most of these are self-service in <Link to="/account">My account</Link> (“Download my data”, “Delete my account”, marketing toggle). For anything else, contact our Grievance Officer below. We respond within 30 days.</p>

      <h2>7. Children</h2>
      <p>Our store is not directed at children under 18. Accounts may only be created by adults, or by a minor with verifiable parental consent.</p>

      <h2>8. Changes</h2>
      <p>If we make material changes we will update the date above and notify registered users.</p>

      <h2>9. Contact / Grievance Officer</h2>
      <p>{B.grievanceOfficer}, {B.legalName}<br />{B.address}<br />Email: {B.email} · Phone: {B.phone}</p>
    </Doc>
  );
}

export function Terms() {
  return (
    <Doc title="Terms of Service">
      <p>By creating an account or placing an order on this website you agree to these Terms. If you do not agree, please do not use the site.</p>

      <h2>1. Who we are</h2>
      <p>This store is operated by {B.legalName}, {B.address} (GSTIN: {B.gstin}).</p>

      <h2>2. Your account</h2>
      <ul>
        <li>You must be 18 or older, or use the site under a parent/guardian’s supervision.</li>
        <li>Provide accurate information and keep your password confidential. You are responsible for activity under your account; tell us immediately if you suspect misuse.</li>
        <li>We may suspend accounts used for fraud, abuse, reselling bots or breach of these Terms.</li>
      </ul>

      <h2>3. Products and pricing</h2>
      <ul>
        <li>All prices are in Indian Rupees and include applicable taxes unless stated. Shipping is shown before you place an order.</li>
        <li>We make every effort to show colours and details accurately but screens vary.</li>
        <li>If a product is listed at an obviously incorrect price or is out of stock, we may cancel the order and refund any amount paid.</li>
        <li>Prices and stock are always confirmed on our server when you place the order.</li>
      </ul>

      <h2>4. Orders and payment</h2>
      <p>Your order is an offer to buy. A contract is formed when we confirm the order. Payment options are shown at checkout (for example, cash on delivery). We may refuse or cancel orders in cases of suspected fraud, stock errors or non-serviceable pin codes.</p>

      <h2>5. Delivery, returns and refunds</h2>
      <p>Delivery timelines, return eligibility and refunds are described in our <Link to="/shipping-returns">Shipping &amp; Returns policy</Link>, which forms part of these Terms.</p>

      <h2>6. Acceptable use</h2>
      <p>You agree not to: attempt to breach our security or probe for vulnerabilities without written permission, scrape the site, use bots to buy stock, submit false information, or use the site for unlawful purposes.</p>

      <h2>7. Intellectual property</h2>
      <p>Site content, logos and design belong to {B.brand} or the respective brand owners. Brand names are trademarks of their owners and are used to identify genuine products. You may not copy or reuse them without permission.</p>

      <h2>8. Liability</h2>
      <p>To the extent permitted by law, we are not liable for indirect or consequential losses. Our total liability for any order is limited to the amount you paid for that order. Nothing limits rights you have under the Consumer Protection Act, 2019.</p>

      <h2>9. Privacy and cookies</h2>
      <p>Use of your data is governed by our <Link to="/privacy">Privacy Policy</Link> and <Link to="/cookies">Cookie Policy</Link>.</p>

      <h2>10. Governing law and disputes</h2>
      <p>These Terms are governed by the laws of India. Courts at {B.jurisdiction} have jurisdiction, subject to your statutory consumer rights. Please contact our Grievance Officer first so we can try to resolve your concern.</p>

      <h2>11. Contact</h2>
      <p>{B.email} · {B.phone}</p>
    </Doc>
  );
}

export function Cookies() {
  const { openPanel, consent } = useConsent();
  return (
    <Doc title="Cookie Policy">
      <p>Cookies and similar technologies (such as browser local storage) are small pieces of data stored on your device. We use them as described below. Except for the strictly necessary ones, we use them only after you consent, and you can change your mind at any time.</p>
      <p><button className="btn" onClick={openPanel}>Change cookie settings</button> {consent && <span className="muted small">Saved {new Date(consent.at).toLocaleString('en-IN')}</span>}</p>

      <h2>Strictly necessary (always on)</h2>
      <div className="table-scroll" tabIndex={0} role="region" aria-label="Cookie list"><table>
        <thead><tr><th>Name</th><th>Purpose</th><th>Duration</th></tr></thead>
        <tbody>
          <tr><td><code>bw_at</code> (cookie)</td><td>Short-lived login session token. HttpOnly, Secure, SameSite=Strict.</td><td>15 minutes</td></tr>
          <tr><td><code>bw_rt</code> (cookie)</td><td>Keeps you signed in securely; only sent to the sign-in endpoints. HttpOnly, Secure, SameSite=Strict.</td><td>7 days</td></tr>
          <tr><td><code>bw_cart</code> (local storage)</td><td>Remembers items in your cart.</td><td>Until you clear it or check out</td></tr>
          <tr><td><code>bw_consent</code> (local storage)</td><td>Remembers your cookie choices.</td><td>Until you clear it</td></tr>
        </tbody>
      </table></div>

      <h2>Analytics (off unless you accept)</h2>
      <p>If you accept, we may use privacy-respecting analytics to see which pages are visited and how the site performs. Currently no analytics tool is loaded; this section will list it before one is added.</p>

      <h2>Marketing (off unless you accept)</h2>
      <p>If you accept, we may use advertising or remarketing tools to show relevant offers. Currently none are loaded.</p>

      <h2>Managing cookies</h2>
      <p>Use the button above, or your browser settings to block or delete cookies. Blocking strictly necessary cookies will stop login and cart from working.</p>
    </Doc>
  );
}

export function ShippingReturns() {
  return (
    <Doc title="Shipping & Returns">
      <h2>Shipping</h2>
      <ul>
        <li>We ship across India. Orders are usually dispatched within 1–2 business days.</li>
        <li>Standard delivery takes 3–7 business days depending on your location.</li>
        <li>Shipping is free on orders of ₹2,999 and above; otherwise a flat ₹99 applies.</li>
        <li>You will be contacted on the phone number you provide — please keep it correct.</li>
      </ul>
      <h2>Returns and exchanges</h2>
      <ul>
        <li>You may return unworn shoes in original packaging, with tags, within 7 days of delivery.</li>
        <li>Shoes that are worn outdoors, washed, damaged by the customer or missing the box are not eligible.</li>
        <li>Wrong or defective items are replaced or refunded at no cost to you — contact us within 48 hours of delivery with photos.</li>
        <li>Start a return by emailing {B.email} with your order number.</li>
      </ul>
      <h2>Cancellations</h2>
      <p>Orders can be cancelled from <Link to="/account">My account</Link> until they are shipped.</p>
      <h2>Refunds</h2>
      <p>Approved refunds are issued to the original payment method within 7–10 business days of us receiving the return. For cash-on-delivery orders we refund by bank transfer/UPI to details you provide.</p>
    </Doc>
  );
}

export function Contact() {
  return (
    <Doc title="Contact & Grievances">
      <p>Questions about an order, your data or anything else? We’re here to help.</p>
      <ul>
        <li>Email: {B.email}</li>
        <li>Phone: {B.phone}</li>
        <li>Address: {B.address}</li>
      </ul>
      <h2>Grievance Officer</h2>
      <p>In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020:</p>
      <p>{B.grievanceOfficer}<br />{B.email}<br />We acknowledge complaints within 48 hours and resolve them within one month.</p>
    </Doc>
  );
}
