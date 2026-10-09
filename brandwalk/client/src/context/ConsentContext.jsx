import { createContext, useContext, useState, useCallback } from 'react';

const Ctx = createContext(null);
export const useConsent = () => useContext(Ctx);
const KEY = 'bw_consent';
const VERSION = 1;

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return v && v.version === VERSION ? v : null;
  } catch {
    return null;
  }
}

/**
 * Consent is opt-in. "necessary" is always on; analytics/marketing default to OFF.
 * Any analytics or marketing script must be loaded ONLY when consent.analytics / consent.marketing is true.
 */
export function ConsentProvider({ children }) {
  const [consent, setConsent] = useState(load);
  const [panelOpen, setPanelOpen] = useState(false);

  const save = useCallback((analytics, marketing) => {
    const v = { version: VERSION, necessary: true, analytics, marketing, at: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* ignore */ }
    setConsent(v);
    setPanelOpen(false);
  }, []);

  return (
    <Ctx.Provider
      value={{
        consent,
        decided: !!consent,
        acceptAll: () => save(true, true),
        rejectAll: () => save(false, false),
        save,
        panelOpen,
        openPanel: () => setPanelOpen(true),
        closePanel: () => setPanelOpen(false),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
