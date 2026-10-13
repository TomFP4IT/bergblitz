// Link-only access gate. When ACCESS_TOKEN is set, the site is reachable only
// via `?zugang=<token>` (which sets a cookie) or with that cookie present.
// Without ACCESS_TOKEN the middleware is a no-op and the site is public.

export interface Env {
  ACCESS_TOKEN?: string;
}

export const ACCESS_PARAM = "zugang";
export const ACCESS_COOKIE = "bb_access";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

const DENIED_HTML = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Nicht öffentlich</title>
<style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;padding:1rem;text-align:center}</style>
</head>
<body>
<main>
<h1>Diese Seite ist nicht öffentlich.</h1>
<p>Bitte verwende den Zugangslink, den du erhalten hast.</p>
<p lang="en">This site is not public. Please use the access link you received.</p>
</main>
</body>
</html>`;

function denied(): Response {
  return new Response(DENIED_HTML, {
    status: 403,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context;
  const token = env.ACCESS_TOKEN;
  if (!token) return next();

  const url = new URL(request.url);
  const supplied = url.searchParams.get(ACCESS_PARAM);

  if (supplied !== null) {
    if (!safeEqual(supplied, token)) return denied();
    url.searchParams.delete(ACCESS_PARAM);
    return new Response(null, {
      status: 302,
      headers: {
        location: url.pathname + url.search + url.hash,
        "set-cookie": `${ACCESS_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        "cache-control": "no-store",
      },
    });
  }

  const cookie = readCookie(request.headers.get("cookie"), ACCESS_COOKIE);
  if (cookie === undefined || !safeEqual(cookie, token)) return denied();

  const response = await next();
  const gated = new Response(response.body, response);
  gated.headers.set("x-robots-tag", "noindex, nofollow");
  gated.headers.set("cache-control", "private, no-store");
  return gated;
};
