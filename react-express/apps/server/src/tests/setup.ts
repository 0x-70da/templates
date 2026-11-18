import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

process.env.NODE_ENV = "test";
// أي كود في الـ app بيقرأ DATABASE_URL هيتوجه للـ DB بتاعة الـ tests
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
