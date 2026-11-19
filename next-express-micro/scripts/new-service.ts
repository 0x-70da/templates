// scripts/new-service.ts
import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const ROOT = path.resolve(import.meta.dirname, "..");
const TEMPLATE_SERVICE = "test-service"; // الـ service المرجعية اللي بيتنسخ منها
const RESERVED = new Set(["gateway", "client", "auth", "test"]);
const ACCESS_LEVELS = ["required", "optional", "public", "admin"] as const;

const REGISTRY_FILE = "apps/gateway/src/services.registry.ts";
const COMPOSE_FILE = "docker-compose.yaml";
const INIT_SQL_FILE = "docker/postgres-init.sql";
const MARKERS = {
  registry: "// <generator:services>",
  composeServices: "# <generator:services>",
  composeGatewayEnv: "# <generator:gateway-env>",
  sql: "-- <generator:databases>",
};

// ما بيتنسخش من test-service (كود الـ domain المثال + حاجات خاصة بيه)
const SKIP_ANYWHERE = new Set(["node_modules", "dist", ".turbo", "coverage"]);
const SKIP_PATHS = [
  ".env",
  "tsconfig.tsbuildinfo",
  "src/db/migrations",
  "src/db/db.int.test.ts",
  "src/db/auth-schema.ts",
  "src/controllers/test",
  "src/services/test",
  "src/queries/test",
  "src/tests/test",
  "src/subscribers",
  "src/routes/test.routes.ts",
  "src/types/test.types.ts",
  "src/types/auth.types.ts",
  "src/app.int.test.ts",
];

const abs = (relative: string) => path.join(ROOT, relative);
const readText = (relative: string) => readFileSync(abs(relative), "utf8");

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

// ───────────────────────── args ─────────────────────────
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    port: { type: "string" },
    access: { type: "string", default: "required" },
    "dry-run": { type: "boolean", default: false },
    "skip-install": { type: "boolean", default: false },
  },
});

const rawName = positionals[0];
if (!rawName) {
  fail(
    "Usage: pnpm gen:service <name> [--port 4005] [--access required|optional|public|admin] [--dry-run] [--skip-install]",
  );
}

const kebab = rawName.toLowerCase().replace(/-service$/, "");
if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(kebab))
  fail(`Invalid name "${rawName}" (use kebab-case, e.g. orders)`);
if (RESERVED.has(kebab)) fail(`"${kebab}" is reserved`);

const snake = kebab.replaceAll("-", "_");
const constant = snake.toUpperCase();
const serviceDir = `${kebab}-service`;
const targetRelative = `apps/${serviceDir}`;
const templateRelative = `apps/${TEMPLATE_SERVICE}`;

if (!existsSync(abs(templateRelative))) fail(`${templateRelative} not found`);
if (existsSync(abs(targetRelative))) fail(`${targetRelative} already exists`);

const access =
  ACCESS_LEVELS.find((level) => level === values.access) ??
  fail(`--access must be one of: ${ACCESS_LEVELS.join(", ")}`);

// ───────────────────────── ports ─────────────────────────
function readPort(file: string): number | undefined {
  if (!existsSync(file)) return undefined;
  const match = /^PORT=(\d+)/m.exec(readFileSync(file, "utf8"));
  return match?.[1] ? Number(match[1]) : undefined;
}

const usedPorts = new Set<number>([3000, 4000]);
for (const entry of readdirSync(abs("apps"), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  for (const file of [".env.example", ".env"]) {
    const used = readPort(path.join(abs("apps"), entry.name, file));
    if (used) usedPorts.add(used);
  }
}

function nextFreePort(): number {
  let candidate = 4001;
  while (usedPorts.has(candidate)) candidate++;
  return candidate;
}

const port = values.port ? Number(values.port) : nextFreePort();
if (!Number.isInteger(port) || port < 1024 || port > 65535) fail(`Invalid port "${values.port}"`);
if (usedPorts.has(port)) fail(`Port ${port} is already used by another app`);

const templatePort = readPort(path.join(abs(templateRelative), ".env.example")) ?? 4002;

// ───────────────────────── edits (محسوبة في الذاكرة الأول) ─────────────────────────
function insertBeforeMarker(content: string, marker: string, block: string, file: string): string {
  const markerIndex = content.indexOf(marker);
  if (markerIndex === -1) return fail(`Marker "${marker}" not found in ${file}`);
  const eol = content.includes("\r\n") ? "\r\n" : "\n";
  const lineStart = content.lastIndexOf("\n", markerIndex) + 1;
  const indent = content.slice(lineStart, markerIndex);
  if (!/^\s*$/.test(indent)) return fail(`Marker "${marker}" must be alone on its line in ${file}`);
  const inserted = block
    .split("\n")
    .map((line) => (line ? indent + line : line))
    .join(eol);
  return `${content.slice(0, lineStart)}${inserted}${eol}${content.slice(lineStart)}`;
}

const registry = readText(REGISTRY_FILE);
if (registry.includes(`"${constant}_SERVICE_URL"`))
  fail(`${constant}_SERVICE_URL already exists in ${REGISTRY_FILE}`);
const newRegistry = insertBeforeMarker(
  registry,
  MARKERS.registry,
  `{ name: "${kebab}", prefix: "/api/${kebab}", urlEnv: "${constant}_SERVICE_URL", access: "${access}" },`,
  REGISTRY_FILE,
);

const composeBlock = [
  `${serviceDir}:`,
  "  build:",
  "    context: .",
  `    dockerfile: apps/${serviceDir}/Dockerfile`,
  "  restart: unless-stopped",
  `  env_file: ./apps/${serviceDir}/.env`,
  "  environment:",
  "    NODE_ENV: production",
  `    DATABASE_URL: postgres://\${POSTGRES_USER:-postgres}:\${POSTGRES_PASSWORD:-postgres}@db:5432/${snake}_service`,
  "  depends_on:",
  "    db: { condition: service_healthy }",
  `  expose: ["${port}"]`,
  "  healthcheck:",
  `    test: ["CMD", "wget", "--spider", "-q", "http://127.0.0.1:${port}/health"]`,
  "    interval: 5s",
  "    retries: 10",
  "  networks: [private]",
  "",
].join("\n");

const compose = readText(COMPOSE_FILE);
if (new RegExp(`^\\s*${serviceDir}:`, "m").test(compose))
  fail(`${serviceDir} already exists in ${COMPOSE_FILE}`);
let newCompose = insertBeforeMarker(compose, MARKERS.composeServices, composeBlock, COMPOSE_FILE);
newCompose = insertBeforeMarker(
  newCompose,
  MARKERS.composeGatewayEnv,
  `${constant}_SERVICE_URL: http://${serviceDir}:${port}`,
  COMPOSE_FILE,
);

const baseSql = existsSync(abs(INIT_SQL_FILE))
  ? readText(INIT_SQL_FILE)
  : `-- Runs once, on the first start of an empty Postgres volume\nCREATE DATABASE auth_service;\nCREATE DATABASE test_service;\n${MARKERS.sql}\n`;
const newSql = insertBeforeMarker(
  baseSql,
  MARKERS.sql,
  `CREATE DATABASE ${snake}_service;`,
  INIT_SQL_FILE,
);

// ───────────────────────── كشف أسماء الـ exports من test-service ─────────────────────────
function detect(relative: string, pattern: RegExp, fallback: string): string {
  const file = abs(`${templateRelative}/${relative}`);
  return (existsSync(file) ? pattern.exec(readFileSync(file, "utf8"))?.[1] : undefined) ?? fallback;
}

const routesName = detect("src/routes/index.ts", /export const (\w+)\s*=/, "routes");
const routesHasDefault = existsSync(abs(`${templateRelative}/src/routes/index.ts`))
  ? /export default/.test(readText(`${templateRelative}/src/routes/index.ts`))
  : false;
const relationsName = detect(
  "src/db/relations.ts",
  /export const (\w+)\s*=\s*defineRelations/,
  "relations",
);
const appName = detect("src/app.ts", /export const (\w+)\s*=\s*createApp/, "app");
const defineRelationsImport =
  (existsSync(abs(`${templateRelative}/src/db/relations.ts`))
    ? /import\s*\{[^}]*defineRelations[^}]*\}\s*from\s*["'][^"']+["'];?/.exec(
        readText(`${templateRelative}/src/db/relations.ts`),
      )?.[0]
    : undefined) ?? 'import { defineRelations } from "drizzle-orm";';

// ───────────────────────── dry run ─────────────────────────
console.log(
  `\nNew service: ${serviceDir}  (port ${port}, db ${snake}_service, gateway access: ${access})`,
);
if (values["dry-run"]) {
  console.log(`\n[dry-run] would copy ${templateRelative} → ${targetRelative}, and edit:`);
  for (const file of [REGISTRY_FILE, COMPOSE_FILE, INIT_SQL_FILE, "apps/gateway/.env(.example)"])
    console.log(`  - ${file}`);
  process.exit(0);
}

// ───────────────────────── تنفيذ ─────────────────────────
const created = abs(targetRelative);
const templateDir = abs(templateRelative);

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function write(relativeToService: string, content: string) {
  const full = path.join(created, relativeToService);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, content);
}

function appendEnvLine(relative: string, line: string) {
  if (!existsSync(abs(relative))) return;
  const content = readText(relative);
  const key = line.split("=")[0] ?? line;
  if (new RegExp(`^${key}=`, "m").test(content)) return;
  const eol = content.includes("\r\n") ? "\r\n" : "\n";
  appendFileSync(
    abs(relative),
    `${content === "" || content.endsWith("\n") ? "" : eol}${line}${eol}`,
  );
}

try {
  // 1) نسخ test-service
  cpSync(templateDir, created, {
    recursive: true,
    filter: (source) => {
      const relative = path.relative(templateDir, source).split(path.sep).join("/");
      if (!relative) return true;
      if (SKIP_ANYWHERE.has(path.basename(source))) return false;
      return !SKIP_PATHS.some((skip) => relative === skip || relative.startsWith(`${skip}/`));
    },
  });

  // 2) استبدال الأسماء والبورت
  const replacements: Array<[RegExp, string]> = [
    [/test-service/g, serviceDir],
    [/test_service/g, `${snake}_service`],
    [new RegExp(`\\b${templatePort}\\b`, "g"), String(port)],
  ];
  const TEXT_FILE = /\.(ts|tsx|json|md|ya?ml|sql|mjs|js|example)$/;
  for (const file of walk(created)) {
    if (!TEXT_FILE.test(file) && path.basename(file) !== "Dockerfile") continue;
    let text = readFileSync(file, "utf8");
    for (const [pattern, replacement] of replacements) text = text.replace(pattern, replacement);
    writeFileSync(file, text);
  }

  // 3) ملفات الـ skeleton (من غير domain)
  write(
    "src/routes/index.ts",
    `import { Router } from "express";

export const ${routesName} = Router();
${routesHasDefault ? `\nexport default ${routesName};\n` : ""}
// Mount this service's domain routers here, one file per domain:
//   ${routesName}.use("/<domain>", <domain>Routes);
`,
  );
  write(
    "src/db/schema.ts",
    `// Define this service's tables here (relations go in ./relations.ts).
export {};
`,
  );
  write(
    "src/db/relations.ts",
    `${defineRelationsImport}
import * as schema from "./schema.js";

export const ${relationsName} = defineRelations(schema, () => ({}));
`,
  );
  write(
    "src/app.int.test.ts",
    `import request from "supertest";
import { describe, expect, it } from "vitest";
import { ${appName} } from "./app.js";

const internalSecret = process.env.INTERNAL_SECRET ?? "";

describe("${serviceDir}", () => {
  it("GET /health is public", async () => {
    const res = await request(${appName}).get("/health");
    expect(res.status).toBe(200);
  });

  it("rejects /api requests without the internal secret", async () => {
    const res = await request(${appName}).get("/api/anything");
    expect(res.status).toBe(401);
  });

  it("returns 404 for unknown routes when the secret is valid", async () => {
    expect(internalSecret).not.toBe("");
    const res = await request(${appName}).get("/api/anything").set("x-internal-secret", internalSecret);
    expect(res.status).toBe(404);
  });
});
`,
  );
  for (const dir of ["src/controllers", "src/services", "src/queries", "src/types"]) {
    mkdirSync(path.join(created, dir), { recursive: true });
    if (readdirSync(path.join(created, dir)).length === 0) write(`${dir}/.gitkeep`, "");
  }

  // 4) .env للـ dev بنفس INTERNAL_SECRET بتاع الـ gateway
  const envExample = path.join(created, ".env.example");
  if (existsSync(envExample)) {
    let env = readFileSync(envExample, "utf8");
    const gatewayEnv = abs("apps/gateway/.env");
    const secret = existsSync(gatewayEnv)
      ? /^INTERNAL_SECRET=(.+)$/m.exec(readFileSync(gatewayEnv, "utf8"))?.[1]?.trim()
      : undefined;
    if (secret) env = env.replace(/^INTERNAL_SECRET=.*$/m, `INTERNAL_SECRET=${secret}`);
    writeFileSync(path.join(created, ".env"), env);
  }
} catch (error) {
  rmSync(created, { recursive: true, force: true });
  throw error;
}

// 5) تعديل الـ gateway والـ compose والـ init SQL
writeFileSync(abs(REGISTRY_FILE), newRegistry);
writeFileSync(abs(COMPOSE_FILE), newCompose);
mkdirSync(path.dirname(abs(INIT_SQL_FILE)), { recursive: true });
writeFileSync(abs(INIT_SQL_FILE), newSql);
for (const file of ["apps/gateway/.env.example", "apps/gateway/.env"]) {
  appendEnvLine(file, `${constant}_SERVICE_URL=http://localhost:${port}`);
}

// 6) install
if (!values["skip-install"]) {
  console.log("\n→ pnpm install");
  const result = spawnSync("pnpm", ["install"], { cwd: ROOT, stdio: "inherit", shell: true });
  if (result.status !== 0) console.warn("pnpm install failed. Run it manually.");
}

console.log(`
✔ ${serviceDir} created

Next:
  pnpm db:up && pnpm db:ensure
  pnpm --filter ${serviceDir} typecheck
  # بعد ما تضيف tables في src/db/schema.ts:
  pnpm --filter ${serviceDir} db:generate && pnpm --filter ${serviceDir} db:migrate
  # على سيرفر شغال بالفعل (الـ init SQL بيتنفذ مرة واحدة):
  docker compose exec db createdb -U postgres ${snake}_service
`);
