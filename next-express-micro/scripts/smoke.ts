// scripts/smoke.ts
// Usage: pnpm smoke [--rate-limit]
// عن طريق الـ client (Next rewrites): SMOKE_BASE_URL=http://localhost:3000 pnpm smoke
try {
  process.loadEnvFile("apps/gateway/.env");
} catch {
  // optional
}

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:4000";
const ORIGIN = process.env.SMOKE_ORIGIN ?? "http://localhost:3000"; // لازم يكون في TRUSTED_ORIGINS
const PROTECTED = process.env.SMOKE_PROTECTED_PATH ?? "/api/test";
const SECRET = process.env.INTERNAL_SECRET;
const TEST_SERVICE_URL = process.env.TEST_SERVICE_URL;

let failures = 0;

async function check(name: string, run: () => Promise<void>): Promise<void> {
  try {
    await run();
    console.log(`✔ ${name}`);
  } catch (error) {
    failures++;
    console.error(`✖ ${name}\n    ${error instanceof Error ? error.message : String(error)}`);
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const authed = (status: number) => status !== 401 && status !== 403 && status < 500;

const call = (path: string, init: RequestInit = {}) => fetch(`${BASE}${path}`, init);
const jsonPost = (path: string, body: unknown) =>
  call(path, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify(body),
  });

const cookieOf = (res: Response) =>
  res.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");

function decodeJwt(token: string): Record<string, unknown> {
  const part = token.split(".")[1];
  if (!part) throw new Error("not a JWT");
  return JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as Record<string, unknown>;
}

const email = `smoke-${Date.now()}@example.com`;
const password = "Smoke-Passw0rd-123";
let cookie = "";
let sessionToken = "";
let jwt = "";

console.log(`Smoke testing ${BASE} (origin ${ORIGIN}, protected path ${PROTECTED})\n`);

await check("gateway is ready (all services up)", async () => {
  const res = await call("/health/ready");
  assert(res.status === 200, `status ${res.status}: ${await res.text()}`);
});

await check("protected route rejects anonymous requests", async () => {
  assert((await call(PROTECTED)).status === 401, "expected 401");
});

await check("forged identity headers do not grant access", async () => {
  const res = await call(PROTECTED, {
    headers: { "x-user-id": "hacker", "x-user-role": "admin", "x-internal-secret": "forged" },
  });
  assert(res.status === 401, `expected 401, got ${res.status}`);
});

await check("sign up sets a session cookie", async () => {
  const res = await jsonPost("/api/auth/sign-up/email", { email, password, name: "Smoke" });
  assert(res.ok, `status ${res.status}: ${await res.text()}`);
  cookie = cookieOf(res);
  assert(cookie, "no Set-Cookie header (check TRUSTED_ORIGINS / BETTER_AUTH_URL)");
});

await check("cookie session reaches the protected route", async () => {
  const res = await call(PROTECTED, { headers: { cookie } });
  assert(authed(res.status), `got ${res.status}`);
});

await check("sign in returns a session token (bearer plugin)", async () => {
  const res = await jsonPost("/api/auth/sign-in/email", { email, password });
  assert(res.ok, `status ${res.status}: ${await res.text()}`);
  sessionToken = res.headers.get("set-auth-token") ?? "";
  assert(sessionToken, "no set-auth-token header (is the bearer plugin enabled?)");
});

await check("token endpoint issues a valid JWT", async () => {
  const res = await call("/api/auth/token", {
    headers: { authorization: `Bearer ${sessionToken}` },
  });
  assert(res.ok, `status ${res.status}: ${await res.text()}`);
  jwt = ((await res.json()) as { token?: string }).token ?? "";
  assert(jwt, "no token in response (is the jwt plugin enabled?)");
  const claims = decodeJwt(jwt);
  const now = Math.floor(Date.now() / 1000);
  assert(typeof claims.sub === "string", "missing sub");
  assert(typeof claims.role === "string", "missing role claim (definePayload)");
  assert(typeof claims.exp === "number" && claims.exp > now && claims.exp - now <= 3600, "bad exp");
  if (process.env.JWT_ISSUER)
    assert(claims.iss === process.env.JWT_ISSUER, `iss is ${String(claims.iss)}`);
  if (process.env.JWT_AUDIENCE)
    assert(claims.aud === process.env.JWT_AUDIENCE, `aud is ${String(claims.aud)}`);
});

await check("JWT reaches the protected route", async () => {
  const res = await call(PROTECTED, { headers: { authorization: `Bearer ${jwt}` } });
  assert(authed(res.status), `got ${res.status}`);
});

await check("tampered JWT is rejected", async () => {
  const [header, payload, signature] = jwt.split(".");
  assert(header && payload && signature, "no JWT to tamper with");
  const flipped = `${signature.slice(0, 10)}${signature[10] === "A" ? "B" : "A"}${signature.slice(11)}`;
  const res = await call(PROTECTED, {
    headers: { authorization: `Bearer ${header}.${payload}.${flipped}` },
  });
  assert(res.status === 401, `expected 401, got ${res.status}`);
});

await check("a session token is not accepted as an API credential", async () => {
  const res = await call(PROTECTED, { headers: { authorization: `Bearer ${sessionToken}` } });
  assert(res.status === 401, `expected 401, got ${res.status}`);
});

await check(
  "service is not callable without the internal secret (or not reachable at all)",
  async () => {
    if (!TEST_SERVICE_URL || !SECRET) return;
    const url = `${TEST_SERVICE_URL}${PROTECTED}`;
    let direct: Response;
    try {
      direct = await fetch(url, { signal: AbortSignal.timeout(3000) });
    } catch {
      return; // مش reachable = ممتاز (Docker)
    }
    assert(direct.status === 401, `no secret: expected 401, got ${direct.status}`);
    const noUser = await fetch(url, { headers: { "x-internal-secret": SECRET } });
    assert(noUser.status === 401, `secret but no user: expected 401, got ${noUser.status}`);
    const withUser = await fetch(url, {
      headers: { "x-internal-secret": SECRET, "x-user-id": "u1" },
    });
    assert(authed(withUser.status), `secret + user: got ${withUser.status}`);
  },
);

if (process.argv.includes("--rate-limit")) {
  // بيقفل /api/auth لمدة دقيقة، فهو opt-in
  await check("auth endpoints are rate limited", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 60; i++) statuses.push((await call("/api/auth/get-session")).status);
    assert(statuses.includes(429), "never got a 429");
  });
}

console.log(failures === 0 ? "\nAll smoke checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
