# Brand Walk — MERN footwear store

MongoDB · Express · React (Vite) · Node. INR pricing, COD checkout, secure auth, legal pages, cookie consent.

## Run it locally
```bash
npm run install:all
cp server/.env.example server/.env      # put real random secrets in it (generator command is inside the file)
# MongoDB: local `mongod`, or a free MongoDB Atlas URI in MONGO_URI
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='ChangeMe12345' npm run seed   # 12 demo shoes + admin user
npm run dev            # starts API (:5000) and site (:5173) together
# or separately: npm run dev:server  /  npm run dev:client
```

**Seeing `ECONNREFUSED` / "http proxy error" in the browser terminal?** The API isn't running. Look at the `api` lines of `npm run dev`: they say whether MongoDB failed to connect (wrong `MONGO_URI`, Atlas IP not allowed) or `.env` is missing.

**Demo mode:** if the API or database isn't reachable (or has no products yet), the site automatically shows a built-in sample catalog of 36 shoes, with a yellow notice bar. `npm run seed` loads the same catalog (`shared/products.json`) into MongoDB. Edit that file to change the demo products.

## Adding real product photos
Drop images into `client/src/assets/products/` named after the product slug (e.g. `oxford-heritage.png`). They replace the drawn shoes everywhere automatically: cards, product page, cart, wishlist. Also `hero.png` and `about.png` for the home page. Best: transparent PNG/WebP cut-outs, side view, ~1200px wide. The folder's `README.txt` lists every slug. For products stored in MongoDB you can instead put image URLs in the product's `images` array. Only use photos you own or that the brand/distributor has licensed to you.

## What's inside
| Area | Details |
|---|---|
| Storefront | Home, shop with search/filter/sort/pagination, product page with size picker, cart, checkout (COD), order confirmation |
| Accounts | Register, login, order history + cancel, change password, sign out everywhere, **download my data**, **delete my account** |
| Admin API | Create/update/delete products, list all orders, update status (log in as the seeded admin) |
| Legal | Privacy Policy, Terms of Service, Cookie Policy, Shipping & Returns, Contact/Grievance (India: DPDP Act 2023, IT Act, E-Commerce Rules 2020). Business details live in `client/src/lib/business.js` |
| Cookies | Opt-in banner (Accept / Reject / Customise), versioned + timestamped choice, reopenable from the footer. Analytics/marketing are OFF until consent: gate any script on `useConsent().consent.analytics` |

## Security measures
- Passwords: bcrypt cost 12, strong-password rules, never returned or logged.
- Sessions: 15-min access JWT + 7-day refresh JWT in **HttpOnly / Secure / SameSite=Strict cookies** (unreadable by JavaScript). Refresh tokens are stored hashed, **rotated on every use; reuse revokes all sessions**.
- Brute force: global + stricter auth rate limits, lockout after 5 failed logins, generic error messages, dummy-hash compare for unknown emails.
- CSRF: SameSite=Strict + mandatory `X-Requested-With` header on state-changing requests; CORS locked to `CLIENT_ORIGIN`.
- Injection: Zod validation on all input, `express-mongo-sanitize`, `hpp`, 10 KB body limit, `$text` search (no user regex).
- Headers: Helmet (CSP, HSTS in prod, nosniff, no-referrer, frame-ancestors none), `x-powered-by` removed.
- Business logic: prices always read from the DB, atomic stock reservation with rollback, orders scoped to owner (no IDOR), admin routes role-checked.
- Privacy: consent timestamps stored, data export + erasure endpoints, orders anonymised on deletion, request bodies never logged. React escapes output by default; no `dangerouslySetInnerHTML` is used.

## Deploying
- API (Render/Railway/Fly): `NODE_ENV=production`, `MONGO_URI` (Atlas), both JWT secrets, `CLIENT_ORIGIN=https://yourshop.com`. The server refuses to start in production with placeholder secrets.
- Client (Vercel/Netlify): `npm run build`; set `VITE_API_URL=https://api.yourshop.com/api`.
- Cookies are SameSite=Strict, so host the site and API on the same site (e.g. `shop.com` + `api.shop.com`) over HTTPS.
- Enable Atlas backups, IP allow-list and a least-privilege DB user. Run `npm audit` regularly.

## Before you hand it to the client
1. Fill the placeholders in `client/src/lib/business.js` (legal name, address, GSTIN, grievance officer, email, phone).
2. Have a lawyer review the legal pages: they are solid templates, not legal advice.
3. Replace the built-in shoe illustrations (7 drawn silhouettes tinted per product) with real photos (`images: [url]` per product).
4. Add a payment gateway (Razorpay/Stripe) in `server/src/routes/orders.js`, plus email (order confirmation, verification, password reset). Not included yet.
5. Apply the client's logo and colours in `client/src/styles.css` (`:root`).

## Pitch notes
- **Selling points:** secure logins, legal compliance pages, mobile-friendly design, fast search and filters, COD checkout, order history, admin-managed catalogue.
- **Upsell ideas:** UPI/Razorpay payments, admin dashboard UI, email/SMS/WhatsApp order updates, reviews and ratings, wishlist, coupons, low-stock alerts, SEO + analytics, hosting and monthly maintenance retainer.
