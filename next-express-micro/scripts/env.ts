// scripts/env.ts
// pnpm env:setup               create missing .env files from .env.example + generate secrets
// pnpm env:check               validate every .env  (add --example to validate the .env.example files)
import { randomBytes } from "node:crypto";
import {
  appendFileSync,
  copyFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";

type EnvMap = NodeJS.Dict<string>;
type Target = { name: string; dir: string };

const ROOT = path.resolve(import.meta.dirname, "..");
const APPS = path.join(ROOT, "apps");
const PLACEHOLDER = /^change-?me$/i;
const SECRET_KEYS = ["INTERNAL_SECRET", "BETTER_AUTH_SECRET", "POSTGRES_PASSWORD"];
const SHARED_SECRET = "INTERNAL_SECRET";

const readEnv = (file: string): EnvMap => parseEnv(readFileSync(file, "utf8"));
const isService = (name: string) => name === "gateway" || name.endsWith("-service");
const randomSecret = () => randomBytes(32).toString("hex");

function discoverTargets(): Target[] {
  const targets: Target[] = [];
  if (existsSync(path.join(ROOT, ".env.example"))) targets.push({ name: "root", dir: ROOT });
  for (const entry of readdirSync(APPS, { withFileTypes: true })) {
    const dir = path.join(APPS, entry.name);
    if (entry.isDirectory() && existsSync(path.join(dir, ".env.example"))) {
      targets.push({ name: entry.name, dir });
    }
  }
  return targets;
}

function setup(): void {
  const targets = discoverTargets();

  for (const { name, dir } of targets) {
    const envFile = path.join(dir, ".env");
    if (!existsSync(envFile)) {
      copyFileSync(path.join(dir, ".env.example"), envFile);
      console.log(`created ${name}/.env`);
      continue;
    }
    // sync: أضف أي مفتاح موجود في .env.example وناقص في .env (القيم الموجودة ما بتتلمسش)
    const example = readEnv(path.join(dir, ".env.example"));
    const current = readEnv(envFile);
    const missing = Object.keys(example).filter((key) => !(key in current));
    if (missing.length === 0) continue;
    const text = readFileSync(envFile, "utf8");
    const eol = text.includes("\r\n") ? "\r\n" : "\n";
    const quote = (value: string) => (/[\s#]/.test(value) ? JSON.stringify(value) : value);
    const lines = missing.map((key) => `${key}=${quote(example[key] ?? "")}`).join(eol);
    const prefix = text === "" || text.endsWith("\n") ? "" : eol;
    appendFileSync(
      envFile,
      `${prefix}${eol}# added by pnpm env:setup (from .env.example)${eol}${lines}${eol}`,
    );
    console.log(`added to ${name}/.env: ${missing.join(", ")}`);
  }

  // INTERNAL_SECRET واحد لكل الـ apps: أعد استخدام أي قيمة حقيقية موجودة، وإلا ولّد واحدة
  let shared: string | undefined;
  for (const { dir } of targets) {
    const value = readEnv(path.join(dir, ".env"))[SHARED_SECRET];
    if (value && !PLACEHOLDER.test(value) && value.length >= 16) {
      shared = value;
      break;
    }
  }
  shared ??= randomSecret();

  for (const { name, dir } of targets) {
    const envFile = path.join(dir, ".env");
    let text = readFileSync(envFile, "utf8");
    const values = parseEnv(text);
    let changed = false;
    for (const key of SECRET_KEYS) {
      const current = values[key];
      if (current === undefined || !PLACEHOLDER.test(current)) continue;
      const next = key === SHARED_SECRET ? shared : randomSecret();
      text = text.replace(new RegExp(`^${key}=.*$`, "m"), `${key}=${next}`);
      changed = true;
      console.log(`generated ${key} in ${name}/.env`);
    }
    if (changed) writeFileSync(envFile, text);
  }
}

function check(mode: "env" | "example"): void {
  const fileName = mode === "env" ? ".env" : ".env.example";
  const errors: string[] = [];
  const warnings: string[] = [];
  const data = new Map<string, EnvMap>();
  const get = (name: string, key: string): string | undefined => data.get(name)?.[key];

  for (const entry of readdirSync(APPS, { withFileTypes: true })) {
    if (entry.isDirectory() && !existsSync(path.join(APPS, entry.name, ".env.example"))) {
      errors.push(`apps/${entry.name}: missing .env.example`);
    }
  }

  for (const entry of readdirSync(APPS, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const envTs = path.join(APPS, entry.name, "src", "env.ts");
    if (existsSync(envTs) && !readFileSync(envTs, "utf8").includes("dotenv/config")) {
      errors.push(`apps/${entry.name}/src/env.ts must import "dotenv/config" first`);
    }
  }

  for (const { name, dir } of discoverTargets()) {
    const file = path.join(dir, fileName);
    if (!existsSync(file)) {
      errors.push(`${name}: ${fileName} not found (run: pnpm env:setup)`);
      continue;
    }
    const values = readEnv(file);
    data.set(name, values);

    if (mode === "env") {
      const example = readEnv(path.join(dir, ".env.example"));
      for (const key of Object.keys(example)) {
        if (!(key in values)) errors.push(`${name}: missing ${key} (it is listed in .env.example)`);
      }
      for (const key of Object.keys(values)) {
        if (!(key in example)) warnings.push(`${name}: ${key} is not documented in .env.example`);
      }
    }
    for (const [key, value] of Object.entries(values)) {
      if (!value) errors.push(`${name}: ${key} is empty`);
      else if (mode === "env" && PLACEHOLDER.test(value)) {
        errors.push(
          `${name}: ${key} still has a placeholder (run: pnpm env:setup, or set it by hand)`,
        );
      }
    }
  }

  const names = [...data.keys()];
  const services = names.filter(isService);

  // 1) INTERNAL_SECRET متطابق في الـ gateway وكل الـ services
  const secrets = new Set(services.map((n) => get(n, SHARED_SECRET)).filter(Boolean));
  if (secrets.size > 1)
    errors.push(`${SHARED_SECRET} must be identical in: ${services.join(", ")}`);
  if (mode === "env") {
    for (const n of services) {
      const secret = get(n, SHARED_SECRET);
      if (secret && secret.length < 16)
        errors.push(`${n}: ${SHARED_SECRET} is shorter than 16 chars`);
    }
    const authSecret = get("auth-service", "BETTER_AUTH_SECRET");
    if (authSecret && authSecret.length < 32)
      errors.push("auth-service: BETTER_AUTH_SECRET is shorter than 32 chars");
  }

  // 2) إعدادات الـ JWT متطابقة بين الـ gateway والـ auth-service
  for (const key of ["JWT_ISSUER", "JWT_AUDIENCE"]) {
    const a = get("gateway", key);
    const b = get("auth-service", key);
    if (a !== undefined && b !== undefined && a !== b) {
      errors.push(`${key} differs: gateway="${a}" vs auth-service="${b}"`);
    }
  }

  // 3) مفيش بورتين متكررين
  const ports = new Map<string, string>();
  for (const n of names) {
    const port = get(n, "PORT");
    if (!port) continue;
    const owner = ports.get(port);
    if (owner) errors.push(`PORT ${port} is used by both ${owner} and ${n}`);
    else ports.set(port, n);
  }

  // 4) كل <NAME>_SERVICE_URL في الـ gateway بيشاور على service موجودة وعلى البورت الصح
  for (const [key, value] of Object.entries(data.get("gateway") ?? {})) {
    const match = /^([A-Z0-9_]+)_SERVICE_URL$/.exec(key);
    if (!match?.[1] || !value) continue;
    const serviceName = `${match[1].toLowerCase().replaceAll("_", "-")}-service`;
    if (!data.has(serviceName)) {
      errors.push(`gateway: ${key} points to apps/${serviceName}, which has no ${fileName}`);
      continue;
    }
    try {
      const url = new URL(value);
      const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
      if (local && url.port !== get(serviceName, "PORT")) {
        errors.push(
          `gateway: ${key} uses port ${url.port} but ${serviceName} PORT is ${get(serviceName, "PORT")}`,
        );
      }
    } catch {
      errors.push(`gateway: ${key} is not a valid URL`);
    }
  }

  // 5) كل service ليها database باسمها، وقاعدة الـ tests مختلفة
  const dbName = (url: string | undefined): string | undefined => {
    try {
      return url ? new URL(url).pathname.slice(1) : undefined;
    } catch {
      return undefined;
    }
  };
  for (const n of services.filter((s) => s !== "gateway")) {
    const expected = n.replaceAll("-", "_");
    const main = dbName(get(n, "DATABASE_URL"));
    const test = dbName(get(n, "TEST_DATABASE_URL"));
    if (main && main !== expected)
      errors.push(`${n}: DATABASE_URL uses database "${main}", expected "${expected}"`);
    if (test && test === main)
      errors.push(`${n}: TEST_DATABASE_URL must not be the same database as DATABASE_URL`);
  }

  // 6) better-auth: origin العام لازم يكون ضمن TRUSTED_ORIGINS
  const baseUrl = get("auth-service", "BETTER_AUTH_URL");
  const trusted = get("auth-service", "TRUSTED_ORIGINS");
  if (baseUrl && trusted) {
    try {
      const origin = new URL(baseUrl).origin;
      if (
        !trusted
          .split(",")
          .map((o) => o.trim())
          .includes(origin)
      ) {
        errors.push(`auth-service: TRUSTED_ORIGINS must include ${origin} (BETTER_AUTH_URL)`);
      }
    } catch {
      errors.push("auth-service: BETTER_AUTH_URL is not a valid URL");
    }
  }

  for (const warning of warnings) console.warn(`⚠ ${warning}`);
  if (errors.length > 0) {
    for (const error of errors) console.error(`✖ ${error}`);
    console.error(`\n${errors.length} env problem(s). Fix them and re-run: pnpm env:check`);
    process.exit(1);
  }
  console.log(`✔ env OK (${data.size} ${fileName} files checked)`);
}

const [command, ...flags] = process.argv.slice(2);
if (command === "setup") setup();
else if (command === "check") check(flags.includes("--example") ? "example" : "env");
else {
  console.error("Usage: tsx scripts/env.ts <setup | check [--example]>");
  process.exit(1);
}
