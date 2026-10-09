import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);
const KEY = 'bw_cart';

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// Cart lines store display info only. Prices are re-read from the server at checkout.
export function CartProvider({ children }) {
  const [items, setItems] = useState(load);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage unavailable */ }
  }, [items]);

  const api = useMemo(() => {
    const same = (a, b) => a.productId === b.productId && a.size === b.size;
    return {
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.price * i.qty, 0),
      toast,
      dismissToast: () => setToast(null),
      add: (line) => {
        setToast({ name: line.name, size: line.size, at: Date.now() });
        setItems((cur) => {
          const found = cur.find((i) => same(i, line));
          if (found) return cur.map((i) => (same(i, line) ? { ...i, qty: Math.min(10, i.qty + line.qty) } : i));
          return [...cur, line];
        });
      },
      setQty: (line, qty) =>
        setItems((cur) => cur.map((i) => (same(i, line) ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i))),
      remove: (line) => setItems((cur) => cur.filter((i) => !same(i, line))),
      clear: () => setItems([]),
    };
  }, [items, toast]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
