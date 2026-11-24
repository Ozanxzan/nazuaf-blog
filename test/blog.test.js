import test from "node:test";
import assert from "node:assert/strict";
import { escapeHtml, slugify, renderBlocks, createApp } from "../src/app.js";

test("escapeHtml encodes markup and quotes", () => {
  assert.equal(escapeHtml(`<script title="x"> & 'y'</script>`),
    "&lt;script title=&quot;x&quot;&gt; &amp; &#39;y&#39;&lt;/script&gt;");
});

test("slugify makes Indonesian titles into URL-safe slugs", () => {
  assert.equal(slugify("  Cerita dari Yogyakarta: Pagi yang Cerah! "), "cerita-dari-yogyakarta-pagi-yang-cerah");
});

test("renderBlocks escapes text while rendering supported block types", () => {
  const html = renderBlocks([
    { type: "paragraph", text: "<img src=x onerror=alert(1)>" },
    { type: "heading", level: 2, text: "Judul" },
    { type: "divider" }
  ]);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /<h2>Judul<\/h2>/);
  assert.match(html, /<hr/);
  assert.doesNotMatch(html, /<img src=x/);
});

test("public pages seed content and admin login is served", async () => {
  const app = createApp();
  const home = await app.fetch(new Request("http://local/"));
  assert.equal(home.status, 200);
  assert.match(await home.text(), /Catatan yang tumbuh/);
  const article = await app.fetch(new Request("http://local/p/merawat-ide-kecil"));
  assert.equal(article.status, 200);
  const admin = await app.fetch(new Request("http://local/admin"));
  assert.equal(admin.status, 200);
  assert.match(await admin.text(), /Masuk ke ruang tulis/);
});

test("favicon route serves the inline SVG with the correct content type", async () => {
  const app = createApp();
  const response = await app.fetch(new Request("http://local/favicon.ico"));
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /image\/svg\+xml/);
  assert.match(await response.text(), /<svg[\s\S]*n\./);
});

test("new block selector is separate from existing block selectors", async () => {
  const app = createApp({ ADMIN_PASSWORD: "test-password", SESSION_SECRET: "test-session" });
  const login = await app.fetch(new Request("http://local/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "password=test-password"
  }));
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const response = await app.fetch(new Request("http://local/admin/posts/new", { headers: { Cookie: cookie } }));
  const page = await response.text();
  assert.match(page, /id="new-block-type"/);
  const script = await (await app.fetch(new Request("http://local/admin/editor.js"))).text();
  assert.match(script, /blocks\.push\(\{type:\$\('#new-block-type'\)\.value,text:''\}\)/);
  assert.doesNotMatch(script, /blocks\.push\(\{type:'paragraph',text:''\}\)/);
});

test("admin forms give every control a unique id and name", async () => {
  const app = createApp({ ADMIN_PASSWORD: "test-password", SESSION_SECRET: "test-session" });
  const login = await app.fetch(new Request("http://local/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "password=test-password"
  }));
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const pages = [
    await (await app.fetch(new Request("http://local/admin"))).text(),
    await (await app.fetch(new Request("http://local/admin/posts/new", { headers: { Cookie: cookie } }))).text(),
    await (await app.fetch(new Request("http://local/admin/posts/1", { headers: { Cookie: cookie } }))).text(),
    await (await app.fetch(new Request("http://local/admin", { headers: { Cookie: cookie } }))).text()
  ];
  for (const page of pages) {
    const controls = [...page.matchAll(/<(?:input|textarea|select|button)\b[^>]*>/g)].map(match => match[0]);
    const ids = controls.map(control => control.match(/\bid="([^"]+)"/)?.[1]);
    const names = controls.map(control => control.match(/\bname="([^"]+)"/)?.[1]);
    assert.ok(ids.every(Boolean), "every form control has an id");
    assert.ok(names.every(Boolean), "every form control has a name");
    assert.equal(new Set(ids).size, ids.length, "control ids are unique");
  }
  const script = await (await app.fetch(new Request("http://local/admin/editor.js"))).text();
  assert.match(script, /id="block-'\+i\+'-kind" name="block-'\+i\+'-kind"/);
});

const formHeaders = { "Content-Type": "application/x-www-form-urlencoded" };

test("article page renders a comment form with name and body fields", async () => {
  const app = createApp();
  const response = await app.fetch(new Request("http://local/p/belajar-melambat"));
  assert.equal(response.status, 200);
  const page = await response.text();
  assert.match(page, /<form[^>]+action="\/p\/belajar-melambat\/comments"/);
  assert.match(page, /id="comment-name"[^>]*name="name"/);
  assert.match(page, /id="comment-body"[^>]*name="body"/);
  assert.match(page, /id="comment-submit"[^>]*type="submit"/);
});

test("a valid comment redirects with 303 and shows up on the article page", async () => {
  const app = createApp();
  const posted = await app.fetch(new Request("http://local/p/belajar-melambat/comments", {
    method: "POST", headers: formHeaders,
    body: new URLSearchParams({ name: "Rani", body: "Tulisan yang menenangkan." }).toString()
  }));
  assert.equal(posted.status, 303);
  assert.equal(posted.headers.get("location"), "/p/belajar-melambat");
  const page = await (await app.fetch(new Request("http://local/p/belajar-melambat"))).text();
  assert.match(page, /Rani/);
  assert.match(page, /Tulisan yang menenangkan\./);

  const missing = await app.fetch(new Request("http://local/p/tidak-ada-slug/comments", {
    method: "POST", headers: formHeaders,
    body: new URLSearchParams({ name: "Rani", body: "Halo" }).toString()
  }));
  assert.equal(missing.status, 404);
});

test("comment output escapes HTML markup", async () => {
  const app = createApp();
  const posted = await app.fetch(new Request("http://local/p/belajar-melambat/comments", {
    method: "POST", headers: formHeaders,
    body: new URLSearchParams({ name: "<script>alert(1)</script>", body: "<b>tebal</b><img src=x onerror=alert(2)>" }).toString()
  }));
  assert.equal(posted.status, 303);
  const page = await (await app.fetch(new Request("http://local/p/belajar-melambat"))).text();
  assert.doesNotMatch(page, /<script>alert\(1\)<\/script>/);
  assert.doesNotMatch(page, /<b>tebal<\/b>/);
  assert.doesNotMatch(page, /<img src=x onerror/);
  assert.match(page, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(page, /&lt;b&gt;tebal&lt;\/b&gt;/);
});

test("comments with empty or oversized name/body are rejected and not stored", async () => {
  const app = createApp();
  const rejected = [
    new URLSearchParams({ name: "", body: "isi-tidak-boleh-muncul-xyz" }),
    new URLSearchParams({ name: "NamaUji", body: "   " }),
    new URLSearchParams({ name: "NamaUji" }),
    new URLSearchParams({ name: "n".repeat(81), body: "isi-tidak-boleh-muncul-xyz" }),
    new URLSearchParams({ name: "NamaUji", body: "b".repeat(2001) })
  ];
  for (const payload of rejected) {
    const body = typeof payload === "string" ? payload : payload.toString();
    const response = await app.fetch(new Request("http://local/p/belajar-melambat/comments", {
      method: "POST", headers: formHeaders, body
    }));
    assert.equal(response.status, 400, `expected 400 for ${body.slice(0, 40)}`);
    assert.match(await response.text(), /komentar/i);
  }
  const page = await (await app.fetch(new Request("http://local/p/belajar-melambat"))).text();
  assert.doesNotMatch(page, /isi-tidak-boleh-muncul-xyz/);
});

test("comments are listed in chronological order", async () => {
  const app = createApp();
  for (const body of ["Komentar pertama", "Komentar kedua", "Komentar ketiga"]) {
    const response = await app.fetch(new Request("http://local/p/belajar-melambat/comments", {
      method: "POST", headers: formHeaders,
      body: new URLSearchParams({ name: "Pengunjung", body }).toString()
    }));
    assert.equal(response.status, 303);
  }
  const page = await (await app.fetch(new Request("http://local/p/belajar-melambat"))).text();
  const first = page.indexOf("Komentar pertama");
  const second = page.indexOf("Komentar kedua");
  const third = page.indexOf("Komentar ketiga");
  assert.ok(first >= 0, "first comment rendered");
  assert.ok(second > first, "second comment after first");
  assert.ok(third > second, "third comment after second");
});

test("admin login rejects wrong password and grants a signed session", async () => {
  const app = createApp({ ADMIN_PASSWORD: "test-secret", SESSION_SECRET: "session-secret" });
  const wrong = await app.fetch(new Request("http://local/admin/login", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "password=nope"
  }));
  assert.equal(wrong.status, 401);
  const right = await app.fetch(new Request("http://local/admin/login", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "password=test-secret"
  }));
  assert.equal(right.status, 303);
  assert.match(right.headers.get("set-cookie"), /HttpOnly/);
});
