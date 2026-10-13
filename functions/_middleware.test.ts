import { test } from "node:test";
import assert from "node:assert/strict";
import { onRequest, ACCESS_COOKIE } from "./_middleware.js";

const TOKEN = "s3cret-token";

function run(
  url: string,
  env: Record<string, string | undefined>,
  headers: Record<string, string> = {},
): { response: Promise<Response>; nextCalled: () => boolean } {
  let called = false;
  const context = {
    request: new Request(url, { headers }),
    env,
    next: async () => {
      called = true;
      return new Response("<h1>site</h1>", {
        status: 200,
        headers: { "cache-control": "public, max-age=60" },
      });
    },
  } as unknown as Parameters<typeof onRequest>[0];
  return {
    response: Promise.resolve(onRequest(context)),
    nextCalled: () => called,
  };
}

test("no ACCESS_TOKEN → site is public", async () => {
  const r = run("https://x/kontakt/", {});
  const res = await r.response;
  assert.equal(res.status, 200);
  assert.ok(r.nextCalled());
});

test("no link, no cookie → 403 with noindex", async () => {
  const r = run("https://x/", { ACCESS_TOKEN: TOKEN });
  const res = await r.response;
  assert.equal(res.status, 403);
  assert.equal(res.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(r.nextCalled(), false);
});

test("wrong token in link → 403, no cookie", async () => {
  const r = run("https://x/?zugang=nope", { ACCESS_TOKEN: TOKEN });
  const res = await r.response;
  assert.equal(res.status, 403);
  assert.equal(res.headers.get("set-cookie"), null);
});

test("correct link → cookie + redirect to clean URL", async () => {
  const r = run(`https://x/en/about/?zugang=${TOKEN}&a=1`, {
    ACCESS_TOKEN: TOKEN,
  });
  const res = await r.response;
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("location"), "/en/about/?a=1");
  const cookie = res.headers.get("set-cookie") ?? "";
  assert.match(cookie, new RegExp(`^${ACCESS_COOKIE}=${TOKEN};`));
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
});

test("valid cookie → page served with noindex", async () => {
  const r = run(
    "https://x/kontakt/",
    { ACCESS_TOKEN: TOKEN },
    { cookie: `other=1; ${ACCESS_COOKIE}=${TOKEN}` },
  );
  const res = await r.response;
  assert.equal(res.status, 200);
  assert.ok(r.nextCalled());
  assert.equal(res.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(await res.text(), "<h1>site</h1>");
});

test("stale cookie (token rotated) → 403", async () => {
  const r = run(
    "https://x/",
    { ACCESS_TOKEN: TOKEN },
    { cookie: `${ACCESS_COOKIE}=old-token` },
  );
  const res = await r.response;
  assert.equal(res.status, 403);
});
