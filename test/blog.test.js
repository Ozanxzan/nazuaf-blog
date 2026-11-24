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
// --- Upload gambar ke R2 ---------------------------------------------------

const PUB = "https://pub-239053dedacb4db192cfd42491f1b7fb.r2.dev";

function fakeImages() {
  const puts = [];
  return {
    puts,
    async put(key, value, options) { puts.push({ key, value, options }); return {}; },
    async get() { return null; },
    async delete() { return {}; }
  };
}

async function adminCookie(app) {
  const login = await app.fetch(new Request("http://local/admin/login", {
    method: "POST", headers: formHeaders,
    body: new URLSearchParams({ password: "test-password" }).toString()
  }));
  return login.headers.get("set-cookie").split(";")[0];
}

function postUpload(app, cookie, file, field = "image") {
  const form = new FormData();
  if (file) form.append(field, file);
  return app.fetch(new Request("http://local/admin/upload", {
    method: "POST",
    headers: cookie ? { Cookie: cookie } : {},
    body: form
  }));
}

const jpegFile = (name = "foto pantai.JPG", bytes = 1024) =>
  new File([new Uint8Array(bytes)], name, { type: "image/jpeg" });

test("upload route requires an admin session and points at the login page", async () => {
  const app = createApp({ ADMIN_PASSWORD: "test-password", SESSION_SECRET: "test-session", IMAGES: fakeImages() });
  const response = await postUpload(app, null, jpegFile());
  assert.equal(response.status, 401);
  assert.match(response.headers.get("content-type"), /application\/json/);
  assert.equal(response.headers.get("location"), "/admin/login");
  const body = await response.json();
  assert.match(body.error, /masuk|login|sesi/i);

  const forged = await postUpload(app, "nazuaf_session=palsu.tanda", jpegFile());
  assert.equal(forged.status, 401);
});

test("upload stores the image under images/<yyyy-mm>/<uuid>-<nama-aman> and returns the public URL", async () => {
  const images = fakeImages();
  const app = createApp({ ADMIN_PASSWORD: "test-password", SESSION_SECRET: "test-session", IMAGES: images });
  const cookie = await adminCookie(app);
  const response = await postUpload(app, cookie, jpegFile("foto pantai.JPG"));
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/json/);
  const { url } = await response.json();

  const now = new Date();
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  assert.match(url, new RegExp(`^${PUB.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/images/${month}/[0-9a-f-]{36}-foto-pantai\\.jpg$`));

  assert.equal(images.puts.length, 1);
  const [put] = images.puts;
  assert.equal(put.key, url.slice(PUB.length + 1));
  assert.equal(put.options.httpMetadata.contentType, "image/jpeg");
});

test("upload accepts exactly 10 MB and rejects anything larger", async () => {
  const images = fakeImages();
  const app = createApp({ ADMIN_PASSWORD: "test-password", SESSION_SECRET: "test-session", IMAGES: images });
  const cookie = await adminCookie(app);

  const atLimit = await postUpload(app, cookie, jpegFile("batas.jpg", 10 * 1024 * 1024));
  assert.equal(atLimit.status, 200);

  const tooBig = await postUpload(app, cookie, jpegFile("kebesaran.jpg", 10 * 1024 * 1024 + 1));
  assert.equal(tooBig.status, 400);
  assert.match((await tooBig.json()).error, /10 ?MB/i);

  const tiny = await postUpload(app, cookie, jpegFile("kecil.jpg", 1));
  assert.equal(tiny.status, 200);
  assert.equal(images.puts.length, 2);
});

test("upload rejects unsupported types, missing files and non-ASCII names are made safe", async () => {
  const images = fakeImages();
  const app = createApp({ ADMIN_PASSWORD: "test-password", SESSION_SECRET: "test-session", IMAGES: images });
  const cookie = await adminCookie(app);

  for (const file of [
    new File(["halo"], "catatan.txt", { type: "text/plain" }),
    new File(["<svg/>"], "vektor.svg", { type: "image/svg+xml" }),
    new File(["x"], "polos.bin", { type: "" })
  ]) {
    const response = await postUpload(app, cookie, file);
    assert.equal(response.status, 400, `expected 400 for ${file.type || "tanpa tipe"}`);
    assert.match((await response.json()).error, /jpeg|png|webp|gif/i);
  }

  const missing = await postUpload(app, cookie, null);
  assert.equal(missing.status, 400);
  assert.match((await missing.json()).error, /gambar|image/i);

  const wrongField = await postUpload(app, cookie, jpegFile("salah.jpg"), "berkas");
  assert.equal(wrongField.status, 400);

  const sneaky = await postUpload(app, cookie, jpegFile("../../Nama Aneh!!.JPG"));
  assert.equal(sneaky.status, 200);
  const key = images.puts.at(-1).key;
  assert.match(key, /^images\/\d{4}-\d{2}\/[0-9a-f-]{36}-nama-aneh\.jpg$/);
  assert.doesNotMatch(key, /\.\./);
});

test("upload fails cleanly when the R2 binding is missing in local dev", async () => {
  const app = createApp({ ADMIN_PASSWORD: "test-password", SESSION_SECRET: "test-session" });
  const cookie = await adminCookie(app);
  const response = await postUpload(app, cookie, jpegFile());
  assert.equal(response.status, 503);
  assert.match(response.headers.get("content-type"), /application\/json/);
  assert.match((await response.json()).error, /R2/i);
});

test("editor exposes an upload button for image blocks and the featured image", async () => {
  const app = createApp({ ADMIN_PASSWORD: "test-password", SESSION_SECRET: "test-session" });
  const cookie = await adminCookie(app);
  const page = await (await app.fetch(new Request("http://local/admin/posts/new", { headers: { Cookie: cookie } }))).text();
  assert.match(page, /id="featured-image-upload"[^>]*name="featured_image_upload"[^>]*>Upload gambar</);
  assert.match(page, /id="featured-image-file"[^>]*name="featured_image_file"[^>]*type="file"/);
  assert.match(page, /id="featured-image-preview"/);

  const script = await (await app.fetch(new Request("http://local/admin/editor.js"))).text();
  assert.match(script, /Upload gambar/);
  assert.match(script, /'\/admin\/upload'/);
  assert.match(script, /new FormData\(\)/);
  assert.match(script, /\.append\('image',/);
  assert.match(script, /10\*1024\*1024/);
});

test("API posting menolak token yang salah atau tidak ada", async () => {
  const app = createApp({ BLOG_API_TOKEN: "token-rahasia" });
  const noToken = await app.fetch(new Request("http://local/api/posts", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Tes", content: [{ type: "paragraph", text: "isi" }] })
  }));
  assert.equal(noToken.status, 401);
  const wrong = await app.fetch(new Request("http://local/api/posts", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer salah" },
    body: JSON.stringify({ title: "Tes", content: [{ type: "paragraph", text: "isi" }] })
  }));
  assert.equal(wrong.status, 401);
});

test("API posting dengan token benar membuat tulisan yang bisa dibaca publik", async () => {
  const app = createApp({ BLOG_API_TOKEN: "token-rahasia" });
  const created = await app.fetch(new Request("http://local/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer token-rahasia" },
    body: JSON.stringify({
      title: "Catatan Harian Uji API",
      excerpt: "Ringkasan uji.",
      content: [{ type: "paragraph", text: "Isi catatan harian yang ditulis lewat API." }],
      featured_image_url: "https://example.com/gambar.jpg",
      status: "published"
    })
  }));
  assert.equal(created.status, 201);
  const data = await created.json();
  assert.equal(data.slug, "catatan-harian-uji-api");
  assert.equal(data.url, "/p/catatan-harian-uji-api");
  assert.ok(data.id);
  const page = await (await app.fetch(new Request("http://local/p/catatan-harian-uji-api"))).text();
  assert.match(page, /Catatan Harian Uji API/);
  assert.match(page, /Isi catatan harian yang ditulis lewat API/);
});

test("API posting menolak body tanpa judul atau tanpa blok isi", async () => {
  const app = createApp({ BLOG_API_TOKEN: "token-rahasia" });
  const headers = { "Content-Type": "application/json", Authorization: "Bearer token-rahasia" };
  const noTitle = await app.fetch(new Request("http://local/api/posts", { method: "POST", headers, body: JSON.stringify({ content: [] }) }));
  assert.equal(noTitle.status, 400);
  const noBlocks = await app.fetch(new Request("http://local/api/posts", { method: "POST", headers, body: JSON.stringify({ title: "Ada judul" }) }));
  assert.equal(noBlocks.status, 400);
});

test("API upload tanpa binding R2 mengembalikan 503 setelah token lolos", async () => {
  const app = createApp({ BLOG_API_TOKEN: "token-rahasia" });
  const fd = new FormData();
  fd.append("image", new File([new Uint8Array([1, 2, 3])], "tes.png", { type: "image/png" }));
  const response = await app.fetch(new Request("http://local/api/upload", {
    method: "POST", headers: { Authorization: "Bearer token-rahasia" }, body: fd
  }));
  assert.equal(response.status, 503);
});
