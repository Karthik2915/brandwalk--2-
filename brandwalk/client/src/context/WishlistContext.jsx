import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const Ctx = createContext(null);
export const useWishlist = () => useContext(Ctx);
const KEY = 'bw_wishlist';

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(v) ? v.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

// Wishlist is stored as product slugs on this device only (strictly-necessary local storage, no tracking).
export function WishlistProvider({ children }) {
  const [slugs, setSlugs] = useState(load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(slugs)); } catch { /* storage unavailable */ }
  }, [slugs]);
  const value = useMemo(() => ({
    slugs,
    has: (s) => slugs.includes(s),
    toggle: (s) => setSlugs((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s])),
  }), [slugs]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
