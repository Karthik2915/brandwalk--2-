// Product photos: any file in src/assets/products named <slug>.(png|webp|jpg|jpeg|avif) is picked up automatically.
const files = import.meta.glob('../assets/products/*.{png,webp,jpg,jpeg,avif}', { eager: true, query: '?url', import: 'default' });

const bySlug = {};
for (const [path, url] of Object.entries(files)) {
  const name = path.split('/').pop().replace(/\.[^.]+$/, '');
  bySlug[name] = url;
}

export const photoFor = (slug) => bySlug[slug] || null;
export const heroPhoto = bySlug.hero || null;
export const aboutPhoto = bySlug.about || null;
