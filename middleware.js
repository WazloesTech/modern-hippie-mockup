// Vercel Routing Middleware: gates the whole demo site behind Supabase Auth.
// Only the one allowed account (DEMO_ALLOWED_USER_ID + DEMO_ALLOWED_EMAIL) gets in.
// Runs before the CDN cache, so protected files are never served without a valid session.

export const config = { matcher: '/((?!_vercel).*)' };

const SB_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SB_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || '';
const ALLOWED_ID = process.env.DEMO_ALLOWED_USER_ID || '';
const ALLOWED_EMAIL = (process.env.DEMO_ALLOWED_EMAIL || '').toLowerCase();

const AT = 'mh_demo_at';
const RT = 'mh_demo_rt';
const COOKIE_AGE = 60 * 60 * 24 * 30; // 30 days; the access token inside still expires hourly and is refreshed

const PUBLIC = new Set(['/login', '/login/', '/login/index.html', '/favicon.ico', '/robots.txt']);

// ---------- helpers ----------
const b64uDecode = (s) => {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};
const jsonPart = (s) => JSON.parse(new TextDecoder().decode(b64uDecode(s)));

function readCookies(req) {
  const out = {};
  (req.headers.get('cookie') || '').split(/;\s*/).forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i)] = decodeURIComponent(p.slice(i + 1));
  });
  return out;
}
const setCookie = (name, value, maxAge) =>
  `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
const sessionCookies = (s) => [setCookie(AT, s.access_token, COOKIE_AGE), setCookie(RT, s.refresh_token, COOKIE_AGE)];
const clearCookies = () => [setCookie(AT, '', 0), setCookie(RT, '', 0)];

function redirect(location, cookies = [], status = 302) {
  const h = new Headers({ location, 'cache-control': 'no-store' });
  cookies.forEach((c) => h.append('set-cookie', c));
  return new Response(null, { status, headers: h });
}
// continue to the static file (same as next() from @vercel/functions)
function pass(cookies = []) {
  const h = new Headers({ 'x-middleware-next': '1' });
  cookies.forEach((c) => h.append('set-cookie', c));
  return new Response(null, { headers: h });
}
const safeNext = (n) => (typeof n === 'string' && /^\/(?![\/\\])/.test(n) && !n.startsWith('/auth/') && !n.startsWith('/login') ? n : '/');
const allowed = (id, email) => !!ALLOWED_ID && !!ALLOWED_EMAIL && id === ALLOWED_ID && (email || '').toLowerCase() === ALLOWED_EMAIL;

// ---------- JWT check (ES256 via the project's JWKS) ----------
let jwks = null, jwksAt = 0;
async function getKey(kid) {
  if (!jwks || Date.now() - jwksAt > 10 * 60 * 1000 || !jwks[kid]) {
    const r = await fetch(`${SB_URL}/auth/v1/.well-known/jwks.json`);
    if (!r.ok) return null;
    const { keys = [] } = await r.json();
    jwks = {};
    for (const k of keys) {
      if (k.kty === 'EC' && k.crv === 'P-256') {
        jwks[k.kid] = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x: k.x, y: k.y }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
      }
    }
    jwksAt = Date.now();
  }
  return jwks[kid] || null;
}

// returns {ok:true, claims} | {ok:false, expired:bool}
async function checkToken(token) {
  try {
    if (!token) return { ok: false };
    const [h, p, s] = token.split('.');
    if (!s) return { ok: false };
    const head = jsonPart(h);
    const claims = jsonPart(p);
    if (head.alg !== 'ES256') return { ok: false };
    const key = await getKey(head.kid);
    if (!key) return { ok: false };
    const good = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, b64uDecode(s), new TextEncoder().encode(`${h}.${p}`));
    if (!good) return { ok: false };
    if (claims.iss !== `${SB_URL}/auth/v1` || claims.aud !== 'authenticated') return { ok: false };
    if (!allowed(claims.sub, claims.email)) return { ok: false };
    if (!claims.exp || claims.exp <= Math.floor(Date.now() / 1000) + 10) return { ok: false, expired: true };
    return { ok: true, claims };
  } catch {
    return { ok: false };
  }
}

async function supa(path, body, token) {
  const headers = { apikey: SB_KEY, 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  return fetch(`${SB_URL}/auth/v1/${path}`, { method: 'POST', headers, body: JSON.stringify(body || {}) });
}

async function refresh(rt) {
  if (!rt) return null;
  try {
    const r = await supa('token?grant_type=refresh_token', { refresh_token: rt });
    if (!r.ok) return null;
    const s = await r.json();
    if (!s.access_token || !s.user || !allowed(s.user.id, s.user.email)) return null;
    return s;
  } catch {
    return null;
  }
}

// ---------- handler ----------
export default async function middleware(req) {
  const url = new URL(req.url);
  const path = url.pathname;

  if (!SB_URL || !SB_KEY || !ALLOWED_ID || !ALLOWED_EMAIL) {
    return new Response('Demo site is not set up (missing settings).', { status: 503 });
  }

  // log in
  if (path === '/auth/login') {
    if (req.method !== 'POST') return redirect('/login');
    let email = '', password = '', next = '/';
    try {
      const f = await req.formData();
      email = String(f.get('email') || '').trim();
      password = String(f.get('password') || '');
      next = safeNext(String(f.get('next') || '/'));
    } catch {}
    const back = `/login?e=1${next !== '/' ? '&next=' + encodeURIComponent(next) : ''}`;
    if (!email || !password || email.toLowerCase() !== ALLOWED_EMAIL) return redirect(back, clearCookies(), 303);
    try {
      const r = await supa('token?grant_type=password', { email, password });
      if (!r.ok) return redirect(back, clearCookies(), 303);
      const s = await r.json();
      if (!s.access_token || !s.user || !allowed(s.user.id, s.user.email)) return redirect(back, clearCookies(), 303);
      return redirect(next, sessionCookies(s), 303);
    } catch {
      return redirect(back, clearCookies(), 303);
    }
  }

  // log out
  if (path === '/auth/logout') {
    const c = readCookies(req);
    if (c[AT]) {
      try { await supa('logout', {}, c[AT]); } catch {}
    }
    return redirect('/login?out=1', clearCookies(), 303);
  }

  const c = readCookies(req);

  // login page: open to everyone, but skip it when already signed in
  if (PUBLIC.has(path)) {
    if (path.startsWith('/login') && (await checkToken(c[AT])).ok) {
      return redirect(safeNext(url.searchParams.get('next')));
    }
    return pass();
  }

  // everything else needs the allowed account
  let cookies = [];
  let res = await checkToken(c[AT]);
  if (!res.ok && c[RT]) {
    const s = await refresh(c[RT]);
    if (s) {
      res = await checkToken(s.access_token);
      if (res.ok) cookies = sessionCookies(s);
    }
  }
  if (!res.ok) {
    const next = path + url.search;
    return redirect('/login' + (next !== '/' ? '?next=' + encodeURIComponent(next) : ''), (c[AT] || c[RT]) ? clearCookies() : []);
  }

  // /v1 -> /v1/ so the app's relative links work
  if (/^\/v\d+$/.test(path)) return redirect(path + '/' + url.search, cookies, 308);

  return pass(cookies);
}
