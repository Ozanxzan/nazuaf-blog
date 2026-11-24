const seedPosts = [
  {
    slug: "merawat-ide-kecil", title: "Merawat ide kecil sampai tumbuh",
    excerpt: "Catatan tentang memberi ruang pada gagasan sederhana, tanpa terburu-buru menjadikannya sesuatu yang besar.",
    content_json: JSON.stringify([
      { type: "paragraph", text: "Tidak semua hal baik datang sebagai rencana besar. Kadang ia mulai dari pertanyaan kecil yang terus kembali." },
      { type: "heading", level: 2, text: "Mulai dengan perhatian" },
      { type: "paragraph", text: "Tuliskan apa yang membuatmu penasaran. Beri waktu untuk mengamati, mencoba, dan mengubah arah." },
      { type: "quote", text: "Ide yang dirawat dengan sabar punya kesempatan untuk menemukan bentuknya sendiri." }
    ]),
    featured_image_url: "", seo_title: "", seo_description: ""
  },
  {
    slug: "ritual-pagi-yang-sederhana", title: "Ritual pagi yang sederhana",
    excerpt: "Pagi yang tenang tak harus sempurna. Beberapa menit tanpa tergesa sudah cukup untuk memulai.",
    content_json: JSON.stringify([
      { type: "paragraph", text: "Aku mencoba memulai hari tanpa membuka banyak tab sekaligus. Segelas air, jendela yang terbuka, dan satu halaman catatan." },
      { type: "heading", level: 2, text: "Sisakan sedikit ruang" },
      { type: "list", items: ["Jauhkan ponsel selama beberapa menit", "Pilih satu hal penting untuk hari ini", "Terima bahwa sisanya bisa menunggu"] }
    ]),
    featured_image_url: "", seo_title: "", seo_description: ""
  },
  {
    slug: "belajar-melambat", title: "Belajar melambat di tengah ramai",
    excerpt: "Mencari jeda kecil di antara notifikasi, pekerjaan, dan hari-hari yang terasa penuh.",
    content_json: JSON.stringify([
      { type: "paragraph", text: "Melambat bukan berarti berhenti. Ini cara untuk kembali menyadari langkah yang sedang kita ambil." },
      { type: "divider" },
      { type: "paragraph", text: "Satu napas dalam sebelum berpindah tugas bisa menjadi awal yang baik." }
    ]),
    featured_image_url: "", seo_title: "", seo_description: ""
  }
].map((p, i) => ({ ...p, status: "published", id: i + 1, created_at: `2026-01-${String(20 - i * 3).padStart(2, "0")}T08:00:00.000Z`, updated_at: new Date().toISOString() }));

export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

export function slugify(value = "") {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function renderBlocks(blocks = []) {
  if (!Array.isArray(blocks)) return "";
  const inline = value => escapeHtml(value || "")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
  return blocks.map(block => {
    const text = inline(block.text || "");
    switch (block.type) {
      case "paragraph": return `<p>${text}</p>`;
      case "heading": { const n = Math.min(3, Math.max(2, Number(block.level) || 2)); return `<h${n}>${text}</h${n}>`; }
      case "image": return block.url ? `<figure><img src="${escapeHtml(block.url)}" alt="${escapeHtml(block.alt || "")}" loading="lazy"></figure>` : "";
      case "quote": return `<blockquote>${text}</blockquote>`;
      case "list": return `<ul>${(block.items || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
      case "code": return `<pre><code>${text}</code></pre>`;
      case "divider": return "<hr>";
      default: return "";
    }
  }).join("\n");
}

const css = `
:root{color-scheme:light;--ink:#182331;--muted:#697786;--line:#e4eaf0;--paper:#fff;--wash:#f5f8fb;--green:#247653;--green-light:#e7f3ed;--serif:Georgia,'Times New Roman',serif;--sans:Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.65 var(--sans)}a{color:inherit;text-decoration:none}a:hover{color:var(--green)}button,input,textarea,select{font:inherit}button,.button{cursor:pointer;border:0;border-radius:8px;background:var(--green);color:#fff;padding:11px 17px;font-weight:650}button:hover,.button:hover{background:#195d40;color:#fff}button.secondary,.button.secondary{background:#edf2f5;color:var(--ink)}:focus-visible{outline:3px solid #7bb79a;outline-offset:3px}
.wrap{width:min(1080px,calc(100% - 40px));margin:auto}.top{height:76px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between}.brand{font:700 23px var(--serif);letter-spacing:-.6px}.brand span{color:var(--green)}.nav{display:flex;gap:24px;align-items:center;color:var(--muted);font-size:14px}.hero{padding:84px 0 58px;max-width:760px}.hero h1{font:500 clamp(42px,7vw,76px)/1.06 var(--serif);letter-spacing:-2.7px;margin:12px 0 20px}.hero p{color:var(--muted);font-size:18px;max-width:590px;margin:0}.eyebrow{color:var(--green);font-size:13px;font-weight:700}.toolbar{padding:20px 0 28px;border-top:1px solid var(--line);display:flex;gap:12px;align-items:center;justify-content:space-between}.search{display:flex;gap:8px}.search input{width:min(300px,58vw)}input,textarea,select{padding:11px 13px;border:1px solid #d5dee6;border-radius:7px;background:#fff;color:var(--ink);width:100%}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;padding-bottom:84px}.card{min-width:0}.cover{height:205px;background:linear-gradient(135deg,#e5f1eb,#f1f5f8);border-radius:9px;overflow:hidden;margin-bottom:18px}.cover img{width:100%;height:100%;object-fit:cover}.card time,.meta{color:var(--muted);font-size:13px}.card h2{font:500 25px/1.23 var(--serif);letter-spacing:-.4px;margin:8px 0}.card p{font-size:14px;color:var(--muted);margin:8px 0}.read{font-size:14px;color:var(--green);font-weight:650}.empty{padding:40px 0;color:var(--muted)}footer{border-top:1px solid var(--line);padding:26px 0;color:var(--muted);font-size:13px}
.article{max-width:740px;margin:0 auto;padding:68px 20px 92px}.article h1{font:500 clamp(42px,6vw,66px)/1.08 var(--serif);letter-spacing:-2px;margin:10px 0 18px}.article .dek{font:20px/1.55 var(--serif);color:var(--muted);margin:0 0 30px}.article-cover{width:100%;max-height:460px;object-fit:cover;border-radius:10px;margin:4px 0 28px}.prose{font:19px/1.85 var(--serif)}.prose h2{font:500 32px/1.2 var(--serif);margin:42px 0 12px}.prose p{margin:0 0 24px}.prose blockquote{margin:34px 0;padding:4px 0 4px 22px;border-left:3px solid var(--green);font-size:23px;color:#3c4d59}.prose hr{border:0;border-top:1px solid var(--line);margin:38px 0}.prose pre{white-space:pre-wrap;background:var(--wash);padding:18px;border-radius:8px;font:15px/1.6 ui-monospace,monospace}.prose figure{margin:28px 0}.prose img{max-width:100%;border-radius:8px}.prose li{padding:4px 0}
.comments{border-top:1px solid var(--line);margin-top:52px;padding-top:34px}.comments h2{font:500 28px/1.25 var(--serif);letter-spacing:-.4px;margin:0 0 20px}.comment-form .field{margin:0 0 14px}.comment-form label{display:block;font-size:13px;font-weight:650;margin-bottom:6px}.comment-form textarea{min-height:120px;resize:vertical}.comment-form button{margin-top:4px}.comment-list{list-style:none;margin:0 0 8px;padding:0}.comment-list li{border-top:1px solid var(--line);padding:18px 0}.comment-list li:first-child{border-top:0}.comment-list .who{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:6px}.comment-list .who strong{font:650 15px var(--sans)}.comment-list .who time{color:var(--muted);font-size:13px}.comment-list p{margin:0;font:16px/1.7 var(--sans);white-space:pre-wrap;overflow-wrap:anywhere}.comment-empty{color:var(--muted);font-size:14px}.comment-error{border:1px solid #e6c9c6;background:#fbf1f0;border-radius:8px;padding:14px 16px;margin:0 0 20px;color:#8c3a34}.comment-error ul{margin:8px 0 0;padding-left:20px}
.admin-shell{min-height:100vh;background:var(--wash)}.admin-header{background:#fff;border-bottom:1px solid var(--line);padding:16px 0}.admin-main{padding:36px 0}.admin-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.admin-title h1{font:500 36px var(--serif);margin:0}.table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);border-radius:9px;overflow:hidden}.table th,.table td{text-align:left;padding:14px 16px;border-bottom:1px solid var(--line)}.table th{font-size:12px;color:var(--muted);font-weight:650}.table td{font-size:14px}.pill{background:#edf2f5;border-radius:20px;padding:3px 9px;font-size:12px}.pill.published{background:var(--green-light);color:var(--green)}.actions{display:flex;gap:8px}.actions a,.actions button{padding:7px 10px;font-size:13px}.login{width:min(430px,calc(100% - 36px));margin:10vh auto;background:#fff;border:1px solid var(--line);border-radius:12px;padding:34px}.login h1{font:500 34px var(--serif);margin:0 0 8px}.login p{color:var(--muted);margin:0 0 24px}.login label{display:block;font-size:13px;font-weight:650;margin-bottom:8px}.login button{width:100%;margin-top:16px}.error{color:#a13b35;font-size:14px;margin-top:12px}
.editor{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:24px}.panel{background:white;border:1px solid var(--line);border-radius:9px;padding:20px;margin-bottom:16px}.field{margin:0 0 16px}.field label{display:block;font-size:13px;font-weight:650;margin-bottom:6px}.field textarea{min-height:90px;resize:vertical}.title-input{font:500 34px/1.2 var(--serif);border:0;border-bottom:1px solid var(--line);border-radius:0;padding:8px 0;margin-bottom:18px}.block{border:1px solid var(--line);padding:14px;border-radius:8px;margin:10px 0;background:#fff}.block-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.block-actions{display:flex;gap:5px}.block-actions button{padding:5px 8px;font-size:12px}.block textarea{min-height:75px}.block select{width:auto}.preview{padding:12px;background:var(--wash);border-radius:7px}.preview .prose{font-size:16px}.upload-row{display:flex;gap:10px;align-items:center;margin-top:8px;flex-wrap:wrap}.upload-row button{padding:7px 11px;font-size:13px}.upload-status{font-size:12px;color:var(--muted)}.upload-status.error{color:#a13b35}.upload-preview{display:block;max-width:100%;max-height:180px;margin-top:10px;border:1px solid var(--line);border-radius:7px}.upload-preview[hidden]{display:none}
@media(max-width:760px){.grid{grid-template-columns:repeat(2,1fr);gap:24px 16px}.cover{height:170px}.editor{grid-template-columns:1fr}.hero{padding:58px 0 44px}.toolbar{align-items:flex-start;flex-direction:column}.table th:nth-child(3),.table td:nth-child(3){display:none}.admin-title{align-items:flex-start;gap:14px;flex-direction:column}}
@media(max-width:480px){.wrap{width:calc(100% - 32px)}.grid{grid-template-columns:1fr}.cover{height:220px}.nav{gap:14px}.article{padding:48px 20px 70px}.article h1{letter-spacing:-1.4px}.prose{font-size:18px}.table th,.table td{padding:11px 9px}.search{width:100%}.search input{flex:1;min-width:0}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;

function layout(title, body, description = "Catatan kecil tentang ide, keseharian, dan hal-hal yang tumbuh.", extra = "") {
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}">${extra}<style>${css}</style></head><body>${body}</body></html>`;
}
const header = `<header class="top wrap"><a class="brand" href="/">nazuaf<span>.</span></a><nav class="nav"><a href="/">Beranda</a><a href="/?tag=catatan">Catatan</a><a href="/admin">Admin</a></nav></header>`;
const footer = `<footer><div class="wrap">Ditulis perlahan, dibaca dengan tenang.</div></footer>`;
const dateText = value => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
function postCard(p) {
  return `<article class="card"><a href="/p/${encodeURIComponent(p.slug)}"><div class="cover">${p.featured_image_url ? `<img src="${escapeHtml(p.featured_image_url)}" alt="" loading="lazy">` : ""}</div><time datetime="${escapeHtml(p.created_at)}">${dateText(p.created_at)}</time><h2>${escapeHtml(p.title)}</h2><p>${escapeHtml(p.excerpt || "")}</p><span class="read">Baca tulisan</span></a></article>`;
}

function articlePage(post, comments = [], commentError = "", values = {}) {
  const title = post.seo_title || post.title, description = post.seo_description || post.excerpt || "";
  const body = `${header}<main class="article"><a class="eyebrow" href="/">← Semua tulisan</a><h1>${escapeHtml(post.title)}</h1><p class="dek">${escapeHtml(post.excerpt || "")}</p><time class="meta" datetime="${escapeHtml(post.created_at)}">${dateText(post.created_at)}</time>${post.featured_image_url ? `<img class="article-cover" src="${escapeHtml(post.featured_image_url)}" alt="">` : ""}<div class="prose">${renderBlocks(blocksOf(post))}</div>${commentsSection(post, comments, commentError, values)}</main>${footer}`;
  const extra = `${post.featured_image_url ? `<meta property="og:image" content="${escapeHtml(post.featured_image_url)}">` : ""}<meta property="og:type" content="article">`;
  return layout(title, body, description, extra);
}

function memoryDB(posts = []) {
  const rows = posts.map(p => ({ ...p }));
  const comments = [];
  return {
    prepare(sql) {
      let args = [];
      const api = {
        bind(...values) { args = values; return api; },
        async all() {
          if (sql.includes("FROM comments")) {
            return { results: comments.filter(c => c.post_id === Number(args[0])).sort((a, b) => a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : a.id - b.id) };
          }
          return { results: sql.includes("WHERE status") ? rows.filter(p => p.status === "published") : [...rows] };
        },
        async first() {
          if (sql.includes("WHERE slug")) return rows.find(p => p.slug === args[0] && (!sql.includes("status =") || p.status === "published")) || null;
          if (sql.includes("WHERE id")) return rows.find(p => p.id === Number(args[0])) || null;
          return null;
        },
        async run() {
          if (sql.startsWith("INSERT") && sql.includes("INTO comments")) {
            const [post_id, name, body, created_at] = args;
            comments.push({ id: comments.length ? Math.max(...comments.map(c => c.id)) + 1 : 1, post_id: Number(post_id), name, body, created_at });
            return { success: true };
          }
          if (sql.startsWith("INSERT")) {
            const [slug, title, content_json, excerpt, status, featured_image_url, seo_title, seo_description, created_at, updated_at] = args;
            const current = rows.find(p => p.id === Number(args[10]));
            if (current) Object.assign(current, { slug, title, content_json, excerpt, status, featured_image_url, seo_title, seo_description, updated_at });
            else rows.push({ id: Math.max(0, ...rows.map(p => p.id)) + 1, slug, title, content_json, excerpt, status, featured_image_url, seo_title, seo_description, created_at, updated_at });
            return { success: true };
          }
          if (sql.startsWith("DELETE")) { const i = rows.findIndex(p => p.id === Number(args[0])); if (i >= 0) rows.splice(i, 1); }
          return { success: true };
        }
      };
      return api;
    }
  };
}

async function readPosts(db, published = false) {
  const sql = published ? "SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC" : "SELECT * FROM posts ORDER BY updated_at DESC";
  const result = await db.prepare(sql).all();
  return result.results || [];
}
function blocksOf(post) { try { return JSON.parse(post.content_json || "[]"); } catch { return []; } }
async function readComments(db, postId) {
  const result = await db.prepare("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC, id ASC").bind(postId).all();
  return result.results || [];
}
function commentsSection(post, comments, error = "", values = { name: "", body: "" }) {
  const slug = encodeURIComponent(post.slug);
  const list = comments.length
    ? `<ol class="comment-list">${comments.map(c => `<li><div class="who"><strong>${escapeHtml(c.name)}</strong><time datetime="${escapeHtml(c.created_at)}">${escapeHtml(dateText(c.created_at))}</time></div><p>${escapeHtml(c.body)}</p></li>`).join("")}</ol>`
    : `<p class="comment-empty">Belum ada komentar. Jadi yang pertama menulis.</p>`;
  const errorBox = error ? `<div class="comment-error" role="alert"><strong>Komentar belum bisa dikirim.</strong><ul><li>${escapeHtml(error)}</li></ul></div>` : "";
  return `<section class="comments" id="komentar"><h2>Komentar</h2>${list}${errorBox}<form class="comment-form" id="comment-form" method="post" action="/p/${slug}/comments"><div class="field"><label for="comment-name">Nama</label><input id="comment-name" name="name" type="text" maxlength="80" value="${escapeHtml(values.name)}" autocomplete="name" required></div><div class="field"><label for="comment-body">Komentar</label><textarea id="comment-body" name="body" maxlength="2000" required>${escapeHtml(values.body)}</textarea></div><button id="comment-submit" name="comment_submit" type="submit">Kirim komentar</button></form></section>`;
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function validSession(request, secret) {
  const token = request.headers.get("Cookie")?.match(/(?:^|;\s*)nazuaf_session=([^;]+)/)?.[1];
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  try {
    const data = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return data.exp > Date.now() && await sign(payload, secret) === signature;
  } catch { return false; }
}
function redirect(path) { return new Response(null, { status: 303, headers: { Location: path } }); }
function html(body, status = 200) { return new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin" } }); }
function json(data, status = 200, headers = {}) { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers } }); }

const R2_PUBLIC_URL = "https://pub-239053dedacb4db192cfd42491f1b7fb.r2.dev";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
function safeImageName(name = "") {
  const base = String(name).split(/[\\/]/).pop() || "";
  const stem = base.replace(/\.[^.]*$/, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return stem || "gambar";
}
function loginPage(error = false) {
  return layout("Masuk · nazuaf", `<main class="login"><a class="brand" href="/">nazuaf<span>.</span></a><h1>Masuk ke ruang tulis</h1><p>Kelola tulisan dan catatanmu.</p><form method="post" action="/admin/login"><label for="password">Kata sandi</label><input id="password" name="password" type="password" autocomplete="current-password" required><button id="login-submit" name="login-submit" type="submit">Masuk</button>${error ? '<p class="error" role="alert">Kata sandi tidak cocok. Coba lagi.</p>' : ""}</form></main>`);
}
function editorPage(post = null) {
  const data = post || { title: "", slug: "", excerpt: "", content_json: "[]", featured_image_url: "", seo_title: "", seo_description: "", status: "draft" };
  const safe = JSON.stringify(blocksOf(data)).replace(/</g, "\\u003c");
  return layout(`${post ? "Edit tulisan" : "Tulisan baru"} · Admin`, `<div class="admin-shell"><header class="admin-header"><div class="wrap"><a class="brand" href="/admin">nazuaf<span>.</span></a></div></header><main class="wrap admin-main"><div class="admin-title"><h1>${post ? "Edit tulisan" : "Tulisan baru"}</h1><a class="button secondary" href="/admin">Kembali</a></div><form id="post-form" method="post" action="/admin/posts/save"><input type="hidden" id="post-id" name="id" value="${post?.id || ""}"><input type="hidden" name="content_json" id="content-json"><div class="editor"><section><div class="panel"><input class="title-input" id="title" name="title" placeholder="Judul tulisan" value="${escapeHtml(data.title)}" required><div class="field"><label for="slug">Slug</label><input id="slug" name="slug" value="${escapeHtml(data.slug)}" required></div><div class="field"><label for="excerpt">Ringkasan</label><textarea id="excerpt" name="excerpt">${escapeHtml(data.excerpt)}</textarea></div></div><div class="panel"><div class="block-head"><strong>Isi tulisan</strong><div><select id="new-block-type" name="new_block_type" aria-label="Jenis blok baru">${["paragraph", "heading", "image", "quote", "list", "code", "divider"].map(t => `<option value="${t}">${t}</option>`).join("")}</select> <button type="button" class="secondary" id="add-block" name="add_block">Tambah blok</button></div></div><div id="blocks"></div></div><div class="panel"><strong>Pratinjau</strong><div class="preview"><div class="prose" id="preview"></div></div></div></section><aside><div class="panel"><div class="field"><label for="featured_image_url">URL gambar utama</label><input id="featured_image_url" name="featured_image_url" type="url" value="${escapeHtml(data.featured_image_url || "")}"><div class="upload-row"><button type="button" class="secondary" id="featured-image-upload" name="featured_image_upload">Upload gambar</button><input id="featured-image-file" name="featured_image_file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden><span class="upload-status" id="featured-image-status" role="status"></span></div><img class="upload-preview" id="featured-image-preview" alt="Pratinjau gambar utama" ${data.featured_image_url ? `src="${escapeHtml(data.featured_image_url)}"` : "hidden"}></div><div class="field"><label for="seo_title">Judul SEO</label><input id="seo_title" name="seo_title" value="${escapeHtml(data.seo_title || "")}"></div><div class="field"><label for="seo_description">Deskripsi SEO</label><textarea id="seo_description" name="seo_description">${escapeHtml(data.seo_description || "")}</textarea></div><div class="field"><label for="status">Status</label><select id="status" name="status"><option value="draft" ${data.status === "draft" ? "selected" : ""}>Simpan sebagai draft</option><option value="published" ${data.status === "published" ? "selected" : ""}>Terbitkan</option></select></div><button id="post-submit" name="post_submit" type="submit" style="width:100%">Simpan tulisan</button></div></aside></div></form></main></div><script>const initial=${safe};</script><script src="/admin/editor.js"></script>`);
}
function editorScript() {
  return `(()=>{const $=s=>document.querySelector(s), list=$('#blocks'),types=['paragraph','heading','image','quote','list','code','divider'];let blocks=initial.length?initial:[{type:'paragraph',text:''}];const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));function draw(){list.innerHTML=blocks.map((b,i)=>'<div class="block" data-i="'+i+'"><div class="block-head"><select class="kind" id="block-'+i+'-kind" name="block-'+i+'-kind">'+types.map(t=>'<option '+(b.type===t?'selected':'')+' value="'+t+'">'+t+'</option>').join('')+'</select><div class="block-actions">'+['up','down','copy','delete'].map(act=>'<button type="button" id="block-'+i+'-'+act+'" name="block-'+i+'-'+act+'" data-do="'+act+'">'+({up:'↑',down:'↓',copy:'Duplikat',delete:'Hapus'}[act])+'</button>').join('')+'</div></div>'+ (b.type==='divider'?'Garis pemisah':b.type==='image'?'<input class="url" id="block-'+i+'-image-url" name="block-'+i+'-image-url" placeholder="URL gambar" value="'+esc(b.url)+'"><input class="alt" id="block-'+i+'-image-alt" name="block-'+i+'-image-alt" placeholder="Teks alternatif" value="'+esc(b.alt)+'"><div class="upload-row"><button type="button" class="secondary" id="block-'+i+'-image-upload" name="block-'+i+'-image-upload" data-upload="'+i+'">Upload gambar</button><input type="file" id="block-'+i+'-image-file" name="block-'+i+'-image-file" accept="image/jpeg,image/png,image/webp,image/gif" data-file="'+i+'" hidden><span class="upload-status" id="block-'+i+'-image-status" role="status"></span></div><img class="upload-preview" id="block-'+i+'-image-preview" alt="Pratinjau gambar" '+(b.url?'src="'+esc(b.url)+'"':'hidden')+'>':b.type==='list'?'<textarea class="items" id="block-'+i+'-items" name="block-'+i+'-items" placeholder="Satu butir per baris">'+esc((b.items||[]).join('\\n'))+'</textarea>':'<div class="format"><button type="button" id="block-'+i+'-bold" name="block-'+i+'-bold" data-format="bold"><b>Tebal</b></button> <button type="button" id="block-'+i+'-italic" name="block-'+i+'-italic" data-format="italic"><i>Miring</i></button></div><textarea class="text" id="block-'+i+'-text" name="block-'+i+'-text" placeholder="'+(b.type==='heading'?'Judul bagian':'Tulis isi blok')+'">'+esc(b.text)+'</textarea>')+'</div>').join('');update()}function update(){blocks=[...list.children].map((el,i)=>{const b=blocks[i],type=el.querySelector('.kind').value;if(type==='image')return {type,url:el.querySelector('.url').value,alt:el.querySelector('.alt').value};if(type==='list')return {type,items:el.querySelector('.items').value.split('\\n').filter(Boolean)};return {type,text:el.querySelector('.text')?.value||'',level:2}});$('#content-json').value=JSON.stringify(blocks);$('#preview').innerHTML=blocks.map(b=>b.type==='divider'?'<hr>':b.type==='heading'?'<h2>'+esc(b.text)+'</h2>':b.type==='quote'?'<blockquote>'+esc(b.text)+'</blockquote>':b.type==='image'&&b.url?'<figure><img src="'+esc(b.url)+'" alt="'+esc(b.alt)+'"></figure>':b.type==='list'?'<ul>'+b.items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':b.type==='code'?'<pre><code>'+esc(b.text)+'</code></pre>':'<p>'+esc(b.text)+'</p>').join('')}$('#title').addEventListener('input',()=>{if(!$('#slug').dataset.edited)$('#slug').value=$('#title').value.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')});$('#slug').addEventListener('input',e=>e.target.dataset.edited='1');list.addEventListener('input',update);list.addEventListener('change',e=>{if(e.target.matches('.kind'))draw()});list.addEventListener('click',e=>{const act=e.target.dataset.do;if(act){const el=e.target.closest('.block'),i=+el.dataset.i;if(act==='delete')blocks.splice(i,1);if(act==='copy')blocks.splice(i+1,0,{...blocks[i],items:blocks[i].items&&[...blocks[i].items]});if(act==='up'&&i>0)[blocks[i-1],blocks[i]]=[blocks[i],blocks[i-1]];if(act==='down'&&i<blocks.length-1)[blocks[i+1],blocks[i]]=[blocks[i],blocks[i+1]];draw()}const fmt=e.target.dataset.format;if(fmt){const area=e.target.closest('.block').querySelector('.text'),start=area.selectionStart,end=area.selectionEnd,mark=fmt==='bold'?'**':'*';area.setRangeText(mark+area.value.slice(start,end)+mark,start,end,'select');area.dispatchEvent(new Event('input',{bubbles:true}))}});$('#add-block').addEventListener('click',()=>{blocks.push({type:$('#new-block-type').value,text:''});draw()});$('#post-form').addEventListener('submit',update);const MAX=10*1024*1024;function say(el,msg,isError){if(!el)return;el.textContent=msg;el.className='upload-status'+(isError?' error':'')}async function uploadImage(file,statusEl){if(!file)return null;if(file.size>MAX){say(statusEl,'Gambar melebihi batas 10 MB.',true);return null}say(statusEl,'Mengunggah...');const fd=new FormData();fd.append('image',file);try{const res=await fetch('/admin/upload',{method:'POST',body:fd,credentials:'same-origin'});const data=await res.json().catch(()=>({error:'Server tidak membalas JSON.'}));if(!res.ok||!data.url){say(statusEl,data.error||'Upload gagal.',true);return null}say(statusEl,'Selesai.');return data.url}catch(err){say(statusEl,'Upload gagal: '+err.message,true);return null}}const fBtn=$('#featured-image-upload'),fFile=$('#featured-image-file'),fUrl=$('#featured_image_url'),fPrev=$('#featured-image-preview'),fStat=$('#featured-image-status');fBtn.addEventListener('click',()=>fFile.click());fFile.addEventListener('change',async()=>{const url=await uploadImage(fFile.files[0],fStat);fFile.value='';if(url){fUrl.value=url;fPrev.src=url;fPrev.hidden=false}});list.addEventListener('click',e=>{const i=e.target.dataset.upload;if(i!==undefined){const f=$('#block-'+i+'-image-file');if(f)f.click()}});list.addEventListener('change',async e=>{const i=e.target.dataset.file;if(i===undefined)return;const el=e.target,url=await uploadImage(el.files[0],$('#block-'+i+'-image-status'));el.value='';if(url){const input=$('#block-'+i+'-image-url');if(input)input.value=url;const prev=$('#block-'+i+'-image-preview');if(prev){prev.src=url;prev.hidden=false}update()}});draw()})();`;
}

export function createApp(env = {}) {
  const db = env.DB || memoryDB(seedPosts);
  const password = env.ADMIN_PASSWORD || "nazuaf-dev-2026";
  const secret = env.SESSION_SECRET || "local-session-secret-change-for-deployment";
  let initialized;
  async function initialize() {
    if (!env.DB) return;
    if (!initialized) initialized = (async () => {
      const count = await db.prepare("SELECT COUNT(*) AS count FROM posts").first();
      if (Number(count?.count || 0) !== 0) return;
      for (const p of seedPosts) {
        await db.prepare("INSERT INTO posts (slug,title,content_json,excerpt,status,featured_image_url,seo_title,seo_description,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)")
          .bind(p.slug, p.title, p.content_json, p.excerpt, p.status, p.featured_image_url, p.seo_title, p.seo_description, p.created_at, p.updated_at).run();
      }
    })();
    await initialized;
  }
  return { async fetch(request) {
    await initialize();
    const url = new URL(request.url), path = decodeURIComponent(url.pathname);
    if (path === "/favicon.ico") return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#247653"/><text x="11" y="47" font-family="Arial,sans-serif" font-size="46" font-weight="700" fill="#fff">n.</text></svg>', { headers: { "Content-Type": "image/svg+xml; charset=utf-8" } });
    if (path === "/admin/editor.js") return new Response(editorScript(), { headers: { "Content-Type": "application/javascript; charset=utf-8" } });
    if (path === "/admin/login" && request.method === "POST") {
      const form = await request.formData();
      if (form.get("password") !== password) return html(loginPage(true), 401);
      const payload = btoa(JSON.stringify({ exp: Date.now() + 7 * 86400000 })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      const signature = await sign(payload, secret);
      const secure = url.protocol === "https:" ? " Secure;" : "";
      return new Response(null, { status: 303, headers: { Location: "/admin", "Set-Cookie": `nazuaf_session=${payload}.${signature}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800;${secure}` } });
    }
    if (path === "/admin/logout") return new Response(null, { status: 303, headers: { Location: "/admin", "Set-Cookie": "nazuaf_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0" } });
    if (path === "/admin/upload" && request.method === "POST") {
      if (!(await validSession(request, secret))) return json({ error: "Sesi admin tidak ditemukan. Silakan masuk lebih dulu." }, 401, { Location: "/admin/login" });
      let form;
      try { form = await request.formData(); } catch { return json({ error: "Permintaan harus multipart/form-data dengan satu berkas gambar." }, 400); }
      const file = form.get("image");
      if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") return json({ error: "Berkas gambar wajib dikirim pada field \"image\"." }, 400);
      const extension = IMAGE_TYPES[file.type];
      if (!extension) return json({ error: "Tipe gambar tidak didukung. Gunakan JPEG, PNG, WEBP, atau GIF." }, 400);
      if (file.size > MAX_IMAGE_BYTES) return json({ error: "Ukuran gambar melebihi batas 10 MB." }, 400);
      if (!env.IMAGES) return json({ error: "Penyimpanan R2 tidak tersedia di dev lokal. Set pengaturan binding IMAGES untuk mengunggah gambar." }, 503);
      const now = new Date();
      const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
      const key = `images/${month}/${crypto.randomUUID()}-${safeImageName(file.name)}.${extension}`;
      try {
        await env.IMAGES.put(key, file, { httpMetadata: { contentType: file.type } });
      } catch {
        return json({ error: "Gambar gagal disimpan ke R2. Coba lagi." }, 502);
      }
      return json({ url: `${R2_PUBLIC_URL}/${key}`, key });
    }
    if (path.startsWith("/admin")) {
      if (!(await validSession(request, secret))) return html(loginPage());
      if (path === "/admin" || path === "/admin/") {
        const posts = await readPosts(db);
        const rows = posts.map(p => `<tr><td><strong>${escapeHtml(p.title)}</strong><br><span class="meta">/p/${escapeHtml(p.slug)}</span></td><td><span class="pill ${p.status}">${p.status === "published" ? "Terbit" : "Draft"}</span></td><td>${dateText(p.updated_at)}</td><td><div class="actions"><a class="button secondary" href="/admin/posts/${p.id}">Edit</a><form method="post" action="/admin/posts/delete"><input type="hidden" id="delete-post-${p.id}" name="id" value="${p.id}"><button id="delete-submit-${p.id}" name="delete_submit_${p.id}" type="submit" class="secondary">Hapus</button></form></div></td></tr>`).join("");
        return html(layout("Dashboard · Admin", `<div class="admin-shell">${header}<main class="wrap admin-main"><div class="admin-title"><h1>Tulisan</h1><a class="button" href="/admin/posts/new">Tulis baru</a></div><table class="table"><thead><tr><th>Judul</th><th>Status</th><th>Diperbarui</th><th>Aksi</th></tr></thead><tbody>${rows || '<tr><td colspan="4">Belum ada tulisan.</td></tr>'}</tbody></table><p><a href="/admin/logout">Keluar</a></p></main></div>`));
      }
      if (path === "/admin/posts/new") return html(editorPage());
      if (path.startsWith("/admin/posts/") && request.method === "GET") {
        const post = await db.prepare("SELECT * FROM posts WHERE id = ?").bind(path.split("/").pop()).first();
        return post ? html(editorPage(post)) : html(layout("Tidak ditemukan", `${header}<main class="article"><h1>Tulisan tidak ditemukan</h1></main>${footer}`), 404);
      }
      if (path === "/admin/posts/save" && request.method === "POST") {
        const form = await request.formData(), now = new Date().toISOString(), id = Number(form.get("id")) || null;
        const title = String(form.get("title") || "").trim(), slug = slugify(form.get("slug") || title);
        if (!title || !slug) return html(layout("Data tidak valid", `${header}<main class="article"><h1>Judul dan slug wajib diisi.</h1></main>`), 400);
        const values = [slug, title, String(form.get("content_json") || "[]"), String(form.get("excerpt") || ""), form.get("status") === "published" ? "published" : "draft", String(form.get("featured_image_url") || ""), String(form.get("seo_title") || ""), String(form.get("seo_description") || ""), now, now, id];
        if (id) await db.prepare("UPDATE posts SET slug=?,title=?,content_json=?,excerpt=?,status=?,featured_image_url=?,seo_title=?,seo_description=?,updated_at=? WHERE id=?").bind(...values.slice(0, 9), id).run();
        else await db.prepare("INSERT INTO posts (slug,title,content_json,excerpt,status,featured_image_url,seo_title,seo_description,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(...values.slice(0, 10)).run();
        return redirect("/admin");
      }
      if (path === "/admin/posts/delete" && request.method === "POST") {
        const form = await request.formData();
        await db.prepare("DELETE FROM posts WHERE id = ?").bind(form.get("id")).run();
        return redirect("/admin");
      }
      return html(layout("Tidak ditemukan", `${header}<main class="article"><h1>Halaman tidak ditemukan</h1></main>`), 404);
    }
    if (path === "/" || path === "") {
      const posts = await readPosts(db, true);
      const q = (url.searchParams.get("q") || "").trim().toLocaleLowerCase("id");
      const tag = url.searchParams.get("tag");
      const filtered = posts.filter(p => !q || `${p.title} ${p.excerpt}`.toLocaleLowerCase("id").includes(q))
        .filter(p => !tag || tag === "catatan");
      const body = `${header}<main class="wrap"><section class="hero"><span class="eyebrow">Sebuah ruang untuk jeda</span><h1>Catatan yang tumbuh<br>pelan-pelan.</h1><p>Gagasan kecil, cerita sehari-hari, dan hal-hal yang layak diperhatikan lebih lama.</p></section><div class="toolbar"><span class="meta">${q ? `Hasil pencarian untuk “${escapeHtml(q)}”` : `${filtered.length} tulisan untuk dibaca`}</span><form class="search" method="get"><input id="search-query" name="q" aria-label="Cari tulisan" placeholder="Cari tulisan..." value="${escapeHtml(q)}"><button id="search-submit" name="search_submit" type="submit">Cari</button></form></div><section class="grid">${filtered.map(postCard).join("") || '<p class="empty">Belum ada tulisan yang cocok. Coba kata kunci lain.</p>'}</section></main>${footer}`;
      return html(layout("nazuaf — Catatan yang tumbuh pelan-pelan", body));
    }
    if (path.startsWith("/p/")) {
      const parts = path.slice(3).split("/").filter((part, i, all) => part !== "" || i < all.length - 1);
      const slug = parts[0];
      const isCommentSubmit = parts[1] === "comments";
      if (parts.length > 2 || (parts.length > 1 && !isCommentSubmit)) return html(layout("Halaman tidak ditemukan · nazuaf", `${header}<main class="article"><span class="eyebrow">404</span><h1>Halaman ini tidak ditemukan.</h1><a class="read" href="/">Kembali ke beranda</a></main>${footer}`), 404);
      const post = await db.prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published'").bind(slug).first();
      if (!post) return html(layout("Halaman tidak ditemukan · nazuaf", `${header}<main class="article"><span class="eyebrow">404</span><h1>Tulisan ini belum ada.</h1><p class="dek">Mungkin alamatnya berubah, atau tulisan ini masih disimpan sebagai draft.</p><a class="read" href="/">Kembali ke beranda</a></main>${footer}`), 404);
      if (isCommentSubmit && request.method === "POST") {
        const form = await request.formData();
        const name = String(form.get("name") || "").trim(), body = String(form.get("body") || "").trim();
        const errors = [];
        if (!name) errors.push("Nama wajib diisi.");
        else if (name.length > 80) errors.push("Nama maksimal 80 karakter.");
        if (!body) errors.push("Isi komentar wajib diisi.");
        else if (body.length > 2000) errors.push("Isi komentar maksimal 2000 karakter.");
        if (!errors.length) {
          await db.prepare("INSERT INTO comments (post_id, name, body, created_at) VALUES (?,?,?,?)")
            .bind(post.id, name, body, new Date().toISOString()).run();
          return redirect(`/p/${encodeURIComponent(post.slug)}`);
        }
        return html(articlePage(post, await readComments(db, post.id), errors.join(" "), { name, body }), 400);
      }
      if (isCommentSubmit) return redirect(`/p/${encodeURIComponent(post.slug)}`);
      return html(articlePage(post, await readComments(db, post.id)));
    }
    return html(layout("Halaman tidak ditemukan · nazuaf", `${header}<main class="article"><span class="eyebrow">404</span><h1>Halaman ini tidak ditemukan.</h1><p class="dek">Coba kembali ke beranda untuk menemukan tulisan lainnya.</p><a class="read" href="/">Kembali ke beranda</a></main>${footer}`), 404);
  } };
}

export default { fetch(request, env) { return createApp(env).fetch(request); } };
