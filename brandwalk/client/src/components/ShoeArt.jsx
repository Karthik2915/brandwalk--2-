import { useId } from 'react';

// Self-contained, generic shoe illustrations (no brand marks). One silhouette per `shape`,
// tinted by the product's two colours. Replace with real photos via product.images.
function shade(hex, amt) {
  const n = parseInt((hex || '#222222').slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, v + amt));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

const SOLE_LIGHT = '#f6f3ee';
const SOLE_DARK = '#1b1917';

export default function ShoeArt({ color = '#222222', color2 = '#f4f1ea', shape = 'sneaker', className = '' }) {
  const id = useId().replace(/:/g, '');
  const up = `url(#u${id})`;
  const dark = shape === 'oxford' || shape === 'loafer' || shape === 'boot';
  const sole = dark ? SOLE_DARK : SOLE_LIGHT;
  const ink = 'rgba(0,0,0,.28)';

  const parts = {
    sneaker: (
      <>
        <path d="M50 190C48 160 52 128 66 104c6-10 18-14 30-8 16 8 32 12 50 4 22-10 40-30 62-26 24 4 36 26 64 42 32 18 70 24 80 48 4 12 2 22-2 28z" fill={up} />
        <path d="M296 128c26 10 50 20 56 36 4 12 2 22-2 28h-58c8-22 12-42 4-64z" fill={color2} opacity=".92" />
        <path d="M50 190C48 160 52 128 66 104h24c-8 26-10 56-6 86z" fill={color2} opacity=".92" />
        <path d="M150 98l24 18M176 88l24 18M204 86l24 16" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        <path d="M112 150c40-6 90-2 150 22" stroke="rgba(255,255,255,.5)" strokeWidth="4" strokeLinecap="round" fill="none" />
      </>
    ),
    runner: (
      <>
        <path d="M46 192C42 160 48 126 64 104c8-10 20-12 32-6 18 8 32 10 52 2 20-8 36-26 58-22 26 4 38 28 66 44 30 16 64 22 76 46 4 10 2 22 0 28z" fill={up} />
        <path d="M60 150c60-30 150-28 262 22" stroke={color2} strokeWidth="14" strokeLinecap="round" fill="none" opacity=".95" />
        <path d="M150 104l26 14M178 94l26 14M206 92l24 14" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        <g stroke="rgba(255,255,255,.35)" strokeWidth="3" strokeLinecap="round">
          <path d="M270 128l22 12M262 142l22 12M254 156l22 12" />
        </g>
        <path d="M40 188h326c6 0 8 6 8 10v10c0 14-10 22-24 22H72c-20 0-34-12-34-30z" fill={color2} />
      </>
    ),
    high: (
      <>
        <path d="M54 190C50 140 54 80 72 42h66c2 26 6 46 18 54 14 10 32 6 48-2 22-10 36-24 56-18 24 8 34 28 62 44 28 16 40 26 40 46 0 14-2 24-8 26z" fill={up} />
        <path d="M72 42h66c1 12 3 22 6 31H66c2-10 4-21 6-31z" fill={color2} />
        <path d="M54 190c-4-30-4-62 0-90l24 4c-6 28-6 58-2 86z" fill={color2} opacity=".9" />
        <path d="M292 122c24 12 50 22 54 38 3 12 1 24-4 30h-58c10-22 12-44 8-68z" fill="#f6f3ee" />
        <path d="M110 70l30 8M108 92l34 8M114 114l32 8M156 100l22 10" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        <circle cx="94" cy="150" r="14" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="4" />
      </>
    ),
    oxford: (
      <>
        <path d="M50 192C48 164 54 136 68 118c12-14 38-12 60-6 30 8 52 4 82 10 42 8 100 30 134 56 10 8 10 14 6 18z" fill={up} />
        <path d="M292 140c28 14 54 30 62 44l-102 4c18-12 32-28 40-48z" fill={color2} opacity=".5" />
        <path d="M268 132c12 10 20 22 22 56" stroke="rgba(0,0,0,.25)" strokeWidth="3" fill="none" />
        <path d="M140 116l22 10M166 112l22 10M192 114l22 10" stroke={color2} strokeWidth="6" strokeLinecap="round" />
        <g fill="rgba(0,0,0,.28)"><circle cx="322" cy="168" r="3" /><circle cx="308" cy="160" r="3" /><circle cx="334" cy="176" r="3" /><circle cx="296" cy="152" r="3" /></g>
        <path d="M44 192h316c4 0 6 3 6 6v6H112v24H46c-4 0-6-3-6-8z" fill={sole} />
      </>
    ),
    loafer: (
      <>
        <path d="M50 192C48 164 54 136 70 120c14-14 40-14 64-8 28 8 48 2 76 8 46 10 100 30 134 56 10 8 10 14 6 18z" fill={up} />
        <path d="M130 118c34 4 60 18 78 8" stroke="rgba(0,0,0,.3)" strokeWidth="4" fill="none" />
        <path d="M170 126h60c4 0 6 6 2 10l-18 12c-6 4-14 4-20 0l-24-12c-4-4-2-10 0-10z" fill={color2} />
        <path d="M262 136c18 8 34 18 42 28" stroke="rgba(255,255,255,.35)" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M44 192h316c4 0 6 3 6 6v6H110v22H46c-4 0-6-3-6-8z" fill={sole} />
      </>
    ),
    boot: (
      <>
        <path d="M56 194C52 140 56 70 74 30h92c0 30 4 50 18 62 18 14 40 14 62 28 30 18 74 28 82 56 3 10 2 18-2 22z" fill={up} />
        <path d="M74 30h92c0 10 1 18 2 26H70c1-9 2-17 4-26z" fill={color2} opacity=".9" />
        <path d="M120 70l36 10M116 94l40 10M118 118l38 10M126 142l32 10" stroke="#e9e2d6" strokeWidth="6" strokeLinecap="round" />
        <path d="M240 130c30 12 60 24 74 42" stroke="rgba(0,0,0,.25)" strokeWidth="3" fill="none" />
        <path d="M44 192h322v12c0 10-6 14-12 14l-4 12H62l-4-12c-10 0-18-4-18-14z" fill={sole} />
        <g stroke="rgba(255,255,255,.25)" strokeWidth="3">{Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M${64 + i * 22} 224v10`} />)}</g>
      </>
    ),
    sandal: (
      <>
        <path d="M40 212c0-16 8-26 24-30l282-30c18-2 28 8 28 22 0 18-10 28-30 28H74c-20 0-34-4-34-10z" fill={sole === SOLE_DARK ? SOLE_DARK : color2} />
        <path d="M40 212c0 12 14 22 34 22h250c20 0 32-8 34-20" fill="none" stroke={ink} strokeWidth="3" />
        <path d="M120 188c10-52 50-68 96-58" stroke={up} strokeWidth="26" strokeLinecap="round" fill="none" />
        <path d="M224 170c-30-8-60 0-84 20" stroke={up} strokeWidth="24" strokeLinecap="round" fill="none" opacity=".9" />
        <path d="M70 188c-10-30 0-56 18-66" stroke={up} strokeWidth="22" strokeLinecap="round" fill="none" />
        <circle cx="150" cy="150" r="7" fill="#fff" />
      </>
    ),
  };

  const withSole = shape !== 'oxford' && shape !== 'loafer' && shape !== 'boot' && shape !== 'sandal' && shape !== 'runner';

  return (
    <svg viewBox="0 0 400 260" className={className} role="img" aria-label={`${shape} shoe illustration`}>
      <defs>
        <linearGradient id={`u${id}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={shade(color, 34)} />
          <stop offset="1" stopColor={shade(color, -38)} />
        </linearGradient>
        {/* soft studio lighting: specular highlight added over the flat colours for a glossy, 3D feel */}
        <filter id={`l${id}`} x="-5%" y="-10%" width="110%" height="125%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4.5" result="blur" />
          <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".6" specularExponent="30" lightingColor="#ffffff" result="spec">
            <fePointLight x="110" y="-50" z="170" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3=".38" k4="0" />
        </filter>
      </defs>
      <ellipse cx="205" cy="240" rx="165" ry="10" fill="rgba(0,0,0,.14)" />
      <g filter={`url(#l${id})`}>
        <g stroke="rgba(0,0,0,.22)" strokeWidth="1.6" strokeLinejoin="round">{parts[shape] || parts.sneaker}</g>
      {withSole && (
        <g stroke="rgba(0,0,0,.2)" strokeWidth="1.6" strokeLinejoin="round">
          <path d="M42 190h316c4 0 6 4 6 8v14c0 12-8 20-22 20H70c-18 0-30-10-30-24z" fill={sole} />
          <path d="M44 204h320" stroke="rgba(0,0,0,.12)" strokeWidth="3" />
        </g>
      )}
      </g>
    </svg>
  );
}
