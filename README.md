# Modern Hippie demos

Private demo site, served at https://demo.modernhippie.com (Vercel project `modern-hippie-demo`).

- `public/login/` – login page (Supabase Auth, one allowed account, no sign-up)
- `public/index.html` – version picker (add new versions to the `VERSIONS` list)
- `public/v1/` – Hybrid app demo v1 (lo-fi mockup app, entry `home7.html`)
- `public/v1/flows.html` – v1 flow map (live screens + notes in Supabase `demo` schema)
- `public/v1/login.html`, `signup.html`, `forgot-password.html`, `reset-password.html` – the app's own log in / sign up screens (lo-fi copies of modernhippie.com; demo only, no real auth). Not the same as the demo gate at `/login`.
- `middleware.js` – Vercel Routing Middleware; every path except `/login` needs a valid session for the allowed account
- `index.html` (repo root) – redirect for the old GitHub Pages URL

Vercel env vars: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `DEMO_ALLOWED_USER_ID`, `DEMO_ALLOWED_EMAIL`.
