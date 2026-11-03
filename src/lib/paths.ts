/**
 * Construye rutas internas respetando `base` de astro.config.mjs.
 * Si el OVA se publica en una subcarpeta, cambie `base` y todas las rutas se ajustan.
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}
