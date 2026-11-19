import dotenv from "dotenv";

dotenv.config({ path: [".env.test", ".env"], quiet: true });

// قيم افتراضية للـ CI من غير .env (القيم الموجودة في .env بتفضل)
process.env.INTERNAL_SECRET ??= "test-internal-secret-0123456789abcdef";
process.env.PORT ??= "4999";

process.env.BETTER_AUTH_SECRET ??= "test-better-auth-secret-0123456789abcdef";
process.env.BETTER_AUTH_URL ??= "http://localhost:3000";
process.env.TRUSTED_ORIGINS ??= "http://localhost:3000";
process.env.JWT_ISSUER ??= "http://localhost:3000";
process.env.JWT_AUDIENCE ??= "next-express-micro";

process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";
// أي كود بيقرأ DATABASE_URL يتوجه للـ test DB. (?? "" عشان undefined بتتحول لنص "undefined")
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? "";
