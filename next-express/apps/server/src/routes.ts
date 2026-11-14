import { Router } from "express";
// import { xMiddleware } from "./middlewares/x.middleware.js";

const router: Router = Router();

router.use(
  "/test",
  // xMiddleware,
  (await import("./features/test/test.routes.js")).default,
);

export default router;
