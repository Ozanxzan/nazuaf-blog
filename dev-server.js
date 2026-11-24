import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createApp } from "./src/app.js";

function loadVars() {
  const path = resolve(".dev.vars");
  if (!existsSync(path)) return {};
  return Object.fromEntries(readFileSync(path, "utf8").split(/\r?\n/)
    .map(line => line.trim()).filter(line => line && !line.startsWith("#"))
    .map(line => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^(['"])(.*)\1$/, "$2")];
    }).filter(([key]) => key));
}

class SQLiteD1 {
  constructor(path) {
    mkdirSync(dirname(path), { recursive: true });
    this.sqlite = new DatabaseSync(path);
    this.sqlite.exec(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
  }
  prepare(sql) {
    const db = this.sqlite;
    let values = [];
    const api = {
      bind(...args) { values = args; return api; },
      async all() { return { results: db.prepare(sql).all(...values) }; },
      async first() { return db.prepare(sql).get(...values) || null; },
      async run() { return { success: true, meta: db.prepare(sql).run(...values) }; }
    };
    return api;
  }
}

const env = { ...loadVars(), DB: new SQLiteD1(resolve(".data/blog.sqlite")) };
env.ADMIN_PASSWORD ||= "nazuaf-dev-2026";
env.SESSION_SECRET ||= "local-session-secret-change-for-deployment";
const app = createApp(env);
const port = Number(process.env.PORT || 8787);
createServer(async (req, res) => {
  try {
    const body = [];
    for await (const chunk of req) body.push(chunk);
    const request = new Request(`http://${req.headers.host || `localhost:${port}`}${req.url}`, {
      method: req.method,
      headers: req.headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(body)
    });
    const response = await app.fetch(request);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Terjadi kesalahan pada server.");
  }
}).listen(port, "0.0.0.0", () => console.log(`nazuaf-blog berjalan di http://localhost:${port}`));
