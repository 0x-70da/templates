import { Router } from "express";
// import { xMiddleware } from "@/middlewares/x.middleware";

const router: Router = Router();

router.use(
  "/test",
  // xMiddleware,
  (await import("./test.routes.js")).default,
);

export default router;
